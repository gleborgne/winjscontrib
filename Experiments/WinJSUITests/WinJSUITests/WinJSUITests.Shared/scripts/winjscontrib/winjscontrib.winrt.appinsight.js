/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
var __global = this;

/**
AppInsight Javascript sdk works well for web applications but it lacks some meta for Windows web application.
This wrapper is injecting those metadata and automatically add error tracking that will bubble in your applicationinsight dashboard


To use appinsight, you must reference this file, and the appinsight js sdk (available here :https://github.com/Microsoft/ApplicationInsights-js)
then, just new up an instance of AppInsight wrapper with your instrumentation key :
var appinsightWrapper = new WinJSContrib.WinRT.AppInsight({ instrumentationKey: "appinsightInstrumentationkeyIGotOnAzurePortal" });
appinsightWrapper.tracker.trackEvent("app start");


*/

(function () {
	'use strict';

	WinJSContrib.WinRT.AppInsight = function (options) {
		var component = this;
		if (!options || !options.instrumentationKey)
			throw new Error("you must provide an instrumentationKey " + instrumentationKey);

		options.endpointUrl = options.endpointUrl || "http://dc.services.visualstudio.com/v2/track";
		component.options = options;
		component.tracker = new Microsoft.ApplicationInsights.AppInsights(options);
		var context = new Windows.ApplicationModel.Resources.Core.ResourceContext();
		var language = window.navigator.language;
		var region = context.qualifierValues.homeRegion;
		var deviceType = context.qualifierValues.deviceFamily;

		var version = Windows.ApplicationModel.Package.current.id.version;
		var devicetoken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
		var deviceid = getHardwareId();
		var tagsComplement = {
			"ai.application.ver": version.major + '.' + version.minor + '.' + version.build + "." + version.revision,
			"ai.device.type": deviceType,
			"ai.device.id": deviceid,
			//"ai.device.oemName": "Dell inc.",
			//"ai.device.model": "ukn",
			"ai.device.network": getNewtworkAdapter(),
			"ai.device.language": language,
			//"ai.device.applanguage": context.language,
			"ai.user.storeRegion": region,
			//"ai.user.accountAcquisitionDate": "2015-10-19T14:25:10.1780423+02:00"
		}

		//intercept telemetry items and inject windows app metadata
		component.tracker.context.addTelemetryInitializer(function (envelope) {
			merge(envelope.tags, tagsComplement);
			var telemetryItem = envelope.data.baseData;
			if (telemetryItem) {
				var msprefix = "Microsoft.ApplicationInsights.";
				var itemType = null;
				if (envelope.name && envelope.name.indexOf(msprefix) == 0) {
					itemType = envelope.name.substr(msprefix.length);
					var key = component.options.instrumentationKey;
					
					var newenveloppe = msprefix + key.replace(/-/g, '') + '.' + itemType;
					envelope.name = newenveloppe;
				}

				if (itemType === "Exception" && telemetryItem.exceptions && telemetryItem.exceptions.length) {
					telemetryItem.exceptions.forEach(function (e) {
						e.id = 62619566;
						e.typeName = e.message;
					});
				}
			}
		});


		if (__global.WinJS) {
			WinJS.Application.addEventListener("error", function (arg) {
				var err = component.wrapError(arg.detail);
				if (err) {
					component.tracker.trackException(err, "Unhandled");
				} else {
					component.tracker.trackException("unknown error", "Unhandled", err);
				}
				component.tracker.flush();

				if (component.onerror) {
					return component.onerror(arg);
				}
			});
		} else {
			window.addEventListener("error", function (err, url, lineNumber) {
				if (!err)
					return;

				var error = err.error;
				if (!error) {
					error = { message: err.message, stack: err.filename + ":" + err.lineno + ":" + err.colno };
				}
				component.tracker.trackException(component.wrapError(error), "Unhandled");
				component.tracker.flush();
			});
		}

		if (__global.WinJSContrib && __global.WinJSContrib.UI && __global.WinJSContrib.UI.tap) {
			WinJS.Application.addEventListener("mcn-taperror", function (arg) {
				if (arg.error && arg.error.message == "Canceled")
					return;

				var err = component.wrapError(arg.error || arg.detail.error);
				if (err) {
					component.tracker.trackException(err, "Unhandled");
				} else {
					component.tracker.trackException("unknown error", "Unhandled", arg.error || arg.detail);
				}
				component.tracker.flush();
				if (component.ontaperror) {
					return component.ontaperror(arg);
				}
			});
		}
	};

	WinJSContrib.WinRT.AppInsight.prototype.wrapError = function (err) {
		if (!err)
			return;

		if (Object.prototype.toString.call(err) === "[object Error]")
			return err;

		var rootError = err.error;
		if (rootError) {
			if (Object.prototype.toString.call(rootError) === "[object Error]")
				return rootError;

			if (rootError.error) {
				rootError = rootError.error;
			} else if (rootError.exception) {
				rootError = rootError.exception;
			}
		} else if (err.exception) {
			rootError = err.exception;
			if (Object.prototype.toString.call(rootError) === "[object Error]")
				return rootError;

			if (rootError.error) {
				rootError = rootError.error;
			} else if (rootError.exception) {
				rootError = rootError.exception;
			}
		}

		if (Object.prototype.toString.call(rootError) === "[object Error]")
			return rootError;

		var detail = err;
		if (err.detail && (err.detail.message || err.detail.errorMessage)) {
			detail = err.detail;
		}

		if (detail.message || detail.errorMessage) {
			var res = new Error(detail.message || detail.errorMessage);
			res.stack = detail.stack;

			if (detail.errorUrl && !detail.stack) {
				res.stack = detail.errorMessage + " at " + detail.errorUrl + ":" + detail.errorLine + detail.errorCharacter;
			}
			else if (detail.filename && !detail.stack) {
				res.stack = detail.message + " at " + err.filename + ":" + err.lineno + ":" + err.colno
			}

			return res;
		}

		return null;
	}

	WinJSContrib.WinRT.AppInsight.prototype.wrapWinJSNavigation = function (disablePageArguments) {
		var component = this;
		WinJS.Navigation.addEventListener("navigated", function (arg) {
			var navargs = arg.detail;
			component.tracker.trackPageView(null, navargs.location, disablePageArguments ? null : navargs.state);
		});
	}

	function merge(source, addendum) {
		for (var n in addendum) {
			source[n] = addendum[n];
		}
	}

	function getHardwareId() {
		var ht = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);

		var reader = Windows.Storage.Streams.DataReader.fromBuffer(ht.id);
		var arr = new Array(ht.id.length);
		reader.readBytes(arr);

		var id = "";
		for (var j = 0; j < arr.length; j++) {
			id += arr[j].toString();
		}
		return id;
	}

	function getNewtworkAdapter() {
		var profiles = Windows.Networking.Connectivity.NetworkInformation.getConnectionProfiles();
		var na = profiles[0].networkAdapter;
		return na.ianaInterfaceType.toString();
	}
})();