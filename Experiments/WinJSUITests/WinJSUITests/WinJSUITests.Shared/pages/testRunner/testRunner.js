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
                ctrl.element.classList.remove("collapsed");
                ctrl.element.classList.add("expanded");
            }

            ctrl.closeTestRunner.onclick = function () {
                ctrl.element.classList.remove("expanded");
                ctrl.element.classList.add("collapsed");
            }
        },

        selectCampaign: function (campaign) {
            var ctrl = this;
            ctrl.currentCampaign = campaign;
            ctrl.scenariosList.innerHTML = "";

            campaign.scenarios.forEach(function (scenario, index) {                
                var scenarioElt = document.createElement("DIV")
                scenarioElt.className = "scenario";
                scenarioElt.innerHTML = '<div class="status"  data-win-bind="innerText : state"></div><div class="name" data-win-bind="innerText : name"></div>';
                WinJS.Binding.processAll(scenarioElt, scenario);
                ctrl.scenariosList.appendChild(scenarioElt);
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
                ctrl.testCampaignRunTemplate.render(ctrl.currentCampaign, ctrl.collapsedrunner).then(function () {
                    ctrl.closeTestRunner();
                    ctrl.currentCampaign.run();
                });
            }
        }
    });

    WinJS.Namespace.define("WinJSContrib.UI.Tests", {
        RunnerCtrl: ctor
    });
})();
