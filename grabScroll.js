/*
 *	Project: simpleSlideShow
 *	Description: please do not use it, this is only an exercise
 *	Author: gaspard
 *	License: WTFPL
 */

;(function ( $, window, document, undefined ) {

	var that = this, // todo : do i use this ?, send douglas a postcard
		pluginName = 'grabScroll',
		defaults = {
			time: 5000,
			distance: null,
			graber: null,
			section: 'section',
			sectionHeight: 'full',
			snapping: true,
			snapSpeed: 500,
			snapInterval: 100,
			snapStickyInterval: 10, // stick immediately
			onScroll: function(){},
			onSnapComplete: function(){},
			onWindowEnter: function(){}
		},
		$w = $(window),
		animated = false, // animated
		s = 0, // scroll amount
		t = null, // timeout
		$sections = [];
		offset = [];

	// The actual plugin constructor
	var GrabScroll = function( element, options ) {
		this.element = element;

		// jQuery's extend method
		this.options = $.extend( {}, defaults, options );

		this._defaults = defaults;
		this._name = pluginName;

		this.init();
	}

	GrabScroll.prototype = {
		init: function() {
			this._setSectionHeight();
			this._setOffset();
			
			s = 4;
			console.log(this.options)
			
			/*
			 as I am listening the $w(indow) element, 
			 i will loose context while calling this._onScroll
			 i have $w easily catchable from cache wherever i need it
			 that's why I cache this to that then bind it
			 */
			var that = this;
			$w.on('scroll', this._onScroll.bind(that) );
			$w.on('resize', this._onResize.bind(that) );
			
		},
		_setSectionHeight: function(){
			if(this.options.sectionHeight == 'full')
				this.options.sectionHeight = $(window).height();
			$sections =
				$(this.options.section).css({'height':this.options.sectionHeight});
		},
		_setOffset: function(){
			$.each($sections, function(i){
				offset[i] = $(this).offset();
			});
		},
		/**
		 * Window scroll event handler
		 * @return null
		 */
		_onScroll : function(){
			s = $w.scrollTop();
			this._onScrollEnd();
//			_snapWindow();

			this.options.onScroll({s:s,sections:$sections});
			
			// notify on new window entering
			$.each($sections, function(i){
				var $this = $(this.options); //,
//				console.log($this.offset().top)
/*					isOnScreen = $this.isOnScreen();
				if(isOnScreen){
					if(!$this.data('onScreen')) options.onWindowEnter($this);
				}
				$this.data('onScreen', isOnScreen);
*/
			});

		},
		/**
		 * detects when the scroll ends
		 * a scroll end is when it hasn't been moved by manual scroll
		 * a scroll end is when it hasn't been moved by auto scroll
		 */
		_onScrollEnd : function(){
			// clear timeout if exists
			if(t){clearTimeout(t);}
			
			s = $w.scrollTop();
			t = window.setTimeout(function(previousScrollTop){
				animated = this._hasItBeenScrolling(s)
				this._snapSection();
			}.bind(this,s),100);
		},
		_hasItBeenScrolling : function(previousScrollTop){
			console.log(previousScrollTop)
			return previousScrollTop != $w.scrollTop();
		},
		_snapSection : function(){
			//  this is shit shit shit

			//		console.log($sections[1].offset().top)
			// caching options
			var options = this.options,
				that = this;
			$.each($sections, function(i){
				
				if(s == offset[i].top)
					return;

				// if I am really close, stick immediately
				if(
					Math.abs(s - offset[i].top) < options.snapStickyInterval // reminder: offset is a global
					&& !animated // there is no animation running
				){ 
					$("html, body").scrollTop(offset[i].top);
					console.log('I immediately sticked !, not animated (',animated,')');
					return;
				}

				// if I am in the vincinity, 
				if(Math.abs(s-offset[i].top) < options.snapInterval){
					
					// cache this section
					var currentSection = this;
					console.log('I should animate',options.snapSpeed)
					that._animateTo(i,currentSection,options)
					/*$('html:not(:animated),body:not(:animated)')
						.animate(
							{scrollTop: 0}, 
							options.snapSpeed
						);
					*/
				}
			});
/*
			// check for when user has stopped scrolling, & do stuff
			if(this.options.snapping){

					var $visibleWindow = _getCurrentWindow(), // visible window
						scrollTo = $visibleWindow.offset().top, // top of visible window
						completeCalled = false;
					// animate to top of visible window
					$('html:not(:animated),body:not(:animated)')
						.animate(
							{scrollTop: scrollTo}, 
							options.snapSpeed, 
							function(){
								if(!completeCalled){
									if(t){clearTimeout(t);}
									t = null;
									completeCalled = true;
									options.onSnapComplete($visibleWindow);
								}
							}
					);
				}, options.snapInterval);
			} // options.snapping
*/
		},
		_animateTo: function(j,el,options){
			if(!animated){
				animated = true;
				$('html:not(:animated),body:not(:animated)')
					.animate(
						{scrollTop: offset[j].top}, 
						options.snapSpeed, 
						'linear',
						function(){
							if(t){clearTimeout(t);}
							t = null;
							animated = false;
							options.onSnapComplete(el);
						}
				);
			}
		},
		_onResize: function(){
			this._setSectionHeight();
			this._setOffset();
			console.log($(window).height(),offset);
			
			// snap ?
		}

	};
	


	///////
    


/*    var _onResize = function(){
		// i am resized
        _snapWindow();
    };
*/

    var _snapWindow = function(){
        // clear timeout if exists
        if(t){clearTimeout(t);}
        // check for when user has stopped scrolling, & do stuff
        if(this.options.snapping){
            t = setTimeout(function(){
                var $visibleWindow = _getCurrentWindow(), // visible window
                    scrollTo = $visibleWindow.offset().top, // top of visible window
                    completeCalled = false;
                // animate to top of visible window
                $('html:not(:animated),body:not(:animated)').animate({scrollTop: scrollTo }, options.snapSpeed, function(){
                    if(!completeCalled){
                        if(t){clearTimeout(t);}
                        t = null;
                        completeCalled = true;
                        options.onSnapComplete($visibleWindow);
                    }
                });
            }, options.snapInterval);
        }
    };
	////////





	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new GrabScroll( this, options ));
			}
		});
	};

})( jQuery, window, document );