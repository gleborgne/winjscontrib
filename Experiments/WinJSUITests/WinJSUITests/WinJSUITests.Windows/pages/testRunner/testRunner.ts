module WinJSContrib.UI.Tests {
    class TestRunnerPage extends WinJSContrib.UI.Pages.PageBase {
        registered: any[];
        collapsedrunner: HTMLElement;
        selectcampaign: HTMLSelectElement;
        currentCampaign: WinJSContrib.UI.Tests.ICampaign;
        testCampaignRunTemplate: WinJS.Binding.Template;
        scenariosList: HTMLElement;

        init(element, options) {
            this.registered = WinJSContrib.UI.Tests.RegisteredCampaigns;

            element.classList.add("mcn-testrunner");
        }

        processed(element, options) {
            var ctrl = this;

            if (this.registered) {
                ctrl.collapsedrunner.innerText = this.registered.length + " campaigns available";
                ctrl.registered.forEach(function (campaign, index) {
                    var opt = <HTMLOptionElement>document.createElement("OPTION");
                    opt.value = index + "";
                    opt.innerText = campaign.name;

                    ctrl.selectcampaign.appendChild(opt);
                });

                if (ctrl.registered.length) {
                    ctrl.selectCampaign(ctrl.registered[0]);
                }
            }

            ctrl.selectcampaign.onchange = function () {
                var val = ctrl.selectcampaign.value;
                var campaign = ctrl.registered[val];
                if (campaign) {
                    ctrl.selectCampaign(campaign);
                }
            }

            ctrl.collapsedrunner.onclick = function () {
                ctrl.element.classList.toggle("collapsed");
                ctrl.element.classList.toggle("expanded");
            }

            //ctrl.closeTestRunner.onclick = function () {
            //    ctrl.element.classList.remove("expanded");
            //    ctrl.element.classList.add("collapsed");
            //}
        }

        selectCampaign(campaign) {
            var ctrl = this;
            ctrl.currentCampaign = campaign;
            ctrl.scenariosList.innerHTML = "";

            campaign.scenarios.forEach(function (scenario, index) {
                if (scenario) {
                    var name = scenario.name;
                    var scenarioElt = document.createElement("DIV")
                    scenarioElt.className = "scenario";
                    scenarioElt.innerHTML =
                        `<header>
                            <div class="status" data-win-bind="innerText : state WinJSContrib.UI.Tests.scenarioStatus"></div>
                            <div class="name" data-win-bind="innerText : name"></div>
                            <div class="duration" data-win-bind="innerText : duration; opacity : duration WinJSContrib.Bindings.showIf"></div>
                            <button class="runscenario" data-win-bind="disabled : disabled WinJSContrib.Bindings.disableIf">Run</button>
                        </header>
                        <section data-win-bind="innerText : message; display: message WinJSContrib.Bindings.showIf"></section>`;
                    WinJS.Binding.processAll(scenarioElt, scenario);
                    ctrl.scenariosList.appendChild(scenarioElt);
                    WinJSContrib.UI.tap(scenarioElt.querySelector(".runscenario"), () => {
                        if (ctrl.currentCampaign) {
                            ctrl.collapsedrunner.innerHTML = '';
                            return ctrl.testCampaignRunTemplate.render(ctrl.currentCampaign, ctrl.collapsedrunner).then(function () {
                                ctrl.closeTestRunner();
                                return ctrl.currentCampaign.runScenario(scenario);
                            });
                        }
                    });
                }
            });
        }

        closeTestRunner() {
            var ctrl = this;
            ctrl.element.classList.remove("expanded");
            ctrl.element.classList.add("collapsed");
        }

        runCampaign() {
            var ctrl = this;

            if (ctrl.currentCampaign) {
                ctrl.collapsedrunner.innerHTML = '';
                return ctrl.testCampaignRunTemplate.render(ctrl.currentCampaign, ctrl.collapsedrunner).then(function () {
                    ctrl.closeTestRunner();
                    return ctrl.currentCampaign.run();
                });
            }
        }
    }

    export var RunnerCtrl = WinJS.UI.Pages.define("/pages/testRunner/testRunner.html", TestRunnerPage);

    export var scenarioStatus = WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
        function setState(newval, oldval) {
            var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
            if (data == WinJSContrib.UI.Tests.TestStatus.running) {
                dest.className = "status running";
            } else if (data == WinJSContrib.UI.Tests.TestStatus.pending) {
                dest.className = "status pending";
            } else if (data == WinJSContrib.UI.Tests.TestStatus.success) {
                dest.className = "status success";
            } else if (data == WinJSContrib.UI.Tests.TestStatus.failed) {
                dest.className = "status failed";
            }
        }

        var bindingDesc = {};
        bindingDesc[sourceProperty] = setState;
        return WinJS.Binding.bind(source, bindingDesc);
    });

    export var campaignStatus = WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
        function setState(newval, oldval) {
            if (source.nbFail > 0) {
                dest.classList.add("failed");
            }

            if (source.nbRunned == source.total && source.nbFail == 0) {
                dest.classList.add("success");
            }
        }

        var bindingDesc = {};
        bindingDesc[sourceProperty] = setState;
        return WinJS.Binding.bind(source, bindingDesc);
    });    

    export var toDuration = WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
        function setState(newval, oldval) {
            if (!newval) {
                dest.innerText = "";
                return;
            }

            if (newval > 60) {
                var minutes = ((newval / 60) << 0);
                var seconds = (newval - (minutes * 60)) << 0;
                dest.innerText = minutes + "min" + seconds;
            } else {
                dest.innerText = newval.toFixed(1) + "s";
            }
        }

        var bindingDesc = {};
        bindingDesc[sourceProperty] = setState;
        return WinJS.Binding.bind(source, bindingDesc);
    });    
}
