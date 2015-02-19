(function () {
    WinJS.Namespace.define("MCNEXT.UI", {
        WhatsNewControl: WinJS.Class.define(
           function (element, options) {
               element.winControl = this;
               if (options.nbLaunch)
                   this.nbLaunch = options.nbLaunch;
               else
                   this.nbLaunch = 5;
               this._createContent();
           }, {
               _createContent: function () {
                   var that = this;
                   var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                   if (roamingSettings.values["version"]) {
                       if (roamingSettings.values["version"] !== Windows.ApplicationModel.Package.current.id.version.major + "." + Windows.ApplicationModel.Package.current.id.version.minor + "." + Windows.ApplicationModel.Package.current.id.version.revision) {
                           roamingSettings.values["rateok"] = false;
                           roamingSettings.values["launches"] = 0;
                       }
                   }
               },

               check: function () {
                   var that = this;
                   var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                   var ratingOk = roamingSettings.values["rateok"];
                   var launches = roamingSettings.values["launches"] || 0;
                   launches++;
                   roamingSettings.values["launches"] = launches;

                   if (!ratingOk && (launches == 1 || launches > that.nbLaunch)) {
                       setTimeout(function () {
                           roamingSettings.values["launches"] = 1;
                           that.show();
                       }, 2000);
                   }
               },

               show: function () {
                   WinJS.UI.SettingsFlyout.showSettings("whatsNewSettingsFlyout", './pages/settings/whatsnew/whatsnew.html');

                   //var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
                   //var value = roamingSettings.values["rate"];
                   //if (value) {
                   //    if (value > this.nbLaunch) {
                   //        if (!roamingSettings.values["rateok"]) {
                   //            WinJS.UI.SettingsFlyout.showSettings("newsDiv", './pages/settings/whatsnew/whatsnew.html');
                   //        }
                   //        roamingSettings.values["rate"] = 1;
                   //    }
                   //    else {
                   //        roamingSettings.values["rate"] = roamingSettings.values["rate"] + 1;
                   //    }
                   //}
                   //else
                   //    roamingSettings.values["rate"] = 1;

               }
           })
    });
})();