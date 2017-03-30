(function(d,c,a,e){var b=function(g,f){this.elem=g;this.$elem=d(g);
  this.options=f;this.metadata=this.$elem.data("plugin-options");
  this.$win=d(c);
  this.sections={};
  this.didScroll=false;
  this.$doc=d(a);
  this.docHeight=this.$doc.height()};
  b.prototype={defaults:{navItems:"a",currentClass:"current",changeHash:false,easing:"swing",filter:"",scrollSpeed:750,scrollThreshold:0.5,begin:false,end:false,scrollChange:false},init:function(){this.config=d.extend({},this.defaults,this.options,this.metadata);
  this.$nav=this.$elem.find(this.config.navItems);
  if(this.config.filter!==""){this.$nav=this.$nav.filter(this.config.filter)}this.$nav.on("click.onePageNav",d.proxy(this.handleClick,this));
  this.getPositions();
  this.bindInterval();
  this.$win.on("resize.onePageNav",d.proxy(this.getPositions,this));
  return this},adjustNav:function(f,g){f.$elem.find("."+f.config.currentClass).removeClass(f.config.currentClass);
  g.addClass(f.config.currentClass)},bindInterval:function(){var g=this;var f;g.$win.on("scroll.onePageNav",function(){g.didScroll=true});
  g.t=setInterval(function(){f=g.$doc.height();
    if(g.didScroll){g.didScroll=false;g.scrollChange()}if(f!==g.docHeight){g.docHeight=f;g.getPositions()}},250)},getHash:function(f){return f.attr("href").split("#")[1]},getPositions:function(){var h=this;var i;var g;var f;h.$nav.each(function(){i=h.getHash(d(this));
    f=d("#"+i);
  if(f.length){g=f.offset().top;h.sections[i]=Math.round(g)}})},getSection:function(i){var f=null;var h=Math.round(this.$win.height()*this.config.scrollThreshold);
    for(var g in this.sections){if((this.sections[g]-h)<i){f=g}}return f},handleClick:function(j){var g=this;var f=d(j.currentTarget);
    var i=f.parent();
  var h="#"+g.getHash(f);
  if(!i.hasClass(g.config.currentClass)){if(g.config.begin){g.config.begin()}g.adjustNav(g,i);
  g.unbindInterval();
  g.scrollTo(h,function(){if(g.config.changeHash){c.location.hash=h}g.bindInterval();
    if(g.config.end){g.config.end()}})}j.preventDefault()},scrollChange:function(){var h=this.$win.scrollTop()-190;
    var f=this.getSection(h);
  var g;if(f!==null){g=this.$elem.find('a[href$="#'+f+'"]').parent();
  if(!g.hasClass(this.config.currentClass)){this.adjustNav(this,g);
    if(this.config.scrollChange){this.config.scrollChange(g)}}}},scrollTo:function(f,h){
      var g=d(f).offset().top;
      g = g-80;
      d("html, body").animate({scrollTop:g},this.config.scrollSpeed,this.config.easing,h)
    },unbindInterval:function(){
      clearInterval(this.t);
      this.$win.unbind("scroll.onePageNav");
    }
    };b.defaults=b.prototype.defaults;d.fn.onePageNav=function(f){return this.each(function(){new b(this,f).init()})}})(jQuery,window,document);


// Sticky Plugin v1.0.0 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 2/14/2011
// Date: 2/12/2012
// Website: http://labs.anthonygarand.com/sticky
// Description: Makes an element on the page stick on the screen as you scroll
//       It will only set the 'top' and 'position' of your element, you
//       might need to adjust the width in some cases.

(function($) {
  var defaults = {
      topSpacing: 0,
      bottomSpacing: 0,
      className: 'is-sticky',
      wrapperClassName: 'sticky-wrapper',
      center: false,
      getWidthFrom: '',
      responsiveWidth: false
    },
    $window = $(window),
    $document = $(document),
    sticked = [],
    windowHeight = $window.height(),
    scroller = function() {
      var scrollTop = $window.scrollTop(),
        documentHeight = $document.height(),
        dwh = documentHeight - windowHeight,
        extra = (scrollTop > dwh) ? dwh - scrollTop : 0;

      for (var i = 0; i < sticked.length; i++) {
        var s = sticked[i],
          elementTop = s.stickyWrapper.offset().top,
          etse = elementTop - s.topSpacing - extra;

        if (scrollTop <= etse) {
          if (s.currentTop !== null) {
            s.stickyElement
              .css('position', '')
              .css('top', '');
            s.stickyElement.trigger('sticky-end', [s]).parent().removeClass(s.className);
            s.currentTop = null;
          }
        }
        else {
          var newTop = documentHeight - s.stickyElement.outerHeight()
            - s.topSpacing - s.bottomSpacing - scrollTop - extra;
          if (newTop < 0) {
            newTop = newTop + s.topSpacing;
          } else {
            newTop = s.topSpacing;
          }
          if (s.currentTop != newTop) {
            s.stickyElement
              .css('position', 'fixed')
              .css('top', newTop);

            if (typeof s.getWidthFrom !== 'undefined') {
              s.stickyElement.css('width', $(s.getWidthFrom).width());
            }

            s.stickyElement.trigger('sticky-start', [s]).parent().addClass(s.className);
            s.currentTop = newTop;
          }
        }
      }
    },
    resizer = function() {
      windowHeight = $window.height();

      for (var i = 0; i < sticked.length; i++) {
        var s = sticked[i];
        if (typeof s.getWidthFrom !== 'undefined' && s.responsiveWidth === true) {
          s.stickyElement.css('width', $(s.getWidthFrom).width());
        }
      }
    },
    methods = {
      init: function(options) {
        var o = $.extend({}, defaults, options);
        return this.each(function() {
          var stickyElement = $(this);

          var stickyId = stickyElement.attr('id');
          var wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName
          var wrapper = $('<div></div>')
            .attr('id', stickyId + '-sticky-wrapper')
            .addClass(o.wrapperClassName);
          stickyElement.wrapAll(wrapper);

          if (o.center) {
            stickyElement.parent().css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
          }

          if (stickyElement.css("float") == "right") {
            stickyElement.css({"float":"none"}).parent().css({"float":"right"});
          }

          var stickyWrapper = stickyElement.parent();
          stickyWrapper.css('height', stickyElement.outerHeight());
          sticked.push({
            topSpacing: o.topSpacing,
            bottomSpacing: o.bottomSpacing,
            stickyElement: stickyElement,
            currentTop: null,
            stickyWrapper: stickyWrapper,
            className: o.className,
            getWidthFrom: o.getWidthFrom,
            responsiveWidth: o.responsiveWidth
          });
        });
      },
      update: scroller,
      unstick: function(options) {
        return this.each(function() {
          var unstickyElement = $(this);

          var removeIdx = -1;
          for (var i = 0; i < sticked.length; i++)
          {
            if (sticked[i].stickyElement.get(0) == unstickyElement.get(0))
            {
                removeIdx = i;
            }
          }
          if(removeIdx != -1)
          {
            sticked.splice(removeIdx,1);
            unstickyElement.unwrap();
            unstickyElement.removeAttr('style');
          }
        });
      }
    };

  // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
  if (window.addEventListener) {
    window.addEventListener('scroll', scroller, false);
    window.addEventListener('resize', resizer, false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', scroller);
    window.attachEvent('onresize', resizer);
  }

  $.fn.sticky = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }
  };

  $.fn.unstick = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method ) {
      return methods.unstick.apply( this, arguments );
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky');
    }

  };
  $(function() {
    setTimeout(scroller, 0);
  });
})(jQuery);
