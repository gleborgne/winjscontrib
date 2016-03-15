/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="winjscontrib.core.js" />

var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
WinJSContrib.WinRT.Audio = WinJSContrib.WinRT.Audio || {};

(function () {
    'use strict';

    WinJSContrib.WinRT.Audio.RecorderState = WinJS.Binding.define({ "isRecording": false, "isPaused": false, "ellapsedTime": 0, "startedAt": null });

    WinJSContrib.WinRT.Audio.Recorder = WinJS.Class.mix(WinJS.Class.define(function () {
        this.state = new WinJSContrib.WinRT.Audio.RecorderState();
        this.state.isRecording = false;
        this.state.isPaused = false;
    }, {
        start: function (file, options) {
            var recorder = this;

            var rawAudioSupported = false; // Always false???

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
                recorder.state.isPaused = false;
                recorder.ellapsedTimeInterval = setInterval(recorder._mesureEllapsedTime.bind(recorder), 1000);

                return recorder.recording.mediaCaptureMgr.startRecordToStorageFileAsync(recorder.recording.encodingProfile, file).then(function () {
                    return file;
                });
            }, recorder._errorHandler.bind(recorder));
        },

        pause: function () {
            var recorder = this;

            if (recorder.state.isRecording) {
                recorder.state.isPaused = true;
                clearInterval(recorder.ellapsedTimeInterval);

                return recorder.recording.mediaCaptureMgr.pauseRecordAsync(Windows.Media.Devices.MediaCapturePauseBehavior.retainHardwareResources);
            } else {
                return WinJS.Promise.wrap();
            }
        },

        resume: function() {
            var recorder = this;

            if (recorder.state.isPaused) {
                recorder.state.isPaused = false;
                recorder.ellapsedTimeInterval = setInterval(recorder._mesureEllapsedTime.bind(recorder), 1000);

                return recorder.recording.mediaCaptureMgr.resumeRecordAsync();
            } else {
                return WinJS.Promise.wrap();
            }
        },

        stop: function () {
            var recorder = this;

            recorder.state.isRecording = false;
            recorder.state.isPaused = false;
            clearInterval(recorder.ellapsedTimeInterval);
            if (recorder.recording) {
                var recording = recorder.recording;
                recorder._oldRecording = recording;
                recorder.recording = null;

                var whateverHappensAsync = function() {
                    recording.dispose();
                    recorder.dispatchEvent('recordingstopped');
                    return WinJS.Promise.wrap(recording.file);
                };

                return recording.mediaCaptureMgr.stopRecordAsync().then(whateverHappensAsync, whateverHappensAsync);
            } else {
                return WinJS.Promise.wrap(null);
            }
        },

        _mesureEllapsedTime: function () {
            var recorder = this;

            var dif = (new Date() - recorder.state.startedAt) / 1000;
            recorder.state.ellapsedTime = dif;
        },

        _errorHandler: function (err) {
            var recorder = this;
            recorder.recording.dispose();
            recorder._oldRecording = recorder.recording;
            recorder.recording = null;
            recorder.state.isRecording = false;
            recorder.dispatchEvent('recordingstopped');
            recorder.dispatchEvent('error', err);
            clearInterval(recorder.ellapsedTimeInterval);
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
