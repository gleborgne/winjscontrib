/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
WinJSContrib.WinRT.BgTask = WinJSContrib.WinRT.BgTask || {};

(function () {
    "use strict";

    function clearAll(cancelRunningTasks) {
        console.info("clear all bg task");
        var background = Windows.ApplicationModel.Background;

        var iter = background.BackgroundTaskRegistration.allTasks.first();

        var hascur = iter.hasCurrent;

        while (hascur) {
            var cur = iter.current.value;
            
            console.log("clear bgtask " +  cur.name + " " + cur.taskId);
            cur.unregister(cancelRunningTasks || false);

            hascur = iter.moveNext();
        }

        return false;
    }
    WinJSContrib.WinRT.BgTask.clearAll = clearAll;

    function remove(taskName, cancelRunningTask) {
        var background = Windows.ApplicationModel.Background;

        var iter = background.BackgroundTaskRegistration.allTasks.first();

        var hascur = iter.hasCurrent;

        while (hascur) {
            var cur = iter.current.value;

            if (cur.name === taskName) {
                cur.unregister(cancelRunningTask || false);
                return true;
                break;
            }

            hascur = iter.moveNext();
        }

        return false;
    }
    WinJSContrib.WinRT.BgTask.remove = remove;

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
        console.log('register bg task ' + taskName)
        var existing = hasTask(taskName);
        if (existing) {
            console.log('bg task ' + taskName + ' already exists');
            attachProgressAndCompletedHandlers(existing);
            return;
        }

        //
        // Remove previous completion status from local settings.
        //
        var settings = Windows.Storage.ApplicationData.current.localSettings;
        settings.values.remove(taskName);

        try {
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
        } catch (exception) {            
            console.error("unable to register background task " + taskName, exception);
            return WinJS.Promise.wrapError(exception);
        }        
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
            return Windows.ApplicationModel.Background.BackgroundExecutionManager.requestAccessAsync().then(function (bgmgr) {
                var e = bgmgr;
                if (bgmgr === Windows.ApplicationModel.Background.BackgroundAccessStatus.allowedWithAlwaysOnRealTimeConnectivity || bgmgr === Windows.ApplicationModel.Background.BackgroundAccessStatus.allowedMayUseActiveRealTimeConnectivity) {
                    return WinJSContrib.WinRT.BgTask.registerBackgroundTask(taskEntryPoint, taskName, triggers, conditions);
                }
            });
        } catch (exception) {

        }
    }
})();