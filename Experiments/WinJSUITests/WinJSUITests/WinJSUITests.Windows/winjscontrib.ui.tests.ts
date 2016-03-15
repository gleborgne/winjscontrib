var __global = this;
module WinJSContrib.UI.Tests {
    export var pageNavigationDelay = 200;

    function makeAbsoluteUri(uri) {
        var a = document.createElement("a");
        a.href = uri;
        return a.href;
    }

    export enum TestStatus {
        failed = 0,
        success = 1,
        running = 2,
        pending = -1
    }

    export var RegisteredCampaigns: ICampaign[] = [];

    var BaseScenario = WinJS.Binding.define({
        name: '',
        message: '',
        duration: '',
        state: -1,
        disabled: false,
        run: null
    });

    export interface IScenarioCreationOptions {
        name: string;
        run(document: Document): WinJS.Promise<any>;
    }

    export function createScenario(options: IScenarioCreationOptions): IScenario {
        var b = <any>BaseScenario;
        var res = new b(options) as IScenario;
        return res;
    }

    export interface IScenario {
        name: string;
        message: string;
        duration: string;
        state: number;
        disabled: boolean;
        run(document: Document): WinJS.Promise<any>;
    }

    export interface IRunOptions {
        onteststart?: (Scenario: IScenario) => void;
        ontestend?: (Scenario: IScenario) => void;
    }

    export interface ICampaign {
        name: string;
        scenarios: IScenario[];
        nbRun: number;
        nbSuccess: number;
        nbFail: number;
        total: number;
        currentTest: string;
        isRunning: boolean;
        run(options?: IRunOptions): WinJS.Promise<any>;
        runScenario(scenario: IScenario, options?: IRunOptions);
    }

    export interface ITestResult {
        duration?: number;
        success: boolean;
        error: any;
    }

    class _Campaign {
        public nbRun: number;
        public nbRunned: number;
        public nbSuccess: number;
        public nbFail: number;
        public total: number;
        public duration: number;
        public currentTest: string;
        public isRunning: boolean;

        constructor(public name: string, public scenarios: IScenario[] = []) {
            (<any>this)._initObservable();
        }

        run(options?: IRunOptions): WinJS.Promise<any> {
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

            return WinJSContrib.Promise.waterfall(this.scenarios, (scenario: IScenario) => {
                return this._runScenario(document, scenario, options);
            }).then((data) => {
                this.isRunning = false;
                return data;
            });
        }

        public runScenario(scenario: IScenario, options?: IRunOptions) {
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

            return this._runScenario(document, scenario, options).then((data) => {
                this.isRunning = false;
                this.scenarios.forEach(function (scenario) {
                    scenario.disabled = false;
                });
                return data;
            });
        }

        private _runScenario(document: Document, scenario: IScenario, options?: IRunOptions) {
            options = options || {};
            this.nbRun++;
            scenario.state = TestStatus.running;
            console.info("RUNNING " + scenario.name);
            this.currentTest = scenario.name;

            if (options.onteststart) {
                options.onteststart(scenario);
            }
            var start = new Date();
            return scenario.run(document).then(() => {
                scenario.state = TestStatus.success;
                this.nbRunned++;
                this.nbSuccess++;
                scenario.message = "";
                return <ITestResult>{ success: true };
            }, (err) => {
                scenario.state = TestStatus.failed;
                this.nbRunned++;
                this.nbFail++;
                if (err.stack) {
                    scenario.message = err.stack;
                } else if (err.message) {
                    scenario.message = err.message;
                } else {
                    scenario.message = JSON.stringify(err);
                }

                return <ITestResult>{ success: false, error: err };
            }).then((testresult) => {
                var end = new Date();
                testresult.duration = (<any>end - <any>start) / 1000;
                this.duration += testresult.duration;
                scenario.duration = testresult.duration.toFixed(1) + "s";
                return testresult;
            });
        }
    }

    export var Campaign = WinJS.Class.mix(
        _Campaign,
        WinJS.Binding.mixin,
        WinJS.Binding.expandProperties({ nbRun: 0, nbSuccess: 0, nbFail: 0, total: 0, currentTest: 0, nbRunned: 0, duration: 0, isRunning: false })
    );

    function _waitForElement(parent: HTMLElement, selector: string, timeout: number = 3000): WinJS.Promise<HTMLElement> {
        var completed = false;
        var optimeout = setTimeout(() => {
            completed = true;
        }, timeout);

        var p = new WinJS.Promise<HTMLElement>((complete, error) => {
            var promise = p as any;
            var check = function () {
                var elt = <HTMLElement>parent.querySelector(selector);
                if (!completed && elt) {
                    completed = true;
                    clearTimeout(optimeout);
                    complete(elt);
                } else if (!completed) {
                    setTimeout(() => { check(); }, 50);
                } else {
                    completed = true;
                    error({ message: 'element not found ' + selector });
                }
            }
            check();
        });

        return p;
    }

    function _waitForClass(parent: HTMLElement, classToWatch: string, timeout: number = 3000): WinJS.Promise<any> {
        var completed = false;
        var optimeout = setTimeout(() => {
            completed = true;
        }, timeout);

        var p = new WinJS.Promise<HTMLElement>((complete, error) => {
            var promise = p as any;
            var check = function () {
                var hasClass = parent.classList.contains(classToWatch);
                if (!completed && hasClass) {
                    completed = true;
                    clearTimeout(optimeout);
                    complete();
                } else if (!completed) {
                    setTimeout(() => { check(); }, 50);
                } else {
                    completed = true;
                    error({ message: 'class not added ' + classToWatch });
                }
            }
            check();
        });

        return p;
    }

