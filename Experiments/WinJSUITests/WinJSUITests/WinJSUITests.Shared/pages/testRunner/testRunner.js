// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    var ctor = WinJS.UI.Pages.define("/pages/testRunner/testRunner.html", {
        init: function (element, options) {
            this.registered = WinJSContrib.UI.Tests.RegisteredCampaigns;

            element.classList.add("mcn-testrunner");
        },

        processed: function (element, options) {
            var ctrl = this;

            if (this.registered) {
                ctrl.collapsedrunner.innerText = this.registered.length + " campaigns available";
                ctrl.registered.forEach(function (campaign, index) {
                    var opt = document.createElement("OPTION");
                    opt.value = index + "";
                    opt.innerText = campaign.name;

                    ctrl.selectcampaign.appendChild(opt);
                });
                ctrl.selectCampaign(ctrl.registered[0]);
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
        },

        selectCampaign: function (campaign) {
            var ctrl = this;
            ctrl.currentCampaign = campaign;
            ctrl.scenariosList.innerHTML = "";

            campaign.scenarios.forEach(function (scenario, index) {
                if (scenario) {
                    var name = scenario.name;
                    var scenarioElt = document.createElement("DIV")
                    scenarioElt.className = "scenario";
                    scenarioElt.innerHTML = '<header><div class="status" data-win-bind="innerText : state WinJSContrib.UI.Tests.scenarioStatus"></div><div class="name" data-win-bind="innerText : name"></div></header><section  data-win-bind="innerText : message; display: message WinJSContrib.Bindings.showIf"></section>';
                    WinJS.Binding.processAll(scenarioElt, scenario);
                    ctrl.scenariosList.appendChild(scenarioElt);
                }
            });
        },

        closeTestRunner: function () {
            var ctrl = this;
            ctrl.element.classList.remove("expanded");
            ctrl.element.classList.add("collapsed");
        },

        runCampaign: function () {
            var ctrl = this;
            
            if (ctrl.currentCampaign) {                
                ctrl.collapsedrunner.innerHTML = '';
                return ctrl.testCampaignRunTemplate.render(ctrl.currentCampaign, ctrl.collapsedrunner).then(function () {
                    ctrl.closeTestRunner();
                    return ctrl.currentCampaign.run();
                });
            }
        }
    });

    WinJS.Namespace.define("WinJSContrib.UI.Tests", {
        RunnerCtrl: ctor,
        scenarioStatus: WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
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
        }),

        campaignStatus: WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
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
        })
    });
})();
