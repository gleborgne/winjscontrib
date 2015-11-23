var UITests = UITests || {};
UITests.Scenarios = UITests.Scenarios || {};

(function () {
    'use strict';

    WinJSContrib.UI.Tests.RegisteredCampaigns.push(new WinJSContrib.UI.Tests.Campaign("Basics",
        [
            UITests.Scenarios.simpleNavigation,
            UITests.Scenarios.fillForm
        ]));
})();