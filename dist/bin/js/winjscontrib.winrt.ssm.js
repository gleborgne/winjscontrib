/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="//Microsoft.WinJS.2.0/js/ui.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />
var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
WinJSContrib.WinRT.SSM = WinJSContrib.WinRT.SSM || {};

(function (SSM) {
    "use strict";

    //Ajoutez le bloc suivant dans le manifeste de l'application
    //<Extension Category="windows.activatableClass.proxyStub">
    //  <ProxyStub ClassId="B2596805-D20B-4750-A6AC-0251A1EFA1DE">
    //    <Path>Microsoft.Media.AdaptiveStreaming.dll</Path>
    //    <Interface InterfaceId="D733C279-BF63-4eb3-9D7F-6BA5402B621C" Name="ManifestReadyEventHandler" />
    //    <Interface InterfaceId="B0B48161-0DB5-439B-9FF0-200BED06CC48" Name="AdaptiveSourceStatusUpdatedEventHandler" />
    //    <Interface InterfaceId="2D30413E-09B4-4A43-8F8B-C592F1E41B5F" Name="AdaptiveSourceFailedEventHandler" />
    //    <Interface InterfaceId="3D0CDB1E-1E78-4c45-B9CC-04041804AD5A" Name="AdaptiveSourceClosedEventHandler" />
    //    <Interface InterfaceId="63B289C6-5181-4284-90DC-94D03FBE12F2" Name="AdaptiveSourceOpenedEventHandler" />
    //  </ProxyStub>
    //</Extension>

    var SSMStatus = WinJS.Binding.define({ status: '', bitrate: 0, videoW: 0, videoH: 0, time: '', available: '' });
    var manager;
    var currentStatus = new SSMStatus();
    WinJSContrib.WinRT.SSM.currentStatus = currentStatus;

    WinJSContrib.WinRT.SSM.log = function (msg) {
        if (WinJS && WinJS.log) WinJS.log(msg);
    }

    WinJSContrib.WinRT.SSM.registerSSM = function (track) {
        //http://blogs.iis.net/cenkd/archive/2012/08/09/how-to-build-a-smooth-streaming-windows-8-javascript-application-with-advanced-features.aspx
        //manager = new Microsoft.AdaptiveStreaming.AdaptiveStreamingManager();
        var plugins = new Windows.Media.MediaExtensionManager();
        var property = new Windows.Foundation.Collections.PropertySet();
        var mgr = Microsoft.Media.AdaptiveStreaming.AdaptiveSourceManager.getDefault();

        if (track) {
            mgr.addEventListener("adaptivesourceopenedevent", mgrOpenedEventHandler, false);
            mgr.addEventListener("adaptivesourceclosedevent", mgrClosedEventHandler, false);
            mgr.addEventListener("manifestreadyevent", mgrManifestReadyHandler, false);
            mgr.addEventListener("adaptivesourcestatusupdatedevent", mgrStatusUpdateHandler, false);
        }

        property["{A5CE1DE8-1D00-427B-ACEF-FB9A3C93DE2D}"] = mgr;
        plugins.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "text/xml", property);
        plugins.registerByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", ".ism", "application/vnd.ms-ss", property);
    };

    WinJSContrib.WinRT.SSM.unregisterSSM = function () {
        var mgr = Microsoft.Media.AdaptiveStreaming.AdaptiveSourceManager.getDefault();
        mgr.removeEventListener("adaptivesourceopenedevent", mgrOpenedEventHandler);
        mgr.removeEventListener("adaptivesourceclosedevent", mgrClosedEventHandler);
        mgr.removeEventListener("manifestreadyevent", mgrManifestReadyHandler);
    };

    function mgrOpenedEventHandler(e) {
        try {
            var displayedUri = e.adaptiveSource.uri.displayUri.toString();
            currentStatus.bitrate = 0;
            currentStatus.videoH = 0;
            currentStatus.videoW = 0;
            currentStatus.available = '';
            currentStatus.status = 'opened';
            SSM.log('SSM AdaptiveSource Opened: ' + displayedUri);
        }
        catch (error) {
            SSM.log('SSM open error' + error.number.toString());
        }
    }

    function mgrClosedEventHandler(e) {
        try {
            SSM.log('SSM AdaptiveSource Closed: ');
            currentStatus.bitrate = 0;
            currentStatus.videoH = 0;
            currentStatus.videoW = 0;
            currentStatus.available = '';
            currentStatus.status = 'closed';
        }
        catch (error) {
            log('SSM close error' + error.number.toString());
        }
    }

    function mgrManifestReadyHandler(e) {
        //RestrictTracks can only be called during ManifestReadyEvent and not allowed during playback.
        try {
            SSM.log("SSM manifestready");
            currentStatus.status = 'manifest ready';
            //saveManifest = e.adaptiveSource.manifest;
            //addStreamstoListBox();
        }
        catch (error) {
            SSM.log('error' + error.number.toString());
        }
    }

    function mgrStatusUpdateHandler(e) {
        try {
            var state;

            var updateData = e.updateType.toString();

            switch (parseInt(updateData)) {
                case 4:
                    state = "BitrateChanged";
                    if (e.additionalInfo) {
                        var data = e.additionalInfo.split(';');
                        currentStatus.bitrate = data[0] / 1000;
                    }
                    break;
                case 5:
                    state = "ChunkConnectHttpInvalid";
                    break;
                case 8:
                    state = "ChunkHdrError";
                    break;
                case 7:
                    state = "ChunkHdrHttpInvalid";
                    break;
                case 9:
                    state = "EndOfLive";
                    break;
                case 6:
                    state = "NextChunkHttpInvalid";
                    break;
                case 10:
                    state = "OutsideWindowEdge";
                    break;
                case 2:
                    state = "Rebuffer";
                    break;
                case 3:
                    state = "StartEndTime";
                    break;
                case 1:
                    state = "Underrun";
                    break;
                case 1:
                    state = "Unknown";
                    break;

                default:
                    state = "Unknown";
            }

            if (state != "Unknown") {
                currentStatus.status = state;
                SSM.log(state + ": " + /*e.additionalInfo.toString() +*/ " Startime: " + e.startTime.toString() + " Endtime: " + e.endTime.toString());
            }
            updateSSMStatus(e);
            //manager.maxSize = null;
        }
        catch (error) {
            SSM.log('SSM status error ' + error.number.toString());
        }
    }

    function updateSSMStatus(arg) {
        var stream = arg.adaptiveSource.manifest.selectedStreams.filter(function (stream) { return stream.name.indexOf("video") >= 0 });
        if (stream && stream.length) {
            currentStatus.videoH = stream[0].maxHeight;
            currentStatus.videoW = stream[0].maxWidth;
            if (stream[0].availableTracks && stream[0].availableTracks.length) {
                if (!currentStatus.available) {
                    var buffer = [];
                    stream[0].availableTracks.forEach(function (track) {
                        buffer.push('[' + track.maxWidth + ', ' + track.maxHeight + ']');
                    });
                    currentStatus.available = buffer.join(',');
                }
            }
            else {
                currentStatus.available = '';
            }

            //if (stream[0].selectedTracks && stream[0].selectedTracks.length) {
            //    currentStatus.bitrate = stream[0].selectedTracks[0].bitrate / 1000;
            //}
        }
        else {
            currentStatus.videoH = 0;
            currentStatus.videoW = 0;
            currentStatus.available = '';
        }
        currentStatus.time = new Date().toTimeString();
    }
})(WinJSContrib.WinRT.SSM);