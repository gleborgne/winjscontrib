(function () {
    "use strict";

    WinJS.UI.Pages.define('./demos/settings/about/aboutPage.html', {
        ready: function (element, options) {            
            var version = Windows.ApplicationModel.Package.current.id.version;
            var versionElt = element.querySelector('#versionNumber');
            versionElt.innerText = version.major + '.' + version.minor + '.' + version.build + '.' + version.revision;
        }
    });
})();
