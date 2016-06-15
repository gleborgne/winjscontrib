/// <reference path="winjscontrib.core.js" />

(function () {
    var logger = WinJSContrib.Logs.getLogger("WinJSContrib.UI.ChildViewFlyout");

    WinJS.Namespace.define("WinJSContrib.UI", {
        parentChildView: function (element) {
            var current = element.parentNode;

            while (current) {
                if (current.mcnChildnav) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        },

        ChildViewFlyout: WinJS.Class.mix(WinJS.Class.define(
        /** 
         * 
         * @class WinJSContrib.UI.ChildViewFlyout 
         * @property {HTMLElement} pageControl
         * @classdesc This control wrap a navigator into a flyout that appears typically as a side panel. 
         * It's intended to provide a secondary navigation mecanism or to enable scenarios like master detail, or content selection
         * @param {HTMLElement} element DOM element containing the control
         * @param {Object} options
         */
           function (element, options) {
               element.winControl = this;
               options = options || {};
               this.element = element || document.createElement("div");
               if (options.inplace) {
                   this.rootElement = this.element;
               } else {
                   this.rootElement = document.createElement("div");
                   this.rootElement.mcnChildnav = true;
                   this.rootElement.winControl = this;
                   this.element.style.display = 'none';
               }
               document.body.appendChild(this.rootElement);

               //tell if internal navigator must register for navigation events
               this.navigationEvents = options.navigationEvents;

               this.element.mcnChildnav = true;

               this.element.classList.add("mcn-childview");
               this.element.classList.add("win-disposable");
               this.rootElement.classList.add("childNavigator");
               this.rootElement.classList.add('hidden');
               this.element.classList.add('mcn-navigation-ctrl');
               this.target = options.target || null;
               this._createContent(options);
               this.hardwareBackBtnPressedBinded = this.hardwareBackBtnPressed.bind(this);
               this.childContentKeyUp = this._childContentKeyUp.bind(this);
               //this.cancelNavigationBinded = this.cancelNavigation.bind(this);
           },
           /**
            * @lends WinJSContrib.UI.ChildViewFlyout.prototype 
            */
           {
               _createContent: function (options) {
                   var that = this;
                   var FD = WinJSContrib.UI.FluentDOM;
                   var overlay = new FD('DIV');
                   that.overlay = new FD('DIV')
                       .addClass("childNavigator-overlay")
                       .appendTo(that.rootElement)
                       .tap(function () {
                           that.hide();
                       }, { disableAnimation: true, disableAria: true })
                       .element;

                   that.contentPlaceholder = new FD('DIV', "childNavigator-contentPlaceholder", that.rootElement)
                       .append('DIV', null, function (nav) {
                           that.navigator = new WinJSContrib.UI.PageControlNavigator(nav.element, { global: false });
                           that.navigator.animations.enterPage = WinJS.UI.Animation.fadeIn;
                           that.navigator.hide = function (arg) {
                               return that.hide(arg);
                           }
                       })
                       .element;
                   if (options && options.closeBtn && options.closeBtn.active) {
                       that.closebtn = new FD('DIV', 'mcn-close-btn', that.contentPlaceholder);
                       if (options.closeBtn.templatetext)
                           that.closebtn.html(options.closeBtn.templatetext);
                       if (options.closeBtn.class)
                           that.closebtn.className(that.closebtn.element.className + " " + options.closeBtn.class);
                       else if (!options.closeBtn.templatetext) {
                           that.closebtn.className(that.closebtn.element.className + " default-icon");
                       }
                       WinJSContrib.UI.tap(that.closebtn.element, function () {
                           return that.closePage();
                       });
                   }
               },

               /**
                * navigate to target uri
                * @param {string} uri target page uri
                * @param {Object} options options for target page
                * @param {boolean} skipHistory indicate if navigation should skip being added to history
                * @returns {WinJS.Promise}
                */
               navigate: function (uri, options, skipHistory) {
                   var that = this;
                   return that.navigator.navigate(uri, options);
               },

               pageControl: {
                   get: function () {
                       return this.container && this.container.winControl;
                   }
               },

               isOpened: {
                   get: function () {
                       return this.contentPlaceholder.classList.contains("enter") || this.contentPlaceholder.classList.contains("enter-active")
                   }
               },

               /**
                * clear all child view pages
                */
               clear: function (forceClose) {
                   var that = this;
                   logger.debug("clear");
                   return new WinJS.Promise(function (complete, error) {
                       WinJS.Promise.wrap(that.closePage(null, null, forceClose)).done(function () {
                           that.navigator.clear();
                           that.navigator.element.innerText = '';
                           that.location = undefined;
                           complete();
                       });
                   });
               },

               checkStack: function (arg) {
                   var that = this;
                   if (that.navigator.pagesCount == 0) {
                       return that.hide(arg, null, true);
                   }
               },

               /**
                * close current page
                */
               closePage: function (arg, pageElement, forceClose) {
                   var that = this;

                   var pageControl = pageElement && pageElement.winControl ? pageElement.winControl : that.navigator.pageControl;
                   logger.debug("close page " + (pageControl ? pageControl.uri : ""));

                   var check = forceClose ? WinJS.Promise.wrap(true) : that.canClose(pageControl);

                   var currentpageclose = check.then(function (canClose) {
                       if (!canClose) {                           
                           return WinJS.Promise.wrapError({ message : "close canceled by user" });
                       }

                       var pagescount = that.navigator.pagesCount;

                       that.navigator.triggerPageExit();
                       return that.navigator.closePage(pageElement).then(function () {
                           if (WinJSContrib.UI.Application.progress)
                               WinJSContrib.UI.Application.progress.hide();

                           return that.checkStack(arg);
                       });
                   }, function (err) {
                       console.warn("close childview error", err);
                       //noop
                   });

                   if (that.closePagePromise) {
                       //console.log("childview has previous close promise")
                       that.closePagePromise = that.closePagePromise.then(function () {
                           return currentpageclose;
                       }, function () {
                       }).then(function () {
                           return forceClose ? WinJS.Promise.wrap(true) : that.canClose(pageControl)
                       }, function (err) {
                           //noop
                       });
                   } else {
                       that.closePagePromise = currentpageclose;
                   }



                   return currentpageclose;
               },

               /**
                * navigate back
                */
               back: function (distance) {
                   var that = this;
                   return that.navigator.back(distance);
               },

               /**
                * indicate if control can navigate back
                */
               canGoBack: function () {
                   return that.navigator.canGoBack;
               },

               _childContentKeyUp: function (args) {
                   if (args.key === "Esc") {
                       this.hide();
                   }
               },

               hardwareBackBtnPressed: function (arg) {
                   var ctrl = this;
                   if (!ctrl.navigator._checkBackNavigation(arg)) {
                       ctrl.hide();
                       arg.handled = true;
                   }
               },

               show: function (skipshowcontainer) {
                   var that = this;

                   logger.verbose("showing childview");

                   if (that.target) {
                       that.target.classList.add("childview-target");
                   }

                   if (!that.isOpened) {
                       logger.verbose("show exec");
                       if (WinJSContrib.UI && WinJSContrib.UI.enableSystemBackButtonVisibility && window.Windows && window.Windows.UI && window.Windows.UI.Core && window.Windows.UI.Core.SystemNavigationManager) {
                           systemNavigationManager = window.Windows.UI.Core.SystemNavigationManager.getForCurrentView();
                           if (systemNavigationManager.appViewBackButtonVisibility === window.Windows.UI.Core.AppViewBackButtonVisibility.collapsed)
                               systemNavigationManager.appViewBackButtonVisibility = window.Windows.UI.Core.AppViewBackButtonVisibility.visible;
                       }

                       document.body.addEventListener('keyup', that.childContentKeyUp);

                       this.addDismissableClass("visible");
                       this.addDismissableClass("enter");
                       this.removeDismissableClass("leave");
                       this.removeDismissableClass("hidden");
                       that.rootElement.getBoundingClientRect();

                       that.navEventsHandler = WinJSContrib.UI.registerNavigationEvents(that, this.hardwareBackBtnPressedBinded);
                       if (that.navigationEvents) {
                           that.navigator.addNavigationEvents();
                       }

                       that.showChildViewPromise = WinJS.Promise.timeout().then(function () {
                           return that.hideChildViewPromise;
                       }).then(function () {
                           that.hideChildViewPromise = null;
                           that.addDismissableClass("enter-active");
                           that.addDismissableClass("visible");
                           that.addDismissableClass("enter");
                           that.removeDismissableClass("leave");
                           that.removeDismissableClass("hidden");

                           return WinJSContrib.UI.afterTransition(that.contentPlaceholder).then(function () {
                               if (that.contentPlaceholder.classList.contains("enter")) {
                               }
                           });
                       });
                       return that.showChildViewPromise;
                       //WinJS.Navigation.addEventListener('beforenavigate', this.cancelNavigationBinded);
                       //if (window.Windows && window.Windows.Phone)
                       //    Windows.Phone.UI.Input.HardwareButtons.addEventListener("backpressed", this.hardwareBackBtnPressedBinded);
                       //else
                       //    document.addEventListener("backbutton", this.hardwareBackBtnPressedBinded, true);

                       //if (WinJSContrib.UI.Application && WinJSContrib.UI.Application.navigator)
                       //    WinJSContrib.UI.Application.navigator.addLock();
                   }

                   return WinJS.Promise.wrap();
               },

               addDismissableClass: function (classname) {
                   var that = this;
                   that.overlay.classList.add(classname);
                   that.contentPlaceholder.classList.add(classname);
                   that.rootElement.classList.add(classname);

                   if (that.target) {
                       that.target.classList.add("childview-" + classname);
                   }
               },

               removeDismissableClass: function (classname) {
                   var that = this;
                   that.overlay.classList.remove(classname);
                   that.overlay.classList.remove(classname + "-active");
                   that.contentPlaceholder.classList.remove(classname);
                   that.contentPlaceholder.classList.remove(classname + "-active");
                   that.rootElement.classList.remove(classname);
                   that.rootElement.classList.remove(classname + "-active");

                   if (that.target) {
                       that.target.classList.remove("childview-" + classname);
                       that.target.classList.remove("childview-" + classname + "-active");
                   }
               },

               _pick: function (uri, options, stacked, skipHistory) {
                   var ctrl = this;
                   options = options || {};
                   ctrl.pickPromises = ctrl.pickPromises || [];

                   var pickOperation = {
                       completed: false,
                       childviewpage: null,
                       promise: null,
                       completeCallback: null,
                       errorCallback: null,
                       manageClose: null,
                       attachPage: function (page) {
                           this.detachPage();
                           this.childviewpage = page;
                           if (page && page.element) {
                               page.addEventListener("closing", this.manageClose);
                           }
                       },
                       detachPage: function (page) {
                           if (this.childviewpage && this.childviewpage.element && this.childviewpage.removeEventListener) {
                               this.childviewpage.removeEventListener("closing", this.manageClose);
                           }
                       },
                       dispose: function () {
                       }
                   };



                   pickOperation.promise = new WinJS.Promise(function (complete, error) {
                       pickOperation.completed = false;
                       pickOperation.childviewpage = null;

                       pickOperation.completeCallback = complete;
                       pickOperation.errorCallback = error;
                       pickOperation.manageClose = function (eventarg, hasResult, arg) {
                           try {
                               pickOperation.detachPage();

                               ctrl.removeEventListener("beforehide", pickOperation.manageClose);
                           } catch (exception) {
                               console.error(exception);
                           }

                           if (!pickOperation.completed) {
                               pickOperation.completed = true;
                               logger.verbose("closing childview page hasresult:" + hasResult, arg);
                               complete({ completed: hasResult, data: arg });
                           }
                       };

                       pickOperation.injectToPage = {
                           close: function (arg) {
                               return ctrl.canClose(pickOperation.childviewpage).then(function () {
                                   pickOperation.manageClose(null, true, arg);

                                   try {
                                       pickOperation.detachPage();

                                       ctrl.removeEventListener("beforehide", pickOperation.manageClose);
                                   } catch (exception) {
                                       console.error(exception);
                                   }
                                   if (pickOperation.childviewpage && pickOperation.childviewpage.element)
                                       ctrl.closePage(arg, pickOperation.childviewpage.element, true);
                               });
                           },
                           cancel: function () {
                               var elt = this.element || this.rootElement;
                               return ctrl.canClose(elt.winControl).then(function () {
                                   pickOperation.manageClose(null, false);
                                   ctrl.closePage()
                               });
                           }
                       };
                       options.navigateStacked = stacked;
                       options.injectToPage = pickOperation.injectToPage;

                       ctrl.pickPromises.push(pickOperation);
                       ctrl.open(uri, options, skipHistory).then(function (arg) {
                           logger.debug("picking with childview page " + uri);
                           //pickOperation.attachPage(ctrl.navigator.pageControl)

                           ctrl.addEventListener("beforehide", pickOperation.manageClose, false);
                       });

                   });

                   var removePromise = function () {
                       var idx = ctrl.pickPromises.indexOf(pickOperation);
                       ctrl.pickPromises.splice(idx, 1);
                   }

                   pickOperation.promise.then(removePromise, removePromise);

                   return pickOperation.promise;
               },


               pick: function (uri, options, skipHistory) {
                   var ctrl = this;
                   return ctrl._pick(uri, options, true, skipHistory);
               },

               /**
                * display child view and navigate to target uri
                * @param {string} uri target page uri
                * @param {Object} options options for target page
                * @param {boolean} skipHistory indicate if navigation should skip being added to history
                * @returns {WinJS.Promise}
                */
               open: function (uri, options, skipHistory) {
                   var that = this;

                   WinJS.Application.queueEvent({ type: "mcn-childviewflyout-open", detail: { location: uri, options: options }});

                   options = options || {};
                   var lastPickOperation;
                   if (that.pickPromises && that.pickPromises.length) {
                       lastPickOperation = that.pickPromises[that.pickPromises.length - 1];
                       options.injectToPage = lastPickOperation.injectToPage;
                       lastPickOperation.detachPage();
                   }
                   that.rootElement.classList.add("visible");
                   that.dispatchEvent('beforeshow');
                   logger.verbose("opening " + uri, options);

                   that.openChildViewPromise = new WinJS.Promise(function (complete, error) {
                       WinJS.Promise.as(that.hideChildViewPromise).then(function () {
                           var p = WinJS.Promise.wrap();
                           if (!that.isOpened) {
                               p = that.show(true);
                           }

                           return WinJS.Promise.join({
                               show: WinJSContrib.UI.afterTransition(that.contentPlaceholder),
                               navigate: that.navigate(uri, options, skipHistory).done(function (e) {
                                   that.dispatchEvent('aftershow');
                                   if (lastPickOperation)
                                       lastPickOperation.attachPage(that.navigator.pageControl);
                               })
                           });
                       }).then(complete, error);
                   });

                   return that.openChildViewPromise;
               },

               canClose: function (pagecontrol) {
                   var that = this;
                   pagecontrol = pagecontrol || this.navigator.pageControl;
                   if (pagecontrol && pagecontrol.canClose && pagecontrol.element && !pagecontrol.element.classList.contains("page-closing")) {
                       return WinJS.Promise.as(pagecontrol.canClose()).then(function (canclose) {
                           return canclose;
                       });
                   }

                   return WinJS.Promise.wrap(true);
               },

               /**
                * close all content and hide child view
                */
               hide: function (arg, event, forceClose) {
                   var that = this;
                   logger.verbose("hiding childview");

                   if (that.isOpened) {
                       that.showChildViewPromise = null;
                       that.closePagePromise = null;
                       that.openChildViewPromise = null;
                       var check = forceClose ? WinJS.Promise.wrap(true) : that.canClose();
                       var pagesToClose = that.navigator.element.children;
                       var previousHide = that.hideChildViewPromise;

                       that.hideChildViewPromise = check.then(function (canclose) {
                           return WinJS.Promise.as(previousHide).then(function () {
                               return canclose;
                           })
                       }).then(function (canclose) {
                           if (!canclose) {
                               return false;
                           }

                           if (that.isOpened) {
                               logger.verbose("hide exec");
                               that.addDismissableClass("leave");
                               that.removeDismissableClass("enter");

                               if (that.pickPromises) {
                                   that.pickPromises.forEach(function (p) {
                                       p.promise.cancel();
                                   });
                               }

                               document.body.removeEventListener('keyup', that.childContentKeyUp);

                               that.dispatchEvent('beforehide', arg);

                               if (!that.navigator.canGoBack && !WinJS.Navigation.canGoBack) {
                                   if (WinJSContrib.UI && WinJSContrib.UI.enableSystemBackButtonVisibility && window.Windows && window.Windows.UI && window.Windows.UI.Core && window.Windows.UI.Core.SystemNavigationManager) {
                                       systemNavigationManager = window.Windows.UI.Core.SystemNavigationManager.getForCurrentView();
                                       if (systemNavigationManager.appViewBackButtonVisibility === window.Windows.UI.Core.AppViewBackButtonVisibility.visible)
                                           systemNavigationManager.appViewBackButtonVisibility = window.Windows.UI.Core.AppViewBackButtonVisibility.collapsed;
                                   }
                               }

                               if (that.navEventsHandler) {
                                   that.navEventsHandler();
                                   that.navigator.removeNavigationEvents();
                                   that.navEventsHandler = null;
                               }

                               return WinJS.Promise.timeout().then(function () {

                                   that.addDismissableClass("leave-active");
                                   return WinJS.Promise.join({
                                       overlay: WinJSContrib.UI.afterTransition(that.overlay, 1000),
                                       content: WinJSContrib.UI.afterTransition(that.contentPlaceholder, 1000),
                                   }).then(function () {
                                       if (that.contentPlaceholder.classList.contains("leave")) {
                                           that.clear(true);
                                           that.removeDismissableClass("visible");
                                           that.addDismissableClass("hidden");
                                           that.removeDismissableClass("leave");
                                           that.dispatchEvent('afterhide', arg);
                                       }

                                       if (pagesToClose && pagesToClose.length) {
                                           for (var i = 0 ; i < pagesToClose.length ; i++) {
                                               var page = pagesToClose[i];
                                               if (!page.winControl.mcnPageClosing) {
                                                   that.closePage(null, page);
                                               }
                                           }
                                       }
                                   });
                               });
                           }
                       });
                       return that.hideChildViewPromise;
                   }
                   return WinJS.Promise.wrap(true);
               },

               dispose: function () {
                   var ctrl = this;
                   this.rootElement.winControl = null;
                   WinJS.Utilities.disposeSubTree(this.rootElement);
                   WinJS.Utilities.disposeSubTree(this.element);
                   this.rootElement.parentElement.removeChild(this.rootElement);
               }
           }),
           WinJS.Utilities.eventMixin,
           WinJS.Utilities.createEventProperties("beforeshow", "beforehide", "aftershow", "afterhide"))

    });
})();