var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __global = this;
var WinJSContrib;
(function (WinJSContrib) {
    var UI;
    (function (UI) {
        var Tests;
        (function (Tests) {
            Tests.logger = WinJSContrib.Logs.getLogger("WinJSContrib.UI.Tests");
            Tests.config = {
                runSetup: null,
                runTeardown: null,
                pageNavigationDelay: 200,
                childViewPageNavigationDelay: 300
            };
            function makeAbsoluteUri(uri) {
                var a = document.createElement("a");
                a.href = uri;
                return a.href;
            }
            (function (TestStatus) {
                TestStatus[TestStatus["failed"] = 0] = "failed";
                TestStatus[TestStatus["success"] = 1] = "success";
                TestStatus[TestStatus["running"] = 2] = "running";
                TestStatus[TestStatus["pending"] = -1] = "pending";
            })(Tests.TestStatus || (Tests.TestStatus = {}));
            var TestStatus = Tests.TestStatus;
            Tests.RegisteredCampaigns = [];
            var BaseScenario = WinJS.Binding.define({
                name: '',
                message: '',
                duration: '',
                state: -1,
                disabled: false,
                run: null,
                setup: null,
                teardown: null
            });
            function createScenario(options) {
                var b = BaseScenario;
                var res = new b(options);
                return res;
            }
            Tests.createScenario = createScenario;
            function promiseForCallback(callback) {
                if (!callback)
                    return WinJS.Promise.wrap();
                return WinJS.Promise.as(callback());
            }
            var _Campaign = (function () {
                function _Campaign(name, scenarios) {
                    if (scenarios === void 0) { scenarios = []; }
                    this.name = name;
                    this.scenarios = scenarios;
                    this._initObservable();
                }
                _Campaign.prototype.run = function (options) {
                    var _this = this;
                    if (this.isRunning)
                        return;
                    var document = new Document(__global.document.body);
                    options = options || {};
                    this.total = this.scenarios.length;
                    this.nbFail = 0;
                    this.nbSuccess = 0;
                    this.nbRun = 0;
                    this.nbRunned = 0;
                    this.duration = 0;
                    this.isRunning = true;
                    this.scenarios.forEach(function (scenario) {
                        scenario.state = TestStatus.pending;
                        scenario.duration = "";
                        scenario.message = "";
                        scenario.disabled = true;
                    });
                    Tests.logger.info("CAMPAIGN START : " + this.name);
                    hookAlerts();
                    return promiseForCallback(Tests.config.runSetup).then(function () {
                        return WinJSContrib.Promise.waterfall(_this.scenarios, function (scenario) {
                            return _this._runScenario(document, scenario, options).then(function (data) {
                                return WinJS.Promise.timeout(50).then(function () {
                                    return data;
                                });
                            });
                        });
                    }).then(function (data) {
                        _this.isRunning = false;
                        _this.scenarios.forEach(function (scenario) {
                            scenario.disabled = false;
                        });
                        return data;
                    }).then(function (data) {
                        unHookAlerts();
                        Tests.logger.info("CAMPAIGN END : " + _this.name);
                        return promiseForCallback(Tests.config.runTeardown).then(function () {
                            return data;
                        });
                    });
                };
                _Campaign.prototype.runScenario = function (scenario, options) {
                    var _this = this;
                    if (this.isRunning)
                        return;
                    var document = new Document(__global.document.body);
                    options = options || {};
                    this.total = 1;
                    this.nbFail = 0;
                    this.nbSuccess = 0;
                    this.nbRun = 0;
                    this.nbRunned = 0;
                    this.duration = 0;
                    this.isRunning = true;
                    scenario.state = TestStatus.pending;
                    scenario.message = "";
                    scenario.duration = "";
                    this.scenarios.forEach(function (scenario) {
                        scenario.disabled = true;
                    });
                    hookAlerts();
                    return promiseForCallback(Tests.config.runSetup).then(function () {
                        return _this._runScenario(document, scenario, options);
                    }).then(function (data) {
                        _this.isRunning = false;
                        _this.scenarios.forEach(function (scenario) {
                            scenario.disabled = false;
                        });
                        return data;
                    }).then(function (data) {
                        unHookAlerts();
                        return promiseForCallback(Tests.config.runTeardown).then(function () {
                            return data;
                        });
                    });
                };
                _Campaign.prototype._runScenario = function (document, scenario, options) {
                    var _this = this;
                    options = options || {};
                    this.nbRun++;
                    scenario.state = TestStatus.running;
                    Tests.logger.info("TEST RUN START : " + scenario.name);
                    this.currentTest = scenario.name;
                    if (options.onteststart) {
                        options.onteststart(scenario);
                    }
                    var start = new Date();
                    return promiseForCallback(scenario.setup).then(function () {
                        return scenario.run(document);
                    }).then(function () {
                        scenario.state = TestStatus.success;
                        _this.nbRunned++;
                        _this.nbSuccess++;
                        scenario.message = "";
                        return { success: true };
                    }, function (err) {
                        scenario.state = TestStatus.failed;
                        _this.nbRunned++;
                        _this.nbFail++;
                        if (err.stack) {
                            scenario.message = (err.message ? err.message + '\r\n' : '') + err.stack;
                        }
                        else if (err.message) {
                            scenario.message = err.message;
                        }
                        else {
                            scenario.message = JSON.stringify(err);
                        }
                        Tests.logger.error(scenario.message);
                        return { success: false, error: err };
                    }).then(function (testresult) {
                        var end = new Date();
                        testresult.duration = (end - start) / 1000;
                        _this.duration += testresult.duration;
                        scenario.duration = testresult.duration.toFixed(1) + "s";
                        Tests.logger.info("TEST RUN END : " + scenario.name + " (success: " + testresult.success + ", in " + scenario.duration + ")");
                        return promiseForCallback(scenario.teardown).then(function () {
                            return testresult;
                        });
                    });
                };
                return _Campaign;
            }());
            Tests.Campaign = WinJS.Class.mix(_Campaign, WinJS.Binding.mixin, WinJS.Binding.expandProperties({ nbRun: 0, nbSuccess: 0, nbFail: 0, total: 0, currentTest: 0, nbRunned: 0, duration: 0, isRunning: false }));
            function _click(el) {
                Tests.logger.verbose("trigger click");
                if (el.mcnTapTracking) {
                    el.mcnTapTracking.callback(el, {});
                }
                else {
                    el.click();
                }
                return this;
            }
            function _waitForElement(parent, selector, condition, timeout) {
                if (condition === void 0) { condition = function (elt) { return true; }; }
                if (timeout === void 0) { timeout = 3000; }
                var completed = false;
                var optimeout = setTimeout(function () {
                    completed = true;
                }, timeout);
                var error = null;
                try {
                    throw new Error('element ' + selector + ' not found');
                }
                catch (exception) {
                    error = exception;
                }
                var p = new WinJS.Promise(function (taskcomplete, taskerror) {
                    var promise = p;
                    var check = function () {
                        var elt = parent.querySelector(selector);
                        if (!completed && elt && condition(elt)) {
                            completed = true;
                            clearTimeout(optimeout);
                            taskcomplete(elt);
                        }
                        else if (!completed) {
                            setTimeout(function () { check(); }, 50);
                        }
                        else {
                            completed = true;
                            taskerror(error);
                        }
                    };
                    check();
                });
                return p;
            }
            function _waitForClass(parent, classToWatch, timeout) {
                if (timeout === void 0) { timeout = 3000; }
                var completed = false;
                var optimeout = setTimeout(function () {
                    completed = true;
                }, timeout);
                var error = null;
                try {
                    throw new Error('class ' + classToWatch + ' not added');
                }
                catch (exception) {
                    error = exception;
                }
                var p = new WinJS.Promise(function (taskcomplete, taskerror) {
                    var promise = p;
                    var check = function () {
                        var hasClass = parent.classList.contains(classToWatch);
                        if (!completed && hasClass) {
                            completed = true;
                            clearTimeout(optimeout);
                            taskcomplete();
                        }
                        else if (!completed) {
                            setTimeout(function () { check(); }, 50);
                        }
                        else {
                            completed = true;
                            taskerror(error);
                        }
                    };
                    check();
                });
                return p;
            }
            function _waitForClassGone(parent, classToWatch, timeout) {
                if (timeout === void 0) { timeout = 3000; }
                var completed = false;
                var optimeout = setTimeout(function () {
                    completed = true;
                }, timeout);
                var error = null;
                try {
                    throw new Error('class ' + classToWatch + ' not removed');
                }
                catch (exception) {
                    error = exception;
                }
                var p = new WinJS.Promise(function (taskcomplete, taskerror) {
                    var promise = p;
                    var check = function () {
                        var classGone = !parent.classList.contains(classToWatch);
                        if (!completed && classGone) {
                            completed = true;
                            clearTimeout(optimeout);
                            taskcomplete();
                        }
                        else if (!completed) {
                            setTimeout(function () { check(); }, 50);
                        }
                        else {
                            completed = true;
                            taskerror(error);
                        }
                    };
                    check();
                });
                return p;
            }
            function _elementVisible(elt) {
                var e = getComputedStyle(elt);
                if (elt.parentElement) {
                    return _elementVisible(elt.parentElement);
                }
                else if (e.display != 'none' && e.visibility != 'hidden') {
                    return true;
                }
                return false;
            }
            var UIElementWrapper = (function () {
                function UIElementWrapper(element, selector) {
                    this.element = element;
                    this.selector = selector;
                }
                UIElementWrapper.prototype.getChildView = function (selector) {
                    var elt = this.on(selector);
                    if (elt.element.winControl && elt.element.winControl.navigator)
                        return new ChildView(elt.element, selector);
                    throw new Error("element " + selector + " is not a child view");
                };
                UIElementWrapper.prototype.on = function (selector) {
                    var elt = this.element.querySelector(selector);
                    if (!elt) {
                        Tests.logger.error("element action not found for " + selector);
                        throw new Error("element action not found for " + selector);
                    }
                    Tests.logger.verbose("element found " + selector);
                    var res = new UIElementWrapper(elt, selector);
                    return res;
                };
                UIElementWrapper.prototype.onAll = function (selector) {
                    var elts = this.element.querySelectorAll(selector);
                    var res = [];
                    if (!elts || !elts.length) {
                        Tests.logger.error("elements not found for " + selector);
                        throw new Error("elements not found for " + selector);
                    }
                    Tests.logger.verbose(elts.length + " elements found for " + selector);
                    for (var i = 0; i < elts.length; i++) {
                        res.push(new UIElementWrapper(elts[i], selector));
                    }
                    return res;
                };
                UIElementWrapper.prototype.wait = function (timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    return WinJS.Promise.timeout(timeout);
                };
                UIElementWrapper.prototype.waitForNavigatorPage = function (navigator, url, pagector, timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    var completed = false;
                    var error = null;
                    var absoluteUrl = makeAbsoluteUri(url);
                    try {
                        throw new Error('page ' + url + ' not found');
                    }
                    catch (exception) {
                        error = exception;
                    }
                    Tests.logger.verbose("wait for page " + url);
                    var optimeout = setTimeout(function () {
                        completed = true;
                    }, timeout);
                    var p = new WinJS.Promise(function (pagecomplete, pageerror) {
                        var promise = p;
                        var check = function () {
                            var pageControl = navigator.pageControl;
                            var location = null;
                            if (pageControl) {
                                location = pageControl.uri;
                            }
                            if (!completed && location === absoluteUrl) {
                                var pageControl = navigator.pageControl;
                                if (pageControl) {
                                    var p = pageControl.readyComplete;
                                    if (pageControl.pageLifeCycle) {
                                        p = pageControl.pageLifeCycle.steps.enter.promise;
                                    }
                                    p.then(function () {
                                        clearTimeout(optimeout);
                                        WinJS.Promise.timeout(Tests.config.pageNavigationDelay).then(function () {
                                            completed = true;
                                            var res;
                                            if (pagector) {
                                                var ctor = pagector;
                                                res = new ctor(pageControl.element);
                                            }
                                            else {
                                                res = new Page(pageControl.element);
                                            }
                                            Tests.logger.debug("navigated to " + url);
                                            pagecomplete(res);
                                        });
                                    });
                                }
                            }
                            else if (!completed) {
                                setTimeout(function () { check(); }, 50);
                            }
                            else {
                                completed = true;
                                Tests.logger.error("cannot navigate to " + url, error);
                                pageerror(error);
                            }
                        };
                        check();
                    });
                    return p;
                };
                UIElementWrapper.prototype.waitForPage = function (url, pagector, timeout) {
                    var ui = WinJSContrib.UI;
                    var navigator = (ui && ui.Application) ? ui.Application.navigator : undefined;
                    if (!navigator)
                        throw new Error("no global navigation defined");
                    return this.waitForNavigatorPage(navigator, url, pagector, timeout);
                };
                UIElementWrapper.prototype.waitForPageByCtor = function (pagector, timeout) {
                    var path = pagector.path;
                    if (!path) {
                        throw new Error("constructor of " + (typeof pagector) + " must have a path static property");
                    }
                    return this.waitForPage(path, pagector, timeout);
                };
                UIElementWrapper.prototype.clickAndWaitForPage = function (selector, pagetowait, pagector, timeout) {
                    this.on(selector).click();
                    return this.waitForPage(pagetowait, pagector, timeout);
                };
                UIElementWrapper.prototype.clickAndWaitForPageCtor = function (selector, pagector, timeout) {
                    this.on(selector).click();
                    return this.waitForPageByCtor(pagector, timeout);
                };
                UIElementWrapper.prototype.waitForClass = function (classToWatch, timeout) {
                    return _waitForClass(this.element, classToWatch, timeout);
                };
                UIElementWrapper.prototype.waitForClassGone = function (classToWatch, timeout) {
                    return _waitForClassGone(this.element, classToWatch, timeout);
                };
                UIElementWrapper.prototype.waitForElement = function (selector, timeout) {
                    return _waitForElement(this.element, selector, function (elt) { return true; }, timeout).then(function (elt) {
                        return new UIElementWrapper(elt, selector);
                    });
                };
                UIElementWrapper.prototype.waitForElementVisible = function (selector, timeout) {
                    return _waitForElement(this.element, selector, function (elt) {
                        return _elementVisible(elt);
                    }, timeout).then(function (elt) {
                        return new UIElementWrapper(elt, selector);
                    });
                };
                UIElementWrapper.prototype.click = function () {
                    _click(this.element);
                    return this;
                };
                UIElementWrapper.prototype.input = function (val) {
                    var elt = this.element;
                    elt.focus();
                    elt.value = val;
                    WinJSContrib.Utils.triggerEvent(elt, "change", true, true);
                    WinJSContrib.Utils.triggerEvent(elt, "input", true, true);
                    elt.blur();
                    return this;
                };
                UIElementWrapper.prototype.textMustEquals = function (val) {
                    if (this.element.innerText != val) {
                        throw new Error("text mismatch, expected \"" + val + "\" but found \"" + this.element.innerText + "\"");
                    }
                    return this;
                };
                UIElementWrapper.prototype.valueMustEquals = function (val) {
                    if (this.element.value != val) {
                        throw new Error("value mismatch, expected \"" + val + "\" but found \"" + this.element.value + "\"");
                    }
                    return this;
                };
                UIElementWrapper.prototype.disabledMustEquals = function (val) {
                    if (this.element.disabled != val) {
                        throw new Error("disabled mismatch, expected \"" + val + "\" but found \"" + this.element.disabled + "\"");
                    }
                    return this;
                };
                return UIElementWrapper;
            }());
            Tests.UIElementWrapper = UIElementWrapper;
            var Document = (function (_super) {
                __extends(Document, _super);
                function Document() {
                    _super.apply(this, arguments);
                }
                Document.prototype.clearHistory = function () {
                    WinJS.Navigation.history.backStack = [];
                };
                Document.prototype.navigateTo = function (url, args, pagector, timeout) {
                    var _this = this;
                    if (timeout === void 0) { timeout = 100; }
                    return WinJS.Navigation.navigate(url, args).then(function () {
                        return WinJS.Promise.timeout(timeout);
                    }).then(function () {
                        return _this.waitForPage(url, pagector);
                    });
                };
                Document.prototype.navigateToCtor = function (pagector, args, timeout) {
                    var path = pagector.path;
                    if (!path) {
                        throw new Error("constructor of " + (typeof pagector) + " must have a path static property");
                    }
                    return this.navigateTo(path, pagector, args, timeout);
                };
                return Document;
            }(UIElementWrapper));
            Tests.Document = Document;
            var Page = (function (_super) {
                __extends(Page, _super);
                function Page() {
                    _super.apply(this, arguments);
                }
                return Page;
            }(UIElementWrapper));
            Tests.Page = Page;
            var ChildView = (function (_super) {
                __extends(ChildView, _super);
                function ChildView() {
                    _super.apply(this, arguments);
                }
                ChildView.prototype.waitForPage = function (url, pagector, timeout) {
                    var _this = this;
                    var navigator = this.element.winControl.navigator;
                    if (!navigator) {
                        throw new Error("incoherent child view");
                    }
                    return this.ready().then(function () {
                        return _this.waitForNavigatorPage(navigator, url, pagector, timeout);
                    });
                };
                ChildView.prototype.ready = function () {
                    var _this = this;
                    return WinJS.Promise.timeout(Tests.config.childViewPageNavigationDelay).then(function () {
                        if (_this.element.winControl.openChildViewPromise)
                            return _this.element.winControl.openChildViewPromise;
                    });
                };
                ChildView.prototype.waitForPageClosed = function () {
                    if (this.element.winControl.closePagePromise) {
                        return this.element.winControl.closePagePromise;
                    }
                    else if (this.element.winControl.hideChildViewPromise) {
                        return this.element.winControl.hideChildViewPromise;
                    }
                    else {
                        throw new Error("childview not about to close");
                    }
                };
                ChildView.prototype.waitForClosed = function (timeout) {
                    if (this.element.winControl.hideChildViewPromise) {
                        return this.element.winControl.hideChildViewPromise;
                    }
                    return _waitForClass(this.element.winControl.rootElement, "hidden", timeout);
                };
                ChildView.prototype.cancel = function (timeout) {
                    var overlay = this.element.winControl.overlay;
                    if (overlay) {
                        _click(overlay);
                    }
                    else {
                        throw new Error("overlay not found for childview");
                    }
                };
                ChildView.prototype.withPage = function (url, pagector, callback, expectClosed, timeout) {
                    if (expectClosed === void 0) { expectClosed = false; }
                    var childview = this;
                    return this.waitForPage(url, pagector, timeout).then(function (childviewpage) {
                        return WinJS.Promise.as(callback(childviewpage, childview));
                    }).then(function () {
                        if (expectClosed)
                            return childview.waitForClosed();
                    }).then(function () {
                        return childview;
                    });
                };
                ChildView.prototype.withPageCtor = function (pagector, callback, expectClosed, timeout) {
                    if (expectClosed === void 0) { expectClosed = false; }
                    var childview = this;
                    return this.waitForPageByCtor(pagector, timeout).then(function (childviewpage) {
                        return WinJS.Promise.as(callback(childviewpage, childview));
                    }).then(function () {
                        if (expectClosed)
                            return childview.waitForClosed();
                    }).then(function () {
                        return childview;
                    });
                };
                ChildView.from = function (selector) {
                    var childviewElt = document.querySelector(selector);
                    if (!childviewElt) {
                        throw new Error("child view not found for " + selector);
                    }
                    return new WinJSContrib.UI.Tests.ChildView(childviewElt, selector);
                };
                return ChildView;
            }(UIElementWrapper));
            Tests.ChildView = ChildView;
            var _alert_messagebox = WinJSContrib.Alerts.messageBox;
            var _alert_messageboxhook = WinJSContrib.Alerts.messageBox;
            var _alert_confirm = WinJSContrib.Alerts.confirm;
            var _alert_confirmhook = WinJSContrib.Alerts.confirm;
            var _messageboxreply = {};
            var _confirmreply = true;
            function messageBoxReplyWith(reply) {
                _messageboxreply = reply;
            }
            Tests.messageBoxReplyWith = messageBoxReplyWith;
            function confirmReplyWith(reply) {
                _confirmreply = reply;
            }
            Tests.confirmReplyWith = confirmReplyWith;
            function hookAlerts() {
                if (WinJSContrib.Alerts) {
                    _alert_messageboxhook = function (opt) {
                        Tests.logger.info("replying to alert call with " + _messageboxreply);
                        if (typeof _messageboxreply == "function") {
                            return WinJS.Promise.as(_messageboxreply(opt));
                        }
                        else {
                            return WinJS.Promise.wrap(_messageboxreply);
                        }
                    };
                    _alert_confirmhook = function (title, content, yes, no) {
                        Tests.logger.info("replying to confirm alert call with " + _confirmreply);
                        return WinJS.Promise.wrap(_confirmreply);
                    };
                    WinJSContrib.Alerts.messageBox = _alert_messageboxhook;
                    WinJSContrib.Alerts.confirm = _alert_confirmhook;
                }
            }
            Tests.hookAlerts = hookAlerts;
            function unHookAlerts() {
                if (WinJSContrib.Alerts) {
                    WinJSContrib.Alerts.messageBox = _alert_messagebox;
                }
            }
            Tests.unHookAlerts = unHookAlerts;
        })(Tests = UI.Tests || (UI.Tests = {}));
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));
