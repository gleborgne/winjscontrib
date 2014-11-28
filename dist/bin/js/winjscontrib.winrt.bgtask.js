//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
WinJSContrib.WinRT.BgTask = WinJSContrib.WinRT.BgTask || {};

(function () {
    "use strict";

    function hasTask(taskName) {
        var taskRegistered = false;
        var background = Windows.ApplicationModel.Background;
        var iter = background.BackgroundTaskRegistration.allTasks.first();
        var hascur = iter.hasCurrent;

        while (hascur) {
            var cur = iter.current.value;

            if (cur.name === taskName) {
                return cur;
                break;
            }

            hascur = iter.moveNext();
        }

        return false;
    }

    WinJSContrib.WinRT.BgTask.registerBackgroundTask = function (taskEntryPoint, taskName, triggers, conditions) {
        var existing = hasTask(taskName);
        if (existing) {
            attachProgressAndCompletedHandlers(existing);
            return;
        }

        var builder = new Windows.ApplicationModel.Background.BackgroundTaskBuilder();

        builder.name = taskName;
        builder.taskEntryPoint = taskEntryPoint;
        triggers.forEach(function (trigger) {
            builder.setTrigger(trigger);
        });


        if (conditions && conditions.length) {
            conditions.forEach(function (condition) {
                builder.addCondition(condition);
            });

        }

        var task = builder.register();

        attachProgressAndCompletedHandlers(task);

        //
        // Remove previous completion status from local settings.
        //
        var settings = Windows.Storage.ApplicationData.current.localSettings;
        settings.values.remove(taskName);
    }

    function attachProgressAndCompletedHandlers(task) {
        task.addEventListener("completed", function (arg) {
            WinJS.Application.queueEvent({ type: 'MCN.BackgroundTask.Completed', arg: arg, task: task });
        });

        task.addEventListener("progress", function (arg) {
            WinJS.Application.queueEvent({ type: 'MCN.BackgroundTask.Progress', arg: arg, task: task });
        });
    }

    WinJSContrib.WinRT.BgTask.registerTimeTriggerBackgroundTask = function (taskEntryPoint, taskName, triggers, conditions) {
        try {
            //cet appel plante dans le simulateur
            Windows.ApplicationModel.Background.BackgroundExecutionManager.requestAccessAsync().done(function (bgmgr) {
                var e = bgmgr;
                if (bgmgr === Windows.ApplicationModel.Background.BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity || bgmgr === Windows.ApplicationModel.Background.BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivity) {
                    WinJSContrib.WinRT.BgTask.registerBackgroundTask(taskEntryPoint, taskName, triggers, conditions);
                }
            });
        } catch (exception) {

        }
    }
})();