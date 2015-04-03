/// <reference path="WinJSContrib.core.js" />

(function () {
	"use strict";

	var appView = null;
	if (window.Windows && window.Windows.UI && window.Windows.UI.ViewManagement && window.Windows.UI.ViewManagement.ApplicationView)
		appView = window.Windows.UI.ViewManagement.ApplicationView;

	var nav = WinJS.Navigation;

	var defaultExitPageAnimation = function (elt) {
		return WinJSContrib.UI.Animation.pageExit(elt)
	}

	var defaultEnterPageAnimation = function (elt) {
		return WinJS.UI.Animation.enterPage(elt);
	}

	WinJS.Namespace.define("WinJSContrib.UI", {
		parentNavigator: function (element) {
			var current = element.parentNode;

			while (current) {
				if (current.mcnNavigator) {
					return current.winControl;
				}
				current = current.parentNode;
			}
		},

		PageControlNavigator: WinJS.Class.mix(WinJS.Class.define(
            /**
             * @class WinJSContrib.UI.PageControlNavigator
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function PageControlNavigator(element, options) {
            	var options = options || {};
            	var navigator = this;
            	this._element = element || document.createElement("div");
            	this._element.winControl = this;
            	this._element.mcnNavigator = true;
            	this._element.classList.add('mcn-navigator');
            	this._element.classList.add('mcn-navigation-ctrl');
            	this.eventTracker = new WinJSContrib.UI.EventTracker();
            	this.delay = options.delay || 0;
            	this.disableHistory = options.disableHistory || false;
            	this.animationWaitForPreviousPageClose = options.animationWaitForPreviousPageClose || true;
            	this.animations = {};
            	this.locks = 0;

            	if (options.enterPageAnimation) {
            		this.animations.enterPage = WinJSContrib.Utils.resolveMethod(element, options.enterPageAnimation);
            	}
            	if (!this.animations.enterPage)
            		this.animations.enterPage = defaultEnterPageAnimation;

            	if (options.exitPageAnimation) {
            		this.animations.exitPage = WinJSContrib.Utils.resolveMethod(element, options.exitPageAnimation);
            	}
            	if (!this.animations.exitPage)
            		this.animations.exitPage = defaultExitPageAnimation;

            	this.home = options.home;
            	if (appView)
            		this._lastViewstate = appView.value;

            	this.global = options.global !== undefined ? options.global : true;
            	if (this.global) { //navigation classique 
            		document.body.onkeyup = this._keyupHandler.bind(this);
            		document.body.onkeypress = this._keypressHandler.bind(this);
            		document.body.onmspointerup = this._mspointerupHandler.bind(this);

            		WinJSContrib.UI.Application = WinJSContrib.UI.Application || {};
            		WinJSContrib.UI.Application.navigator = this;

            		this.eventTracker.addEvent(nav, 'beforenavigate', this._beforeNavigate.bind(this));
            		this.eventTracker.addEvent(nav, 'navigated', this._navigated.bind(this));
            	}
            	else {
            		this.history = { backstack: [] };
            	}

            	this.eventTracker.addEvent(window, 'resize', function (args) {
            		if (navigator.resizeHandler)
            			cancelAnimationFrame(navigator.resizeHandler);

            		navigator.resizeHandler = requestAnimationFrame(function () {
            			navigator.resizeHandler = null;
            			navigator._resized(args);
            		});
            	});
            },
            /**
             * @lends WinJSContrib.UI.PageControlNavigator.prototype
             */
            {
            	home: "",
            	/// <field domElement="true" />
            	_element: null,
            	_lastNavigationPromise: WinJS.Promise.as(),
            	_lastViewstate: 0,

            	// This is the currently loaded Page object.
            	pageControl: {
            		get: function () {
            			return this.pageElement ? this.pageElement.winControl : null;
            		}
            	},

            	// This is the root element of the current page.
            	pageElement: {
            		get: function () {
            			return this._pageElement || this._element.lastElementChild;
            		}
            	},

            	addLock: function () {
            		this.locks++;
            	},

            	removeLock: function () {
            		this.locks--;
            	},

            	// Creates a container for a new page to be loaded into.
            	_createPageElement: function () {
            		var element = document.createElement("div");
            		element.setAttribute("dir", window.getComputedStyle(this._element, null).direction);
            		//element.style.width = "100%";
            		//element.style.height = "100%";
            		//element.style.position = 'relative';
            		return element;
            	},

            	// This function disposes the page navigator and its contents.
            	dispose: function () {
            		if (this._disposed) {
            			return;
            		}

            		this._disposed = true;
            		if (WinJS.Utilities.disposeSubTree)
            			WinJS.Utilities.disposeSubTree(this._element);

            		this.eventTracker.dispose();
            	},

            	// Retrieves a list of animation elements for the current page.
            	// If the page does not define a list, animate the entire page.
            	_getAnimationElements: function (isExit) {
            		if (this.pageControl && this.pageControl.getAnimationElements) {
            			return this.pageControl.getAnimationElements(isExit);
            		}
            		return this.pageElement;
            	},

            	// Navigates back whenever the backspace key is pressed and
            	// not captured by an input field.
            	_keypressHandler: function (args) {
            		if (args.key === "Backspace") {
            			nav.back();
            		}
            	},

            	// Navigates back or forward when alt + left or alt + right
            	// key combinations are pressed.
            	_keyupHandler: function (args) {
            		if ((args.key === "Left" && args.altKey) || (args.key === "BrowserBack")) {
            			nav.back();
            		} else if ((args.key === "Right" && args.altKey) || (args.key === "BrowserForward")) {
            			nav.forward();
            		}
            	},

            	// This function responds to clicks to enable navigation using
            	// back and forward mouse buttons.
            	_mspointerupHandler: function (args) {
            		if (args.button === 3) {
            			nav.back();
            		} else if (args.button === 4) {
            			nav.forward();
            		}
            	},

            	navigate: function (location, initialState, skipHistory, isback) {
            		var nav = this;
            		if (this.global) {
            			return WinJS.Navigation.navigate(location, initialState);
            		} else {
            			var arg = {
            				skipHistory: skipHistory,
            				detail: {
            					location: location,
            					state: initialState,
            					setPromise: function (promise) {
            						this.pagePromise = promise;
            					}
            				}
            			};
            			nav._beforeNavigate(arg);
            			arg.detail.pagePromise = arg.detail.pagePromise || WinJS.Promise.wrap();
            			return arg.detail.pagePromise.then(function () {
            				if (isback) {
            					nav.history.backstack.splice(nav.history.backstack.length - 1, 1);
            				}
            				nav._navigated(arg);
            				return arg.detail.pagePromise;
            			});
            		}
            	},

            	clearHistory: function () {
            		if (this.global) {
            			WinJS.Navigation.history.backStack = [];
            		} else {
            			this.history.backstack = [];
            		}
            	},

            	clear: function () {
            		this.clearHistory();
            		this._pageElement = null;
            		this._element.innerHTML = '';
            	},

            	//warning, deprecated...
            	open: function (uri, options) {
            		return this.navigate(uri, options);
            	},

            	pick: function (uri, options) {
            		options = options || {};
            		options.navigateStacked = true;
            		return this.navigate(uri, options);
            	},

            	canGoBack: {
            		get: function () {
            			if (this.global)
            				return nav.canGoBack;
            			else
            				return this.history.backstack.length > 0;
            		}
            	},

            	back: function (distance) {
            		var navigator = this;
            		if (navigator.global) {
            			return WinJS.Navigation.back(distance);
            		}
            		else {
            			if (navigator.history.backstack.length) {
            				var pageindex = navigator.history.backstack.length - 1;
            				var previousPage = navigator.history.backstack[pageindex];

            				return navigator.navigate(previousPage.location, previousPage.state, true, true);
            			}
            		}
            	},

            	_beforeNavigate: function (args) {
            		var navigator = this;
            		var page = this.pageElement;
            		args.detail.state = args.detail.state || {};
            		var openStacked = navigator.stackNavigation == true || args.detail.state.navigateStacked;

            		if (this.locks > 0) {
            			var p = new WinJS.Promise(function (c) { });
            			args.detail.setPromise(p);
            			p.cancel();
            			return;
            		}
            		else if (page && page.winControl && page.winControl.canClose) {
            			var completeCallback = null;
            			var p = new WinJS.Promise(function (c) {
            				completeCallback = c;
            			});
            			setImmediate(function () {
            				WinJS.Promise.wrap(page.winControl.canClose()).then(function (res) {
            					if (!res) {
            						p.cancel();
            					}
            					else {
            						navigator.triggerPageExit();
            						completeCallback();
            					}
            				});
            			});
            			args.detail.setPromise(p);

            			return;
            		}

            		if (openStacked && !args.detail.state.mcnNavigationDetails)
            			return;

            		navigator.triggerPageExit();
            	},

            	triggerPageExit: function () {
            		var navigator = this;
            		var page = this.pageElement;
            		var hidepage = function () {
            			page.style.display = 'none';
            			page.style.visibility = 'hidden';
            			page.style.opacity = '';
            		}

            		if (page && page.winControl && !page.winControl.exitPagePromise) {
            			if (page.winControl.exitPage) {
            				var exitPageResult = page.winControl.exitPage();
            				if (exitPageResult) {
            					var res = WinJS.Promise.as(exitPageResult);
            					page.winControl.exitPagePromise = res.then(function () {
            						if (page.winControl.exitPageAnimation) {
            							return WinJS.Promise.as(page.winControl.exitPageAnimation());
            						}
            					}).then(hidepage);
            				}
            			} else {
            				if (page.winControl.exitPageAnimation) {
            					page.winControl.exitPagePromise = WinJS.Promise.as(page.winControl.exitPageAnimation()).then(hidepage);
            				} else {
            					page.winControl.exitPagePromise = WinJS.Promise.as(navigator.animations.exitPage(navigator._getAnimationElements(true))).then(hidepage);
            				}
            			}

            			var layoutCtrls = page.querySelectorAll('.mcn-layout-ctrl');
            			if (layoutCtrls && layoutCtrls.length) {
            				for (var i = 0 ; i < layoutCtrls.length; i++) {
            					var ctrl = layoutCtrls[i].winControl;
            					if (ctrl.exitPage)
            						ctrl.exitPage();
            				}
            			}

            			if (WinJSContrib.UI.Application.progress)
            				WinJSContrib.UI.Application.progress.show();
            		}
            	},

            	closePage: function (pageElementToClose, args) {
            		var navigator = this;
            		args = args || {};
            		var pagecontainer = navigator._element;
            		var oldElement = pageElementToClose || this.pageElement;
            		if (oldElement) {
            			WinJSContrib.UI.untapAll(oldElement);
            		}
            		var oldPageExitPromise = (oldElement && oldElement.winControl && oldElement.winControl.exitPagePromise) ? oldElement.winControl.exitPagePromise : WinJS.Promise.wrap()
            		navigator.dispatchEvent('closingPage', { page: oldElement });

            		if (oldElement && oldElement.winControl) {
            			oldElement.winControl.dispatchEvent('closing', { youpla: 'boom' });

            			if (oldElement.winControl.cancelPromises) {
            				oldElement.winControl.cancelPromises();
            			}
            		}

            		if (!navigator.global && !navigator.disableHistory && oldElement && oldElement.winControl && oldElement.winControl.navigationState && !args.skipHistory) {
            			navigator.history.backstack.push(oldElement.winControl.navigationState);
            		}

            		navigator._pageElement = null;
            		return oldPageExitPromise.then(function () {
            			if (oldElement) {
            				oldElement.style.opacity = '0';
            				oldElement.style.display = 'none';
            				//    }
            				//    return WinJS.Promise.timeout();
            				//}).then(function () {
            				//    if (oldElement) {
            				if (oldElement.winControl) {
            					oldElement.winControl.stackedOn = null;
            					oldElement.winControl.stackedBy = null;
            					if (oldElement.winControl.eventTracker) {
            						oldElement.winControl.eventTracker.dispose();
            					}

            					if (oldElement.winControl.unload) {
            						oldElement.winControl.unload();
            					}
            				}

            				if (WinJS.Utilities.disposeSubTree)
            					WinJS.Utilities.disposeSubTree(oldElement);

            				//oldElement.innerHTML = '';
            				//setImmediate(function () {
            				try {
            					oldElement.parentElement.removeChild(oldElement);
            				}
            				catch (exception) {
            					console.log('cannot remove page, WTF ????????')
            				}
            				//});
            			}
            		});
            	},

            	// Responds to navigation by adding new pages to the DOM.
            	_navigated: function (args) {
            		var navigator = this;
            		args.detail.state = args.detail.state || {};
            		var pagecontainer = navigator._element;
            		var oldPage = this.pageControl;
            		var oldElement = this.pageElement;
            		var openStacked = navigator.stackNavigation == true || (args.detail.state && args.detail.state.navigateStacked);

            		if (this._lastNavigationPromise) {
            			this._lastNavigationPromise.cancel();

            			if (WinJSContrib.UI.Application.progress)
            				WinJSContrib.UI.Application.progress.hide();
            		}

            		if (oldPage && oldPage.stackedOn && args.detail.state.mcnNavigationDetails) {//back en nav stacked
            			var closeOldPagePromise = navigator.closePage(oldElement, args);
            			this._lastNavigationPromise = closeOldPagePromise;
            			args.detail.setPromise(closeOldPagePromise);
            			if (WinJSContrib.UI.Application.progress)
            				WinJSContrib.UI.Application.progress.hide();
            			return;
            		}
            		else if (openStacked) {
            			if (!navigator.global && !navigator.disableHistory && oldElement && oldElement.winControl && oldElement.winControl.navigationState && !args.skipHistory) {
            				navigator.history.backstack.push(oldElement.winControl.navigationState);
            			}
            			var closeOldPagePromise = WinJS.Promise.wrap();
            		}
            		else {
            			var closeOldPagePromise = navigator.closePage(oldElement, args);
            		}

            		args.detail.state.mcnNavigationDetails = {
            			id: WinJSContrib.Utils.guid(),
            			date: new Date()
            		};

            		//var newElement = null; //this._createPageElement();
            		//var newElementCtrl = null;
            		var parentedComplete;
            		var parented = new WinJS.Promise(function (c) { parentedComplete = c; });
            		//newElement.style.opacity = '0';
            		var layoutCtrls = [];


            		//if (navigator.animationWaitForPreviousPageClose) {
            		//    var tempo = closeOldPagePromise.then(function () {
            		//        return WinJS.Promise.timeout(navigator.delay);
            		//    });
            		//} else {
            		//    var tempo = WinJS.Promise.timeout(navigator.delay);
            		//}

            		navigator.currentPageDetails = args.detail;

            		var openNewPagePromise = WinJSContrib.UI.Pages.renderFragment(pagecontainer, args.detail.location, args.detail.state, {
            			//delay: tempo,
            			enterPage: navigator.animations.enterPage,

            			parented: closeOldPagePromise.then(function () {
            				return parented;
            			}),

            			oninit: function (element, options) {
            				var control = element.winControl;
            				control.navigator = navigator;
            				control.element.mcnPage = true;
            				if (openStacked) {
            					control.stackedOn = oldPage;
            					if (oldPage) {
            						oldPage.stackedBy = control;
            					}
            				}
            				control.renderComplete = control.renderComplete.then(function () {
            					parentedComplete();
            				});
            			},

            			onrender: function (element, options) {
            				if (args.detail.state && args.detail.state.clearNavigationHistory) {
            					if (navigator.global) {
            						WinJS.Navigation.history.backStack = [];
            					} else {
            						navigator.history.backstack = [];
            					}
            				}
            				navigator._updateBackButton(element);
            			},

            			onready: function (element, options) {
            				navigator.dispatchEvent('pageContentReady', { page: element.winControl });
            				if (WinJSContrib.UI.Application.progress)
            					WinJSContrib.UI.Application.progress.hide();
            			}
            		}).then(function () {
            			navigator._lastNavigationPromise = undefined;
            		});

            		this._lastNavigationPromise = openNewPagePromise;


            		args.detail.setPromise(WinJS.Promise.join([closeOldPagePromise, openNewPagePromise]));
            	},

            	// Responds to resize events and call the updateLayout function
            	// on the currently loaded page.
            	_resized: function (args) {
            		var navigator = this;
            		if (this.pageControl && this.pageControl.element) {
            			var navigator = this;
            			//navigator.pageControl.element.opacity = '0';
            			cancelAnimationFrame(navigator.layoutProcess);
            			navigator.layoutProcess = requestAnimationFrame(function () {
            				var vw = appView ? appView.value : null;
            				if (navigator.pageControl.updateLayout) {
            					navigator.pageControl.updateLayout.call(navigator.pageControl, navigator.pageElement, vw, navigator._lastViewstate);
            				}
            				var layoutCtrls = navigator.pageControl.element.querySelectorAll('.mcn-layout-ctrl');
            				if (layoutCtrls && layoutCtrls.length) {
            					for (var i = 0 ; i < layoutCtrls.length; i++) {
            						var ctrl = layoutCtrls[i].winControl;
            						if (ctrl.updateLayout)
            							ctrl.updateLayout(ctrl.element, vw, navigator._lastViewstate);
            					}
            				}
            				//WinJS.UI.Animation.fadeIn(navigator.pageControl.element);
            			});
            		}
            		this._lastViewstate = appView ? appView.value : null;
            	},

            	_handleBack: function () {
            		nav.back();
            	},

            	// Updates the back button state. Called after navigation has
            	// completed.
            	_updateBackButton: function (element) {
            		var ctrl = this;
            		var backButtons = element.querySelectorAll(".win-backbutton, .back-button, .win-navigation-backbutton");
            		//var backButton = this.pageElement.querySelector("header[role=banner] .win-backbutton");

            		if (backButtons && backButtons.length > 0) {
            			var clearNav = false;
            			//console.log('nav:' + JSON.stringify(args.detail.state))
            			//if (args && args.detail && args.detail.state && args.detail.state.clearNavigationHistory)
            			//    clearNav = args.detail.state.clearNavigationHistory;

            			for (var i = 0, l = backButtons.length; i < l ; i++) {
            				var btn = backButtons[i];
            				if (ctrl.canGoBack && !clearNav) {
            					btn.classList.remove('disabled');
            					btn.disabled = false;
            				} else {
            					btn.classList.add('disabled');
            					btn.disabled = true;
            				}

            				btn.onclick = function (arg) {
            					if (ctrl.global) {
            						nav.back();
            					}
            					else {
            						var navigator = WinJSContrib.UI.parentNavigator(arg.currentTarget);
            						navigator.back();
            					}
            				}
            			}
            		}
            	}
            }
        ), WinJS.Utilities.eventMixin)
	});
})();