    function _waitForClassGone(parent: HTMLElement, classToWatch: string, timeout: number = 3000): WinJS.Promise<any> {
        var completed = false;
        var optimeout = setTimeout(() => {
            completed = true;
        }, timeout);

        var p = new WinJS.Promise<HTMLElement>((complete, error) => {
            var promise = p as any;
            var check = function () {
                var classGone = !parent.classList.contains(classToWatch);
                if (!completed && classGone) {
                    completed = true;
                    clearTimeout(optimeout);
                    complete();
                } else if (!completed) {
                    setTimeout(() => { check(); }, 50);
                } else {
                    completed = true;
                    error({ message: 'class not gone ' + classToWatch });
                }
            }
            check();
        });

        return p;
    }

    export class UIElementWrapper {
        constructor(public element: HTMLElement, public selector?: string) {
        }

        getChildView(selector: string): ChildView {
            var elt = this.on(selector);

            if (elt.element.winControl && elt.element.winControl.navigator)
                return new ChildView(elt.element, selector);

            throw new Error("element " + selector + " is not a child view");
        }

        on(selector: string): UIElementWrapper {
            var elt = <HTMLElement>this.element.querySelector(selector);
            if (!elt) {
                console.error("element action not found for " + selector);
                throw new Error("element action not found for " + selector);
            }
            console.log("element found " + selector);
            var res = new UIElementWrapper(elt, selector);
            return res;
        }

        wait(timeout: number = 3000): WinJS.Promise<any> {
            return WinJS.Promise.timeout(timeout);
        }

        waitForNavigatorPage(navigator, url: string, timeout: number = 3000): WinJS.Promise<Page> {
            var completed = false;
            var error = null;
            var absoluteUrl = makeAbsoluteUri(url);
            try {
                throw new Error('page ' + url + ' not found');
            } catch (exception) {
                error = exception;
            }

            console.log("wait for page " + url);
            var optimeout = setTimeout(() => {
                completed = true;
            }, timeout);

            var p = new WinJS.Promise<Page>((pagecomplete, pageerror) => {
                var promise = p as any;
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
                                WinJS.Promise.timeout(pageNavigationDelay).then(() => {
                                    completed = true;
                                    console.log("page found " + url);

                                    //setTimeout(function () {
                                    var res = new Page(pageControl.element);
                                    pagecomplete(res);
                                    //}, 50);
                                });
                            });
                        }
                    } else if (!completed) {
                        setTimeout(() => { check(); }, 50);
                    } else {
                        completed = true;
                        pageerror(error);
                    }
                }
                check();
            });

            return p;
        }

        waitForPage(url: string, timeout: number = 3000): WinJS.Promise<Page> {
            var ui = (<any>WinJSContrib.UI);

            var navigator = (ui && ui.Application) ? ui.Application.navigator : undefined;
            if (!navigator)
                throw new Error("no global navigation defined");

            return this.waitForNavigatorPage(navigator, url, timeout);
        }

        clickAndWaitForPage(selector: string, pagetowait: string, timeout?: number): WinJS.Promise<Page> {
            this.on(selector).click();
            return this.waitForPage(pagetowait, timeout);
        }

        waitForClass(classToWatch: string, timeout: number = 3000): WinJS.Promise<any> {
            return _waitForClass(this.element, classToWatch, timeout);
        }

        waitForClassGone(classToWatch: string, timeout: number = 3000): WinJS.Promise<any> {
            return _waitForClassGone(this.element, classToWatch, timeout);
        }

        waitForElement(selector: string, timeout: number = 3000): WinJS.Promise<UIElementWrapper> {
            return _waitForElement(this.element, selector, timeout).then((elt) => {
                return new UIElementWrapper(elt, selector);
            });
        }

        click() {
            var el = <any>this.element;
            console.log("trigger click");
            if (el.mcnTapTracking) {
                el.mcnTapTracking.callback(el, {});
            } else {
                this.element.click();
            }

            return this;
        }

        input(val: string) {
            var elt = this.element as HTMLInputElement;
            elt.focus();
            elt.value = val;
            WinJSContrib.Utils.triggerEvent(elt, "change", true, true);
            elt.blur();
            return this;
        }

        textMustEquals(val: string) {
            if (this.element.innerText != val) {
                throw new Error("text mismatch, expected \"" + val + "\" but found \"" + this.element.innerText + "\"");
            }
            return this;
        }

        valueMustEquals(val: string) {
            if ((this.element as HTMLInputElement).value != val) {
                throw new Error("value mismatch, expected \"" + val + "\" but found \"" + (this.element as HTMLInputElement).value + "\"");
            }
            return this;
        }

        disabledMustEquals(val: boolean) {
            if ((this.element as HTMLButtonElement).disabled != val) {
                throw new Error("disabled mismatch, expected \"" + val + "\" but found \"" + (this.element as HTMLButtonElement).disabled + "\"");
            }
            return this;
        }
    }

    export class Document extends UIElementWrapper {
        clearHistory() {
            WinJS.Navigation.history.backStack = [];
        }

        navigateTo(url: string, args?: any): WinJS.Promise<Page> {
            return WinJS.Navigation.navigate(url, args).then(() => {
                return WinJS.Promise.timeout(100);
            }).then(() => {
                return this.waitForPage(url);
            });
        }
    }

    export class Page extends UIElementWrapper {
    }

    export class ChildView extends UIElementWrapper {
        waitForPage(url: string, timeout: number = 3000): WinJS.Promise<Page> {
            var navigator = this.element.winControl.navigator;
            if (!navigator) {
                throw new Error("incoherent child view");
            }

            return this.waitForNavigatorPage(navigator, url, timeout);
        }
    }
}