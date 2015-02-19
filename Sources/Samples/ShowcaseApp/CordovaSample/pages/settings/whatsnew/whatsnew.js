/// <reference path="../../js/_references.js" />
(function () {
    "use strict";

    WinJS.UI.Pages.define('./pages/settings/whatsnew/whatsnew.html', {
        ready: function (element, options) {
            var that = this;
            that.readNews();

            $('#rateButton').tap(function () {
                var uri = new Windows.Foundation.Uri("ms-windows-store:REVIEW?PFN=" + Windows.ApplicationModel.Package.current.id.familyName);
                Windows.System.Launcher.launchUriAsync(uri)
                var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                roamingSettings.values["rateok"] = true;
                roamingSettings.values["version"] = Windows.ApplicationModel.Package.current.id.version.major + "." + Windows.ApplicationModel.Package.current.id.version.minor + "." + Windows.ApplicationModel.Package.current.id.version.revision;
                // that.element.winControl.hide();
            });
        },

        readNews: function () {
            var that = this;
            var template_news = that.element.querySelector('#templatenews').winControl;
            var listnews = that.element.querySelector('#listnews');
            Windows.ApplicationModel.Package.current.installedLocation.getFileAsync("pages\\settings\\whatsnew\\whatsnew.json").then(function (file) {
                return Windows.Storage.FileIO.readTextAsync(file).then(function (data) {
                    var programsdata = JSON.parse(data);
                    programsdata.data.forEach(function (version) {
                        var ver = document.createElement('div');
                        ver.className = "version";
                        ver.innerHTML = "Version " + version.version;
                        listnews.appendChild(ver);
                        version.news.forEach(function (textnews) {
                            template_news.render(textnews).done(function (elt) {
                                var children = elt.children[0];
                                listnews.appendChild(children);
                            });
                        });
                    });
                });
            });
        },

        updateLayout: function (element, viewState, lastViewState) {
        },

        unload: function () {
        }
    });
})();
