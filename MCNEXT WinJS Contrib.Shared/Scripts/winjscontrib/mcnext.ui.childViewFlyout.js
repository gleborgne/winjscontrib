//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com


var MCNEXT = MCNEXT || {};

MCNEXT.UI = MCNEXT.UI || {};

(function () {
    
    MCNEXT.UI.ChildViewFlyout = WinJS.Class.mix(WinJS.Class.define(
        /** 
         * 
         * @class MCNEXT.UI.ChildViewFlyout 
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
               this.$element = $(element);
               this.element.mcnChildnav = true;
               this.$element.addClass("childNavigator");
               this._createContent();
               this.isOpened = false;
           },
           /**
            * @lends MCNEXT.UI.ChildViewFlyout.prototype 
            */
           {
               _createContent: function () {
                   var that = this;
                   this.overlay = document.createElement("div");
                   this.overlay.className = "childNavigator-overlay";
                   this.$overlay = $(this.overlay);
                   this.$overlay.hide();
                   this.element.appendChild(this.overlay);
                   this.$overlay.click(function () {
                       that.hide();
                   });

                   this.contentPlaceholder = document.createElement("div");
                   this.contentPlaceholder.className = "childNavigator-contentPlaceholder";
                   var navigatorElt = document.createElement('DIV');
                   this.contentPlaceholder.appendChild(navigatorElt);
                   this.navigator = new MCNEXT.UI.PageControlNavigator(navigatorElt, { global: false });
                   this.navigator.hide = function (arg) {
                       return that.hide(arg);
                   }
                   this.$contentPlaceholder = $(this.contentPlaceholder);
                   this.$contentPlaceholder.hide();
                   this.element.appendChild(this.contentPlaceholder);
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

               /**
                * clear all child view pages
                */
               clear: function () {
                   var that = this;
                   return new WinJS.Promise(function (complete, error) {
                       WinJS.Promise.wrap(that.closePage()).done(function () {
                           that.navigator.clear();
                           that.navigator._element.innerText = '';
                           that.location = undefined;
                           complete();
                       });
                   });
               },

               /**
                * close current page
                */
               closePage: function (arg, pageElement) {
                   var that = this;
                   if (!that.canClose()) {
                       return WinJS.Promise.wrapError();
                   }

                   if (that.navigator._element.children.length == 1) {
                       that.hide(arg);
                   }

                   that.navigator.triggerPageExit();
                   return that.navigator.closePage(pageElement).then(function () {
                       if (MCNEXT.UI.Application.progress)
                           MCNEXT.UI.Application.progress.hide();
                   });
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

               show: function (skipshowcontainer) {
                   var that = this;
                   document.body.addEventListener('keyup', that.childContentKeyUp);
                   that.isOpened = true;
                   that.element.style.display = 'block';
                   that.$overlay.show().addClass("visible");
                   if (!skipshowcontainer)
                       that.$contentPlaceholder.show().addClass("visible");
               },

               pick: function (uri, options, skipHistory) {
                   var ctrl = this;
                   options = options || {};

                   return new WinJS.Promise(function (complete, error) {
                       var completed = false;
                       var page = null;

                       var manageClose = function (arg) {
                           if (page)
                               page.removeEventListener("closing", manageClose);
                           ctrl.removeEventListener("beforehide", manageClose);
                           if (!completed) {
                               completed = true;
                               complete({ completed: false, data: null });
                           }
                       };

                       options.navigateStacked = true;
                       options.injectToPage = {
                           close: function (arg) {
                               completed = true;

                               if (page)
                                   page.removeEventListener("closing", manageClose);
                               ctrl.removeEventListener("beforehide", manageClose);
                               ctrl.closePage(arg, this.element).then(function () {
                                   complete({ completed: true, data: arg });
                               });
                           },
                           cancel: function () {
                               manageClose();
                               ctrl.closePage();
                           }
                       };

                       ctrl.open(uri, options, skipHistory).then(function (arg) {
                           page = ctrl.navigator.pageControl;
                           page.addEventListener("closing", manageClose);
                           ctrl.addEventListener("beforehide", manageClose, false);
                       });
                   });

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
                   that.element.style.display = 'block';
                   that.dispatchEvent('beforeshow');
                   that.$overlay.show().addClass("visible");
                   that.$contentPlaceholder.show().addClass("visible");

                   return new WinJS.Promise(function (complete, error) {
                       //setImmediate(function () {
                       if (!that.isOpened) {
                           that.show(true);
                       }

                       setImmediate(function () {
                           that.navigate(uri, options, skipHistory).done(function (e) {
                               that.dispatchEvent('aftershow');
                               complete(e);
                           }, error);
                       });
                       //});
                   });
               },

               canClose: function () {
                   var that = this;
                   if (this.navigator.pageControl && this.navigator.pageControl.canClose) {
                       if (!this.navigator.pageControl.canClose()) {
                           return false;
                       }
                   }

                   return true;
               },

               /**
                * close all content and hide child view
                */
               hide: function (arg) {
                   var that = this;
                   if (!that.canClose()) {
                       return false;
                   }

                   document.body.removeEventListener('keyup', that.childContentKeyUp);
                   that.isOpened = false;
                   that.dispatchEvent('beforehide', arg);

                   if (this.$overlay.hasClass("visible")) {
                       this.$contentPlaceholder.afterTransition(function () {
                           that.$overlay.hide();
                           that.$contentPlaceholder.hide();
                           that.clear();
                           that.element.style.display = 'none';
                           that.dispatchEvent('afterhide', arg);

                       });


                       this.$overlay.removeClass("visible");
                       this.$contentPlaceholder.removeClass("visible");
                   }
                   return true;
               }
           }),
           WinJS.Utilities.eventMixin,
           WinJS.Utilities.createEventProperties("beforeshow", "beforehide", "aftershow", "afterhide"))

    WinJS.Namespace.define("MCNEXT.UI", {
        parentChildView: function (element) {
            var current = element.parentNode;

            while (current) {
                if (current.mcnChildnav) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        },


    });
})();