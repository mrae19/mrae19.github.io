(function(doc, win){

  'use strict'

  /*
  * @see https://github.com/hesambayat/is-touch-device-javascript
  */
  var istouch = "undefined" !== IS_TOUCH_DEVICE && IS_TOUCH_DEVICE ? true : false;

  /*
  * PaperJS patterns will give your site a colorful and playful look,
  * Users will enjoy to spend more time in the website.
  */
  function pixudio_paper(){

    var scope = doc.getElementById('paper');

    // No paper scope has found
    if ( null === scope ) return;

    // paper has not included.
    if ( 'undefined' === typeof paper ) return;

    function draw(scope, self){

      self = this;
      self.scope = scope;
      self.canvas = scope.querySelector('canvas');
      self.config = win[scope.getAttribute('data-elements')];
      self.drawing = false;
      self.pageScrolling = false;
      self.display = 'desktop';
      self.viewport = {};
      self.mouse = {
        x: 0,
        y: 0,
        limit: .2,
        speed: .00015,
        onmove: false
      };
      self.tilt = {
        min: 40,
        max: -40,
        speed: .002,
        angle: 0,
        direction: 1
      };
      self.setting = {
        deltaX: 0,
        deltaY: 0,
      };

      // mouse move animation
      self.mouseMove = function(event){

        // pause on page scroll
        if ( false !== self.pageScrolling ){
          return;
        }

        // pause if meshes aren’t out there yet
        if ( undefined === self.group || undefined === self.group.children ){
          return;
        }

        for (var i = 0, len = self.group.children.length; i < len; i++) {
          // set new x axis if its in limited radius
          self.setting.deltaX = self.group.children[i].position.x + (( self.mouse.x - self.viewport.x ) * ((i+1) * self.mouse.speed));
          if ( self.setting.deltaX > self.group.children[i].limits.x.min && self.setting.deltaX < self.group.children[i].limits.x.max ) {
            self.group.children[i].position.x = self.setting.deltaX;
          }

          // set new y axis if its in limited radius
          self.setting.deltaY = self.group.children[i].position.y + (( self.mouse.y - self.viewport.y ) * ((i+1) * self.mouse.speed));
          if ( self.setting.deltaY > self.group.children[i].limits.y.min && self.setting.deltaY < self.group.children[i].limits.y.max ) {
            self.group.children[i].position.y = self.setting.deltaY;
          }
        }
      }

      // auto tilt animation
      self.tiltMove = function(event){

        // pause on page scroll
        if ( false !== self.pageScrolling ){
          return;
        }

        // to move up or down
        if ( self.tilt.angle > self.tilt.min ){
          self.tilt.direction = -1;
        } else if ( self.tilt.angle < self.tilt.max ) {
          self.tilt.direction = 1;
        }

        // Move once step ahead
        self.tilt.angle += self.tilt.direction;
        // set Y axis
        for (var i = 0, len = self.group.children.length; i < len; i++) {
          self.group.children[i].position.y += self.tilt.angle * self.tilt.speed * (i+1);
        }
      }

      self.init();
    }

    // helpers

    // shorten for paper.Point
    draw.prototype.point = function(axis, y, self){
      self = this;
      if ( undefined !== y ){
        axis = {
          x: axis,
          y: y
        };
      }
      return new self.paper.Point(axis.x, axis.y);
    }

    // get coordinates from center
    draw.prototype.getCoordinates = function(axis, self){
      self = this;
      return {
        x: self.viewport.x + axis[self.display].x,
        y: self.viewport.y + axis[self.display].y
      }
    }

    // transform to a point
    draw.prototype.translate = function(axis, self){
      self = this;
      return self.point(self.getCoordinates(axis));
    }

    // recognize display size
    draw.prototype.update = function(self){

      self = this;

      if ( false !== self.drawing ){
        return;
      }

      clearTimeout(self.drawing);

      self.paper.view.onFrame = null;
      self.paper.project.activeLayer.removeChildren();

      self.drawing = setTimeout(function(){

        self.display = win.innerWidth < 992 ? 'mobile' : 'desktop';

        self.group = new self.paper.Group();

        self.viewport = {
          x: self.canvas.clientWidth * .5,
          y: self.canvas.clientHeight * .5,
        };

        self.paper.view.viewSize.width = self.canvas.clientWidth;
        self.paper.view.viewSize.height = self.canvas.clientHeight;
        self.paper.view.center = self.point(self.viewport);
        self.group.position = self.paper.view.center;

        self.addChildren();

        self.drawing = false;
      }, 50);
    }

    // recognize the mouse cordination
    draw.prototype.mouseCoordinates = function(e, self){
      self = this;
      clearTimeout(self.mouse.onmove);
      self.mouse.x = e.clientX;
      self.mouse.y = e.clientY;

      if ( true !== istouch ){
        self.mouseMove();
      }

      self.mouse.onmove = setTimeout(function(){
        self.mouse.onmove = false;
      }, 100);
    }

    // set limit radius for meshes
    draw.prototype.updateLimits = function(self, limit){
      self = this;
      for (var i = 0, len = self.group.children.length; i < len; i++) {
        limit = (self.group.children[i].index + 1) / self.mouse.limit;
        self.group.children[i].limits = {
          x: {
            min: self.group.children[i].position.x - limit,
            max: self.group.children[i].position.x + limit
          },
          y: {
            min: self.group.children[i].position.y - limit,
            max: self.group.children[i].position.y + limit
          }
        };
      }

      // run animation
      self.paper.view.onFrame = true !== istouch ? self.tiltMove : null;
    }

    // generate a new triangle
    draw.prototype.triangle = function(config, mesh, self){
      self = this;
      mesh = new self.paper.Path.RegularPolygon(self.translate(config), 3, config[self.display].size);
      mesh.strokeColor = config.strokeColor;
      mesh.strokeWidth = config.strokeWidth;
      mesh.rotate(config.rotate);
      self.group.addChild(mesh);
    }

    // generate a new circle
    draw.prototype.circle = function(config, mesh, self){
      self = this;
      mesh = new self.paper.Path.Circle(self.translate(config), config[self.display].size);
      mesh.strokeColor = config.strokeColor;
      mesh.strokeWidth = config.strokeWidth;
      self.group.addChild(mesh);
    }

    // generate a new wave path
    draw.prototype.wave = function(config, mesh, size, self){
      self = this;
      size = self.getCoordinates(config);
      size.a = config[self.display].size;
      size.b = Math.floor(size.a * 0.5);
      size.c = Math.floor(size.b * 0.5);

      mesh = new self.paper.Path();
      mesh.strokeColor = config.strokeColor;
      mesh.strokeWidth = config.strokeWidth;
      mesh.add(self.point(size.x - size.a, size.y));
      mesh.add(self.point(size.x - size.a, size.y));
      mesh.add(self.point(size.x - size.b, size.y + size.c));
      mesh.add(self.point(size.x, size.y));
      mesh.add(self.point(size.x + size.b, size.y + size.c));
      mesh.add(self.point(size.x + size.a, size.y));
      mesh.smooth({ type: 'catmull-rom', factor: 0.5 });
      mesh.rotate(config.rotate);
      self.group.addChild(mesh);
    }

    draw.prototype.addChildren = function(self){
      self = this;
      for (var i = 0, len = self.config.length; i < len; i++) {
        self[self.config[i].type](self.config[i]);
      }

      self.updateLimits();
    }

    // strat drawing
    draw.prototype.init = function(self){
      self = this;
      self.paper = new paper.PaperScope();
      self.paper.setup(self.canvas);

      // add shapes
      self.update();

      // update if canvas has resized
      self.sensor = new ResizeSensor(self.scope, function(){
      	self.update();
      });

      // disable animations on window scroll event
      win.addEventListener('scroll', function(e){
        clearTimeout(self.pageScrolling);
        self.pageScrolling = setTimeout(function(){
          self.pageScrolling = false;
        }, 25);
      }, false);

      // start mouse animation on mouse move event
      doc.addEventListener('mousemove', function(e){
        self.mouseCoordinates(e);
      }, false);
    }

    // go
    var ctx = new draw(scope);
  }

  /*
  * This touch enabled plugin lets you create a beautiful responsive carousel slider.
  */
  function pixudio_carousel(){

    var carousel = doc.querySelectorAll('.carousel');

    // No carousel has found
    if ( null === carousel || 0 === carousel.length ) return;

    // Siema has not included.
    if ( 'undefined' === typeof Siema ) return;

    // handle carousel auto height
    function resize(self) {
      self.selector.style.height = Math.ceil(self.innerElements[self.currentSlide].clientHeight) + 'px';
    }

    // auto play
    function next(self){
      clearTimeout(self.autoPlayTimeout);
      self.autoPlayTimeout = setTimeout(function () {
        if ( true === self.config.loop ){
          self.next();
        } else {
          if ( self.currentSlide >= self.innerElements.length - 1 ){
            self.goTo(self.config.startIndex);
            update(self);
          } else {
            self.next();
          }
        }
      }, self.config.autoplay || 3000);
    }

    // handle carousel and its items classes
    function update(self, parent, cite){

      self = self || this;
      parent = self.selector.parentElement;
      cite = self.innerElements[self.currentSlide].querySelector('cite');

      // recognise slide direction
      if ( self.lastSlide > self.currentSlide ){
        classie.add(parent, 'carousel--reverse');
      } else {
        classie.remove(parent, 'carousel--reverse');
      }
      self.lastSlide = self.currentSlide;

      // remove all active classes
      for (var i = 0, len = self.innerElements.length; i < len; i++) {
        classie.remove(self.innerElements[i], 'carousel__item--active');
        if ( 0 < self.dotElements.length ){
          classie.remove(self.dotElements[i], 'active');
        }
        if ( null !== cite ){
          classie.remove(self.innerElements[i].querySelector('cite'), 'in-view__child--in');
        }
      }

      // add active class to current slide
      classie.add(self.innerElements[self.currentSlide], 'carousel__item--active');
      if ( 0 < self.dotElements.length ){
        classie.add(self.dotElements[self.currentSlide], 'active');
      }

      setTimeout(function(){
        if ( null !== cite ){
          classie.add(cite, 'in-view__child--in');
        }
      }, self.config.duration);

      // reset
      classie.remove(parent, 'carousel--on-first');
      classie.remove(parent, 'carousel--on-last');

      // if first item is active
      if ( false === self.config.loop && 0 === self.currentSlide ){
        classie.add(parent, 'carousel--on-first');
      }

      // if last item is active
      if ( false === self.config.loop && self.innerElements.length - 1 === self.currentSlide ){
        classie.add(parent, 'carousel--on-last');
      }

      // parent auto height
      resize(self);

      // next
      next(self);
    }

    // handle next, prev actions
    function init(self, parent, next, prev, emit){

      self = this;
      parent = self.selector.parentElement;
      self.lastSlide = self.currentSlide;
      self.dotElements = [];
      self.dots = parent.querySelector('.carousel__dots');
      prev = parent.querySelector('.carousel__prev');
      next = parent.querySelector('.carousel__next');

      // go prev
      if ( null !== prev ) {
        prev.addEventListener('click', function(){
          self.prev();
        });
      }

      // go next
      if ( null !== next ) {
        next.addEventListener('click', function(){
          self.next();
        });
      }

      // generate dots
      if ( null !== self.dots && false === self.config.loop ) {
        for (var i = 0, len = self.innerElements.length; i < len; i++) {

          var dot = doc.createElement('span');

          dot.slideTarget = i;

          if ( i === self.currentSlide ){
            classie.add(dot, 'active');
          }

          dot.style.transition = 'all 0.6s 0.' + ( i + 2 ) + 's cubic-bezier(0.68, -1, 0.27, 2)';

          self.dotElements.push(dot);
          self.dots.appendChild(dot);

          dot.addEventListener('click', function(){
            self.goTo(this.slideTarget);
            update(self);
          });
        }
      }

      // on window resize
      win.addEventListener('resize', function(){

        classie.add(parent, 'carousel--resizing');
        clearTimeout(emit);
        emit = setTimeout(function(){
          resize(self);
          classie.remove(parent, 'carousel--resizing');
        }, 200)
      }, false);

      // on carousel__item resize
      for (var i = 0, len = self.innerElements.length; i < len; i++) {
        self.innerElements[i].resizeSensor = new ResizeSensor(self.innerElements[i], function(){
          resize(self);
        });
      }

      update(self);

      classie.add(parent, 'carousel--init');
    }

    // go
    for (var i = 0, len = carousel.length; i < len; i++) {
      carousel[i].siema = new Siema({
        selector: carousel[i].querySelector('.carousel__frame'),
        duration: 500,
        easing: 'ease',
        perPage: 1,
        draggable: true,
        threshold: 100,
        autoplay: 3000,
        onInit: init,
        onChange: update,
      });
    }
  }

  /*
  * Scroll to, this plugin will trigger as soon as user clicks on a hashtag link
  * like href="#page", it looks up for that id in a same page and if its availbe
  * it scrolls the page to the id point, otherwise will ignore the action.
  * Home page navigation also uses this very same plugin, as one page websites,
  * that scrolled through eternity, with a sticky anchor link header at the top,
  * almost became the standard way of doing home pages.
  */
  function pixudio_scrollTo(){

    var anchors = doc.querySelectorAll('a[href^="#"]:not([href="#"])');

    // No inner page link has found
    if ( null === anchors || 0 === anchors.length ) return;

    // animateScrollTo has not included.
    if ( 'undefined' === typeof animateScrollTo ) return;

    for (var i = 0, len = anchors.length; i < len; i++) {

      anchors[i].addEventListener('click', function(target, rect){

        target = doc.querySelector(this.hash);

        // No target has found
        if ( null === target || 0 === target.length ) return;

        rect = target.getBoundingClientRect();

        // go
        animateScrollTo(rect.top + win.pageYOffset || 0, {cancelOnUserAction: false});

      }, false);
    }
  }

  /*
  * Side menus, We are using this to display mobile menu, it also interact with
  * touch events as well, although you might use it for displaying widget or something else.
  */
  function pixudio_sideMenu(){

    // default options
    var self = {
      opened: false,
      trigger: doc.querySelectorAll('.side-menu-trigger'),
      swipeable: doc.querySelectorAll('.side-menu-swipeable'),
      sidemenu: doc.querySelector('.site-sidenav__elements'),
      overlay: doc.querySelector('.site-sidenav__overlay'),
      sidemenuitems: doc.querySelectorAll('.site-sidenav__elements a'),
      classes: {
        active: 'side-menu',
        display: 'side-menu--display',
        avoid: 'side-menu-trigger'
      }
    };

    // No element has found.
    if ( null === self.sidemenu || 0 === self.sidemenu.length ) return;

    // display side-menu after 50ms
    function open(){
      if ( false === self.opened ) {
        classie.add(doc.documentElement, self.classes.active);
        setTimeout(function(){
          classie.add(doc.documentElement, self.classes.display);
          self.opened = true;
        }, 50);
      }
    }

    // hide side-menu after 300ms
    function close(){
      if ( true === self.opened ) {
        classie.remove(doc.documentElement, self.classes.display);
        setTimeout(function(){
          classie.remove(doc.documentElement, self.classes.active);
          self.opened = false;
        }, 300);
      }
    }

    // let’s user can close the menu with swipping
    function swipe(){

      // Hammer has not included.
      if ( 'undefined' === typeof Hammer ) return;

      for (var i = 0, len = self.swipeable.length; i < len; i++) {

        var now = 0,
            max = self.sidemenu.clientWidth,
            handle = new Hammer(self.swipeable[i]);

        handle.on('panstart', function(e){
          classie.add(doc.documentElement, 'side-menu--panning')
        });

        // all out when swipe to the left
        handle.on('swipeleft', close);

        // check how much user has swipped
        handle.on('panright panleft', function(e){

          now = now + ( 4 === e.direction ? Math.round( Math.max( 3, e.velocity ) ) : Math.round( Math.min( -3, e.velocity ) ) );

          if ( now > 0 ){
            now = 0;
          }

          if ( Math.abs(now) > max ){
            now = max * -1;
          }

          self.overlay.style.opacity = 1 + now * 1 / max;

          self.sidemenu.style.webkitTransform = 'translateX(' + now + 'px)';
          self.sidemenu.style.transform = 'translateX(' + now + 'px)';
        });

        // close / reset sidemenu status
        handle.on('panend pancancel', function(e){

          classie.remove(doc.documentElement, 'side-menu--panning');

          if ( Math.abs(now) > max * 0.5 ){
            close();
          }

          self.overlay.style.opacity = '';

          self.sidemenu.style.webkitTransform = '';
          self.sidemenu.style.transform = '';
          now = 0;
        });
      }
    }

    // activate swipe to close mode
    if (0 < self.swipeable.length) {
      swipe();
    }

    // close side-menu
    doc.addEventListener('click', function(e){
      if ( true === self.opened && e.pageX > self.sidemenu.clientWidth &&
           false === classie.has(e.target, self.classes.avoid) ) {

        close();
      }
    }, false);

    // close side-menu if user click on side-menu nav items
    if ( null !== self.sidemenuitems && 0 < self.sidemenuitems.length ){
      for (var i = 0, len = self.sidemenuitems.length; i < len; i++) {
        self.sidemenuitems[i].addEventListener('click', close , false);
      }
    }

    // open side-menu
    if ( null !== self.trigger &&  0 < self.trigger.length ){
      for (var i = 0, len = self.trigger.length; i < len; i++) {
        self.trigger[i].addEventListener('click', open, false);
      }
    }
  }

  /*
  * Spot an element (scope) when it’s on users viewport,
  * After each scope is spotted, it will be check if it has include childrens -
  * those assigned to be specified by a class.
  */
  function pixudio_inView(scope){

    scope = doc.getElementsByClassName('in-view');

    // No element has found.
    if ( null === typeof scope || 0 === scope.length ) return;

    // Waypoint has not included.
    if ( 'undefined' === typeof Waypoint ) return;

    // default options
    // checkout @waypoints to find out how ”offset” is working http://imakewebthings.com/waypoints/api/offset-option/
    var options = {
      offset: '80%',
      delay: 200,
      classes: {
        child: 'in-view__child',
        scope_in: 'in-view--in',
        child_in: 'in-view__child--in'
      }
    };

    // add class into elements
    function add(el, className, delay){

      setTimeout(function(){
        classie.add(el, className);
      }, delay);
    }

    // attach waypoint into each scope
    for (var i = 0, len = scope.length; i < len; i++) {

      var waypoint = new Waypoint({
        element: scope[i],
        handler: function(direction) {

          var children = this.element.getElementsByClassName(options.classes.child);

          // check if this scope has any child that should specified as inview element
          if ( 0 < children.length ){
            for (var i = 0, len = children.length; i < len; i++) {
              add(children[i], options.classes.child_in, options.delay * (i + 1));
            }
          }

          // add class to the scope
          add(this.element, options.classes.scope_in, 0);

          // trigger inview only once
          this.destroy();
        },
        offset: scope[i].getAttribute('data-offset') || options.offset
      });
    }
  }

  /*
  * Fixed headers are a popular approach for keeping the primary navigation in
  * close proximity to the user. This can reduce the effort required for a user to
  * quickly navigate a site. @see http://wicky.nillia.ms/headroom.js/
  */
  function pixudio_stickyHeader(el, headroom){

    el = doc.getElementById('masthead');

    // No element has found.
    if ( null === typeof el || 0 === el.length ) return;

    // Headroom has not included.
    if ( 'undefined' === typeof Headroom ) return;

    // construct an instance of Headroom, passing the element
    headroom = new Headroom(el, {
      offset: el.clientHeight || 120
    });
    // initialise
    headroom.init();
  }

  /*
  * Easy access to the top of the page when user scrolls down more than viewport height.
  * quickly navigate a site. @see http://wicky.nillia.ms/headroom.js/
  */
  function pixudio_goUp(el, headroom){

    el = doc.getElementById('up');

    // No element has found.
    if ( null === typeof el || 0 === el.length ) return;

    // Headroom has not included.
    if ( 'undefined' === typeof Headroom ) return;

    // construct an instance of Headroom, passing the element
    headroom = new Headroom(el, {
      offset: win.innerHeight
    });
    // initialise
    headroom.init();
  }

  /*
  * Tabs enable content organization at a high level, such as switching between views,
  * data sets, or functional aspects of a content.
  */
  function pixudio_tabs(tabs){

    tabs = doc.querySelectorAll('.tabs');

    // No element has found.
    if ( null === typeof tabs || 0 === tabs.length ) return;

    function off(target, tab, elems, assignedTab){

      if ( true === classie.has(target, 'tabs__nav--active') ){
        return;
      }

      assignedTab = tab.querySelector('.tabs__item[data-tab="'+ target.getAttribute('data-tab') +'"]' );

      if ( null === assignedTab || 0 === assignedTab.length ) {
        return;
      }

      for (var i = 0, len = elems.length; i < len; i++) {
        classie.remove(elems[i], 'tabs__nav--active');
        classie.remove(elems[i], 'tabs__item--active');
        elems[i].setAttribute('tabindex', '-1');
        elems[i].setAttribute('aria-selected', 'false');
      }

      classie.add(target, 'tabs__nav--active');
      target.setAttribute('tabindex', '0');
      target.setAttribute('aria-selected', 'true');
      classie.add(assignedTab, 'tabs__item--active');
      assignedTab.setAttribute('tabindex', '0');
      assignedTab.setAttribute('aria-selected', 'true');
    }

    function apply(tab, nav, elems){
      nav = tab.querySelectorAll('.tabs__nav');
      elems = tab.querySelectorAll('[data-tab]');

      for (var i = 0, len = nav.length; i < len; i++) {

        // add event listener
        nav[i].addEventListener('click', function(){
          off(this, tab, elems);
        }, false);
      }
    }

    for (var i = 0, len = tabs.length; i < len; i++) {
      apply(tabs[i]);
    }
  }

  /*
  * Instafeed is a dead-simple way to add Instagram photos to your website.
  */
  function pixudio_instafeed(feed){

    // Instafeed has not included.
    if ( 'undefined' === typeof Instafeed ) return;

    feed = doc.getElementById('instafeed');

    // No element has found.
    if ( null === feed ) return;

    function apply(feed, request, config, list){

      config = feed.getAttribute('data-config');

      if ( null === config
        || undefined === win[config]
        || undefined === win[config].userId
        || undefined === win[config].accessToken ) return;

      request = new Instafeed({
        get: "user",
        userId: win[config].userId,
        accessToken: win[config].accessToken,
        limit: win[config].limit || 6,
        resolution: win[config].resolution || 'standard_resolution',
        template: '<figure class="instagram-feed__item lazyload--el lazyload" data-bg="{{image}}"></figure>',
        error: function(e) {
          console.warn('Instagram feed warning:', e);
        },
        success: function(e) {
          // console.log('Data type could be one of "Image", "Video" or "Carousel"...', e.data);
        },
      });
      request.run();
    }

    apply(feed);
  }

  /*
  * Masonry works by placing elements in optimal position based on available vertical space,
  * sort of like a mason fitting stones in a wall.
  */
  function pixudio_masonry(grid){

    grid = doc.querySelectorAll('.masonry');

    // No element has found.
    if ( null === typeof grid || 0 === grid.length ) return;

    // Masonry has not included.
    if ( 'undefined' === typeof Masonry ) return;

    function laidOut(msnry){
      setTimeout(function(){
        msnry.layout();
      }, 0);
    }

    for (var i = 0, len = grid.length; i < len; i++) {
      var msnry = new Masonry(grid[i], {
        // options
        itemSelector: '.masonry-item',
        // use element for option
        columnWidth: '.masonry-item',
        horizontalOrder: true,
        percentPosition: true
      });

      msnry.once('layoutComplete', function(items, counter, cols, options){

        counter = 0;
        cols = items[0].layout.cols;

        // checkout @waypoints to find out how ”offset” is working http://imakewebthings.com/waypoints/api/offset-option/
        options = {
          offset: '80%',
          delay: 200,
          classes: {
            scope_in: 'indexed-list__in-view--in',
          }
        };

        // add class into elements
        function add(el, className, delay){

          setTimeout(function(){
            classie.add(el, className);
          }, delay);
        }

        // attach waypoint into each scope
        for (var i = 0, len = items.length; i < len; i++) {

          items[i].element.inViewDelay = counter * options.delay;

          counter++;

          if ( counter === cols ) counter = 0; // reset counter

          var waypoint = new Waypoint({
            element: items[i].element,
            handler: function(direction) {

              // add class to the scope
              add(this.element.querySelector('.indexed-list__in-view'), options.classes.scope_in, this.element.inViewDelay);

              // trigger inview only once
              this.destroy();
            },
            offset: options.offset
          });
        }
      });

      // go
      laidOut(msnry);
    }
  }

  /*
  * Mediabox is a essential way to offering embedded youtube and vimeo videos to users,
  * You can simply include it to any link, and lets users to decide what video they are
  * attempt to watch.
  */
  function pixudio_mediabox(popup){

    popup = doc.querySelectorAll('.video-popup');

    // No element has found.
    if ( null === typeof popup || 0 === popup.length ) return;

    // MediaBox has not included.
    if ( 'undefined' === typeof MediaBox ) return;

    // go
    MediaBox('.video-popup');
  }

  /*
  * Lazyload videos sources, this helps to increase site performance.
  */
  function pixudio_lazysource(video, sources){

    video = doc.querySelectorAll('[data-sources]');

    // No element has found.
    if ( null === typeof video || 0 === video.length ) return;

    // go
    for (var i = 0, len = video.length; i < len; i++) {
      try {
        sources = video[i].getAttribute('data-sources').split('|');
        for (var ii = 0, ilen = sources.length; ii < ilen; ii++) {
          var source = doc.createElement('source');
          video[i].appendChild(source);
          source.src = sources[i];
        }
        video[i].removeAttribute('data-sources');
        video[i].load();
      } catch (e) {
        console.warn(e);
      }
    }
  }
  /*
  * Fires when the initial HTML document has been completely loaded and parsed,
  * without waiting for stylesheets, images, and subframes to finish loading.
  */
  function pixudio_init(){

    // add “is-touch” class to html tag if browser's touch APIs implemented,
    // whether or not the current device has a touchscreen.
    if ( true === istouch ){
      classie.add(doc.documentElement, 'is-touch');
    }

    // Setup “paperJS”
    setTimeout(pixudio_paper, 0);

    // Setup “carousel”
    setTimeout(pixudio_carousel, 0);

    // Setup “scroll to”
    setTimeout(pixudio_scrollTo, 0);

    // Setup “side menu”
    setTimeout(pixudio_sideMenu, 0);

    // Setup “in view”
    setTimeout(pixudio_inView, 0);

    // Setup “sticky header”
    setTimeout(pixudio_stickyHeader, 0);

    // Setup “go up”
    setTimeout(pixudio_goUp, 0);

    // Setup “tabs”
    setTimeout(pixudio_tabs, 0);

    // Setup “instagram feed”
    setTimeout(pixudio_instafeed, 0);

    // Setup "masonry"
    setTimeout(pixudio_masonry, 0);

    // Setup "mediabox"
    setTimeout(pixudio_mediabox, 0);

    // Setup "lazy source"
    setTimeout(pixudio_lazysource, 0);
  }

  /*
  * Fires when a resource and its dependent resources have finished loading.
  */
  function pixudio_onload(){

    // add “loaded” class to html tag,
    classie.add(doc.documentElement, 'loaded');
  }
  win.addEventListener('load', pixudio_onload);

  // trigger on document.ready scripts
  pixudio_init();

})(document, window);
