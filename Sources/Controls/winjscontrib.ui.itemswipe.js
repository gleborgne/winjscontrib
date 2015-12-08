//this is a blank WinJS control structure. It's intended to use as a startup for new controls

(function () {
	'use strict';
	WinJS.Namespace.define("WinJSContrib.UI", {	
	    ItemSwipe: WinJS.Class.mix(WinJS.Class.define(
            /**
             * @classdesc 
             * enable cross swipe on list items to trigger actions by swiping item
             * @class WinJSContrib.UI.ItemSwipe
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function ctor(element, options) {
	        var ctrl = this;
			this.element = element || document.createElement('DIV');
			options = options || {};
			this.element.winControl = this;
			this.element.classList.add('mcn-itemswipe');
			this.element.classList.add('win-disposable');
			this.minSwipe = 100;
			this.thresholdFactor = 3;
			this.hoverDelay = 600;
			this.faceCard = this.element.querySelector(".face");
			this.swipeToLeftCard = this.element.querySelector(".swipe-to-left");
			this.swipeToRightCard = this.element.querySelector(".swipe-to-right");

			WinJS.UI.setOptions(this, options);

			this.eventTracker = new WinJSContrib.UI.EventTracker();
			if (this.faceCard) {
			    this.swipeslide = new WinJSContrib.UI.SwipeSlide(this.faceCard, {
			        capturePointerOnDown: true,
                    touchOnly : true,
			        minSwipeDistance : ctrl.minSwipe
			    });

			    if (!ctrl.swipeToLeftCard) {
			        this.swipeslide.allowed.left = false;
			    }

			    if (!ctrl.swipeToRightCard) {
			        this.swipeslide.allowed.right = false;
			    }

			    this.eventTracker.addEvent(this.element, "pointermove", function (arg) {
			        if (arg.pointerType == "mouse") {
			            ctrl.element.classList.add("mousehover");
			            clearTimeout(ctrl.hoverTimeout);
			            ctrl.hoverTimeout = setTimeout(function () {
			                if (ctrl.element)
			                    ctrl.element.classList.remove("mousehover");
			            }, ctrl.hoverDelay);
			        }
			    }, true);

			    this.eventTracker.addEvent(this.swipeslide, "swipestart", function (arg) {
			        ctrl._processSwipeStart(arg);
			    });

			    this.eventTracker.addEvent(this.swipeslide, "swipeend", function (arg) {
			        ctrl._cleanState(arg);
			    });

			    this.eventTracker.addEvent(this.swipeslide, "swipe", function (arg) {
			        ctrl._processSwipe(arg);
			    });

			    this.eventTracker.addEvent(this.swipeslide, "swipeprogress", function (arg) {
			        ctrl._processSwipeProgress(arg);
			    });

			    this.eventTracker.addEvent(this.swipeslide, "invoked", function (arg) {
			        ctrl._processInvoked(arg);
			    });
			}

			
			
        },
        /**
         * @lends WinJSContrib.UI.ItemSwipe.prototype
         */
        {
		    /**
             * data item
             * @field
             */
			item: {
				get: function(){
				    return this._item;
				},
				set: function(val){
				    this._item = val;
				}
			},

		    /**
             * minimum swipe distance for accepting action
             * @field
             * @type string
             */
			minSwipe : {
			    get: function(){
			        return this._minSwipe;
			    },
			    set: function(val){
			        this._minSwipe = val;
			        if (this.swipeslide) {
			            this.swipeslide.minSwipeDistance = val;
			        }
			    }
			},

		    /**
             * minimum swipe distance (expressed as a proportion like 2 for 50%) to element size for accepting action
             * @field
             * @type string
             */
			thresholdFactor: {
			    get: function () {
			        return this._thresholdFactor;
			    },
			    set: function (val) {
			        this._thresholdFactor = val;
			        if (this.swipeslide) {
			            this.swipeslide.thresholdFactor = val;
			        }
			    }
			},

			_processSwipeProgress: function (arg) {
			    var ctrl = this;
			    if (arg.direction == "left") {
			        if (ctrl.swipeToRightCard) {
			            ctrl.swipeToRightCard.classList.remove("swiping");
			        }

			        if (ctrl.swipeToLeftCard) {
			            ctrl.swipeToLeftCard.classList.add("swiping");
			            if (arg.accept) {
			                ctrl.swipeToLeftCard.classList.add("accepted");
			            } else {
			                ctrl.swipeToLeftCard.classList.remove("accepted");
			            }
			        }
			    } else if (arg.direction == "right") {
			        if (ctrl.swipeToLeftCard) {
			            ctrl.swipeToLeftCard.classList.remove("swiping");
			        }

			        if (ctrl.swipeToRightCard) {
			            ctrl.swipeToRightCard.classList.add("swiping");
			            if (arg.accept) {
			                ctrl.swipeToRightCard.classList.add("accepted");
			            } else {
			                ctrl.swipeToRightCard.classList.remove("accepted");
			            }
			        }
			    }			    
			},

			_processSwipe: function (arg) {
			    var ctrl = this;
			    
			    ctrl._cleanState();
			    if (arg.direction == "left") {
			        WinJSContrib.Utils.triggerCustomEvent(ctrl.element, "itemswipeleft", true, false, { element: ctrl.element, item: ctrl.item });
			    } else if (arg.direction == "right") {
			        WinJSContrib.Utils.triggerCustomEvent(ctrl.element, "itemswiperight", true, false, { element: ctrl.element, item: ctrl.item });			        
			    }
			},

			_processSwipeStart: function (arg) {
			    var ctrl = this;
			    
			    ctrl._cleanState();
			},

			_cleanState : function(){
			    var ctrl = this;
			    
			    if (ctrl.swipeToLeftCard) {
			        ctrl.swipeToLeftCard.classList.remove("swiping");
			        ctrl.swipeToLeftCard.classList.remove("accepted");
			    }
			    if (ctrl.swipeToRightCard) {
			        ctrl.swipeToRightCard.classList.remove("swiping");
			        ctrl.swipeToRightCard.classList.remove("accepted");
			    }
			},

			_processInvoked: function (arg) {
			    var ctrl = this;
			    console.log("invoked");
			    WinJSContrib.Utils.triggerCustomEvent(ctrl.element, "itemswipeinvoked", true, false, { element: ctrl.element, item: ctrl.item });
			},

			dispose: function () {
			    if (this.eventTracker) {
			        this.eventTracker.dispose();
			    }
			    if (this.swipeslide) {
			        this.swipeslide.dispose();
			    }
			    WinJS.Utilities.disposeSubTree(this.element);
			    this.element = null;
			}
		}),
		WinJS.UI.DOMEventMixin,
		WinJS.Utilities.createEventProperties("itemswipeleft", "itemswiperight", "itemswipeinvoked"))
	});
})();