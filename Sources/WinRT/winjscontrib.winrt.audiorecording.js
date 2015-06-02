/// <reference path="winjscontrib.core.js" />

var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
WinJSContrib.WinRT.Audio = WinJSContrib.WinRT.Audio || {};

(function () {
    'use strict';

    WinJSContrib.WinRT.Audio.RecorderState = WinJS.Binding.define({ "isRecording": false, "ellapsedTime": 0, "startedAt": null });

    WinJSContrib.WinRT.Audio.Recorder = WinJS.Class.mix(WinJS.Class.define(function () {
        this.state = new WinJSContrib.WinRT.Audio.RecorderState();
        this.state.isRecording = false;
    }, {
        start: function (file, options) {
            var recorder = this;
            var rawAudioSupported = false;

            recorder.state.ellapsedTime = 0;
            recorder.state.startedAt = new Date();

            options = options || {};
            recorder.recording = {
                file: file,
                captureInitSettings: new Windows.Media.Capture.MediaCaptureInitializationSettings(),
                encodingProfile: Windows.Media.MediaProperties.MediaEncodingProfile.createM4a(options.quality || Windows.Media.MediaProperties.AudioEncodingQuality.low),
                mediaCaptureMgr: new Windows.Media.Capture.MediaCapture(),
                eventTracker: new WinJSContrib.UI.EventTracker(),
                dispose: function () {
                    this.eventTracker.dispose();
                }
            };
            recorder.recording.captureInitSettings.audioDeviceId = options.deviceId || "";
            recorder.recording.captureInitSettings.videoDeviceId = "";
            recorder.recording.captureInitSettings.mediaCategory = Windows.Media.Capture.MediaCategory.other;
            recorder.recording.captureInitSettings.audioProcessing = (rawAudioSupported && options.rawAudio) ? Windows.Media.AudioProcessing.raw : Windows.Media.AudioProcessing.default;

            recorder.recording.captureInitSettings.streamingCaptureMode = Windows.Media.Capture.StreamingCaptureMode.audio;
            recorder.recording.eventTracker.addEvent(recorder.recording.mediaCaptureMgr, "failed", recorder._errorHandler.bind(recorder));
            recorder.recording.eventTracker.addEvent(recorder.recording.mediaCaptureMgr, "recordlimitationexceeded", recorder._errorHandler.bind(recorder));

            return recorder.recording.mediaCaptureMgr.initializeAsync(recorder.recording.captureInitSettings).then(function (result) {
                recorder.state.isRecording = true;
                recorder.ellapsedTimeInterval = setInterval(function () {
                    var dif = (new Date() - recorder.state.startedAt) / 1000;
                    recorder.state.ellapsedTime = dif;
                }, 1000);

                return recorder.recording.mediaCaptureMgr.startRecordToStorageFileAsync(recorder.recording.encodingProfile, file).then(function () {
                    //clearInterval(recorder.ellapsedTimeInterval);
                    //recorder.state.isRecording = false;
                    //recorder.recording.dispose();
                    return file;
                }, function (err) {
                    recorder._errorHandler(err);
                });

            }, recorder._errorHandler.bind(recorder));
        },

        _errorHandler: function (err) {
            var ctrl = this;
            ctrl.recording.dispose();
            ctrl._oldRecording = ctrl.recording;
            ctrl.recording = null;
            ctrl.state.isRecording = false;
            ctrl.dispatchEvent('recordingstopped');
            ctrl.dispatchEvent('error', err);
            clearInterval(ctrl.ellapsedTimeInterval);
        },

        stop: function () {
            var ctrl = this;
            ctrl.state.isRecording = false;
            clearInterval(ctrl.ellapsedTimeInterval);
            if (ctrl.recording) {
                var recording = ctrl.recording;
                ctrl._oldRecording = recording;
                ctrl.recording = null;

                return recording.mediaCaptureMgr.stopRecordAsync().then(function (result) {
                    recording.dispose();
                    ctrl.dispatchEvent('recordingstopped');
                    return recording.file;
                }, function () {
                    recording.dispose();
                    ctrl.dispatchEvent('recordingstopped');
                    return recording.file;
                });
            } else {
                return WinJS.Promise.wrap();
            }
        }
    }),
    WinJS.Utilities.eventMixin);

    WinJSContrib.WinRT.Audio.Recorder.getMicrophones = function () {
        var microphoneDeviceInfo = Windows.Devices.Enumeration.DeviceInformation;
        return microphoneDeviceInfo.findAllAsync(Windows.Media.Devices.MediaDevice.getAudioCaptureSelector(), null).then(function (devicesInformation) {
            var devices = [];
            if (devicesInformation && devicesInformation.length > 0) {
                for (var i = 0; i < devicesInformation.length; i++) {
                    //deviceInformation[i].enclosureLocation.panel == Windows.Devices.Enumeration.Panel.bottom
                    devices.push(devicesInformation[i]);
                }
            }

            return devices;
        }, function () {
            return [];
        });
    }
})();