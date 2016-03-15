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
            Tests.pageNavigationDelay = 200;
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
                    var p = null;
                    if (Tests.testRunSetup) {
                        p = WinJS.Promise.as(Tests.testRunSetup());
                    }
                    else {
                        p = WinJS.Promise.wrap();
                    }
                    return p.then(function () {
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
                        if (Tests.testRunTeardown) {
                            return WinJS.Promise.as(Tests.testRunTeardown()).then(function () {
                                return data;
                            });
                        }
                        return data;
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
                    var p = null;
                    if (Tests.testRunSetup) {
                        p = WinJS.Promise.as(Tests.testRunSetup());
                    }
                    else {
                        p = WinJS.Promise.wrap();
                    }
                    return p.then(function () {
                        return _this._runScenario(document, scenario, options);
                    }).then(function (data) {
                        _this.isRunning = false;
                        _this.scenarios.forEach(function (scenario) {
                            scenario.disabled = false;
                        });
                        return data;
                    }).then(function (data) {
                        if (Tests.testRunTeardown) {
                            return WinJS.Promise.as(Tests.testRunTeardown()).then(function () {
                                return data;
                            });
                        }
                        return data;
                    });
                };
                _Campaign.prototype._runScenario = function (document, scenario, options) {
                    var _this = this;
                    options = options || {};
                    this.nbRun++;
                    scenario.state = TestStatus.running;
                    console.info("RUNNING " + scenario.name);
                    this.currentTest = scenario.name;
                    if (options.onteststart) {
                        options.onteststart(scenario);
                    }
                    var start = new Date();
                    var p = null;
                    if (scenario.setup) {
                        p = WinJS.Promise.as(scenario.setup());
                    }
                    else {
                        p = WinJS.Promise.wrap();
                    }
                    return p.then(function () {
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
                            scenario.message = err.stack;
                        }
                        else if (err.message) {
                            scenario.message = err.message;
                        }
                        else {
                            scenario.message = JSON.stringify(err);
                        }
                        return { success: false, error: err };
                    }).then(function (testresult) {
                        var end = new Date();
                        testresult.duration = (end - start) / 1000;
                        _this.duration += testresult.duration;
                        scenario.duration = testresult.duration.toFixed(1) + "s";
                        if (scenario.teardown) {
                            return WinJS.Promise.as(scenario.teardown()).then(function () {
                                return testresult;
                            });
                        }
                        return testresult;
                    });
                };
                return _Campaign;
            })();
            Tests.Campaign = WinJS.Class.mix(_Campaign, WinJS.Binding.mixin, WinJS.Binding.expandProperties({ nbRun: 0, nbSuccess: 0, nbFail: 0, total: 0, currentTest: 0, nbRunned: 0, duration: 0, isRunning: false }));
            function _waitForElement(parent, selector, timeout) {
                if (timeout === void 0) { timeout = 3000; }
                var completed = false;
                var optimeout = setTimeout(function () {
                    completed = true;
                }, timeout);
                var p = new WinJS.Promise(function (complete, error) {
                    var promise = p;
                    var check = function () {
                        var elt = parent.querySelector(selector);
                        if (!completed && elt) {
                            completed = true;
                            clearTimeout(optimeout);
                            complete(elt);
                        }
                        else if (!completed) {
                            setTimeout(function () { check(); }, 50);
                        }
                        else {
                            completed = true;
                            error({ message: 'element not found ' + selector });
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
                var p = new WinJS.Promise(function (complete, error) {
                    var promise = p;
                    var check = function () {
                        var hasClass = parent.classList.contains(classToWatch);
                        if (!completed && hasClass) {
                            completed = true;
                            clearTimeout(optimeout);
                            complete();
                        }
                        else if (!completed) {
                            setTimeout(function () { check(); }, 50);
                        }
                        else {
                            completed = true;
                            error({ message: 'class not added ' + classToWatch });
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
                var p = new WinJS.Promise(function (complete, error) {
                    var promise = p;
                    var check = function () {
                        var classGone = !parent.classList.contains(classToWatch);
                        if (!completed && classGone) {
                            completed = true;
                            clearTimeout(optimeout);
                            complete();
                        }
                        else if (!completed) {
                            setTimeout(function () { check(); }, 50);
                        }
                        else {
                            completed = true;
                            error({ message: 'class not gone ' + classToWatch });
                        }
                    };
                    check();
                });
                return p;
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
                        console.error("element action not found for " + selector);
                        throw new Error("element action not found for " + selector);
                    }
                    console.log("element found " + selector);
                    var res = new UIElementWrapper(elt, selector);
                    return res;
                };
                UIElementWrapper.prototype.wait = function (timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    return WinJS.Promise.timeout(timeout);
                };
                UIElementWrapper.prototype.waitForNavigatorPage = function (navigator, url, timeout) {
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
                    console.log("wait for page " + url);
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
                                        WinJS.Promise.timeout(Tests.pageNavigationDelay).then(function () {
                                            completed = true;
                                            console.log("page found " + url);
                                            //setTimeout(function () {
                                            var res = new Page(pageControl.element);
                                            pagecomplete(res);
                                            //}, 50);
                                        });
                                    });
                                }
                            }
                            else if (!completed) {
                                setTimeout(function () { check(); }, 50);
                            }
                            else {
                                completed = true;
                                pageerror(error);
                            }
                        };
                        check();
                    });
                    return p;
                };
                UIElementWrapper.prototype.waitForPage = function (url, timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    var ui = WinJSContrib.UI;
                    var navigator = (ui && ui.Application) ? ui.Application.navigator : undefined;
                    if (!navigator)
                        throw new Error("no global navigation defined");
                    return this.waitForNavigatorPage(navigator, url, timeout);
                };
                UIElementWrapper.prototype.clickAndWaitForPage = function (selector, pagetowait, timeout) {
                    this.on(selector).click();
                    return this.waitForPage(pagetowait, timeout);
                };
                UIElementWrapper.prototype.waitForClass = function (classToWatch, timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    return _waitForClass(this.element, classToWatch, timeout);
                };
                UIElementWrapper.prototype.waitForClassGone = function (classToWatch, timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    return _waitForClassGone(this.element, classToWatch, timeout);
                };
                UIElementWrapper.prototype.waitForElement = function (selector, timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    return _waitForElement(this.element, selector, timeout).then(function (elt) {
                        return new UIElementWrapper(elt, selector);
                    });
                };
                UIElementWrapper.prototype.click = function () {
                    var el = this.element;
                    console.log("trigger click");
                    if (el.mcnTapTracking) {
                        el.mcnTapTracking.callback(el, {});
                    }
                    else {
                        this.element.click();
                    }
                    return this;
                };
                UIElementWrapper.prototype.input = function (val) {
                    var elt = this.element;
                    elt.focus();
                    elt.value = val;
                    WinJSContrib.Utils.triggerEvent(elt, "change", true, true);
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
            })();
            Tests.UIElementWrapper = UIElementWrapper;
            var Document = (function (_super) {
                __extends(Document, _super);
                function Document() {
                    _super.apply(this, arguments);
                }
                Document.prototype.clearHistory = function () {
                    WinJS.Navigation.history.backStack = [];
                };
                Document.prototype.navigateTo = function (url, args) {
                    var _this = this;
                    return WinJS.Navigation.navigate(url, args).then(function () {
                        return WinJS.Promise.timeout(100);
                    }).then(function () {
                        return _this.waitForPage(url);
                    });
                };
                return Document;
            })(UIElementWrapper);
            Tests.Document = Document;
            var Page = (function (_super) {
                __extends(Page, _super);
                function Page() {
                    _super.apply(this, arguments);
                }
                return Page;
            })(UIElementWrapper);
            Tests.Page = Page;
            var ChildView = (function (_super) {
                __extends(ChildView, _super);
                function ChildView() {
                    _super.apply(this, arguments);
                }
                ChildView.prototype.waitForPage = function (url, timeout) {
                    if (timeout === void 0) { timeout = 3000; }
                    var navigator = this.element.winControl.navigator;
                    if (!navigator) {
                        throw new Error("incoherent child view");
                    }
                    return this.waitForNavigatorPage(navigator, url, timeout);
                };
                ChildView.prototype.waitForClosed = function (timeout) {
                    return _waitForClass(this.element.winControl.rootElement, "hidden", timeout);
                };
                return ChildView;
            })(UIElementWrapper);
            Tests.ChildView = ChildView;
        })(Tests = UI.Tests || (UI.Tests = {}));
    })(UI = WinJSContrib.UI || (WinJSContrib.UI = {}));
})(WinJSContrib || (WinJSContrib = {}));
//# sourceMappingURL=winjscontrib.ui.tests.js.map