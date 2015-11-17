/// <reference path="typings/typings/winjs/winjs.d.ts" />
/// <reference path="typings/winjscontrib/winjscontrib.core.d.ts" />
var __global = this;
module WinJSContrib.UI.Tests {
    export var RegisteredCampaigns: ICampaign[] = [];
    export var Scenario = WinJS.Binding.define({
        name: '',
        message: '',
        state: -1,
        run: null
    });

    export interface IScenario {
        name: string;
        message: string;
        state: number;
        run(document: Document) : WinJS.Promise<any>;
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
    }

    class _Campaign {
        public nbRun: number;
        public nbSuccess: number;
        public nbFail: number;
        public total: number;
        public currentTest: string;
        public isRunning:boolean;
           
        constructor(public name: string, public scenarios: IScenario[] = []) {
            (<any>this)._initObservable();
        }

        run(options?: IRunOptions): WinJS.Promise<any> {
            var document = new Document(__global.document.body);
            options = options || {};

            this.total = this.scenarios.length;
            this.nbFail = 0;
            this.nbSuccess = 0;
            this.nbRun = 0;
            this.isRunning = true;

            this.scenarios.forEach(function (scenario) {
                scenario.state = -1;
            });

            return WinJSContrib.Promise.waterfall(this.scenarios, (scenario: IScenario) => {
                return this.runScenario(document, scenario, options);
            }).then((data) => {
                this.isRunning = false;
                return data;
            });
        }

        runScenario(document: Document, scenario: IScenario, options?: IRunOptions) {
            options = options || {};
            this.nbRun++;
            scenario.state = 2;
            console.info("RUNNING " + scenario.name);
            this.currentTest = scenario.name;

            if (options.onteststart) {
                options.onteststart(scenario);
            }

            return scenario.run(document).then(() => {
                scenario.state = 1;
                this.nbSuccess++;
                return { success: true };
            }, (err) => {
                scenario.state = 0;
                this.nbFail++;
                if (err.stack) {
                    scenario.message = err.stack;
                } else if (err.message) {
                    scenario.message = err.message;
                } else {
                    scenario.message = JSON.stringify(err);
                }

                return { success: false, error: err };
            });
        }
    }

    export var Campaign = WinJS.Class.mix(
        _Campaign,
        WinJS.Binding.mixin,
        WinJS.Binding.expandProperties({ nbRun: 0, nbSuccess: 0, nbFail: 0, total: 0, currentTest: 0, isRunning: false })
    );
    

    export class UIElementAction {
        constructor(public element: HTMLElement) {
        }

        click() {
            var el = <any>this.element;
            console.log("trigger click");
            if (el.mcnTapTracking) {
                el.mcnTapTracking.callback(el, {});
            } else {
                this.element.click();
            }
        }

        input(val: string) {
            (this.element as HTMLInputElement).value = val;
        }
    }

    export class UIElementCheck {
        constructor(public element: HTMLElement) {
        }

        hasText(val : string) {
            throw new Error("not implemented");
        }

        hasValue(val: string) {
            throw new Error("not implemented");
        }
    }
    
    export class UIElementRoot {
        constructor(public root: HTMLElement) {
        }

        on(selector: string): UIElementAction {
            var elt = <HTMLElement>this.root.querySelector(selector);
            if (!elt) {
                console.error("element action not found for " + selector);
                throw new Error("element action not found for " + selector);
            }
            console.log("element found " + selector);
            var res = new UIElementAction(elt);
            return res;
        }

        check(selector: string): UIElementCheck {
            var elt = <HTMLElement>this.root.querySelector(selector);
            if (!elt)
                throw new Error("element check not found for " + selector);

            var res = new UIElementCheck(elt);
            return res;
        }

        _waitForElement(selector: string, timeout: number = 3000): WinJS.Promise<HTMLElement> {
            var completed = false;
            var optimeout = setTimeout(() => {
                completed = true;
            }, timeout);

            var p = new WinJS.Promise<HTMLElement>((complete, error) => {
                var promise = p as any;
                var check = function () {
                    var elt = <HTMLElement>this.root.querySelector(selector);
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

        waitForElement(selector: string, timeout: number = 3000): WinJS.Promise<UIElementAction> {
            return this._waitForElement(selector, timeout).then((elt) => {
                return new UIElementAction(elt);
            });
        }

        waitForRoot(selector: string, timeout: number = 3000): WinJS.Promise<UIElementRoot> {
            return this._waitForElement(selector, timeout).then((elt) => {
                return new UIElementRoot(elt);
            });
        }
    }

    export class Document extends UIElementRoot {
        clearHistory() {
            WinJS.Navigation.history.backStack = [];
        }

        navigateTo(url: string, args: any): WinJS.Promise<Page>{
            return WinJS.Navigation.navigate(url, args).then(() => {
                return WinJS.Promise.timeout(100);
            }).then(() => {
                return this.waitForPage(url);
            });
        }

        wait(timeout: number = 3000): WinJS.Promise<any> {
            return WinJS.Promise.timeout(timeout);
        }

        waitForPage(url: string, timeout: number = 3000): WinJS.Promise<Page> {
            var completed = false;
            console.log("wait for page " + url);
            var optimeout = setTimeout(() => {
                completed = true;
            }, timeout);

            var p = new WinJS.Promise<Page>((pagecomplete, pageerror) => {
                var promise = p as any;
                var check = function () {
                    if (!completed && WinJS.Navigation.location === url) {
                        var ui = (<any>WinJSContrib.UI);
                        var navigator = (ui && ui.Application) ? ui.Application.navigator : undefined;
                        if (!navigator)
                            throw new Error("no global navigation defined");

                        var pageControl = navigator.pageControl;
                        if (pageControl) {
                            
                            var p = pageControl.readyComplete;
                            if (pageControl.pageLifeCycle) {
                                p = pageControl.pageLifeCycle.steps.ready.promise;
                            }
                            p.then(function () {
                                clearTimeout(optimeout);
                                completed = true;
                                console.log("page found " + url);

                                //setTimeout(function () {
                                    var res = new Page(pageControl.element);
                                    pagecomplete(res);
                                //}, 50);
                            });                            
                        }
                    } else if (!completed) {
                        setTimeout(() => { check(); }, 50);
                    } else {
                        completed = true;
                        console.error('page not found ' + url);
                        pageerror({ message : 'page not found ' + url});
                    }
                }
                check();
            });

            return p;
        }
    }

    export class Page extends UIElementRoot {
    }
}