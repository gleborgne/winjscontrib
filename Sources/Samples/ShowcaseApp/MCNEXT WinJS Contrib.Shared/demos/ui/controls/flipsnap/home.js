(function () {
    "use strict";

    WinJS.UI.Pages.define("./demos/ui/controls/flipsnap/home.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        smooth_scroll_to: function (element, target, duration) {
            target = Math.round(target);
            duration = Math.round(duration);
            if (duration < 0) {
                return Promise.reject("bad duration");
            }
            if (duration === 0) {
                element.scrollLeft = target;
                return Promise.resolve();
            }

            var start_time = Date.now();
            var end_time = start_time + duration;

            var start_top = element.scrollLeft;
            var distance = target - start_top;

            // based on http://en.wikipedia.org/wiki/Smoothstep
            var smooth_step = function (start, end, point) {
                if (point <= start) { return 0; }
                if (point >= end) { return 1; }
                var x = (point - start) / (end - start); // interpolation
                return x * x * (3 - 2 * x);
            }

            return new WinJS.Promise(function (resolve, reject) {
                // This is to keep track of where the element's scrollTop is
                // supposed to be, based on what we're doing
                try {
                    var previous_top = element.scrollLeft;

                    // This is like a think function from a game loop
                    var scroll_frame = function () {
                        if (element.scrollLeft != previous_top) {
                            resolve();
                            //reject("interrupted");
                            return;
                        }

                        // set the scrollTop for this frame
                        var now = Date.now();
                        var point = smooth_step(start_time, end_time, now);
                        var frameTop = Math.round(start_top + (distance * point));
                        element.scrollLeft = frameTop;

                        // check if we're done!
                        if (now >= end_time) {
                            resolve();
                            return;
                        }

                        // If we were supposed to scroll but didn't, then we
                        // probably hit the limit, so consider it done; not
                        // interrupted.
                        if (element.scrollLeft === previous_top
                            && element.scrollLeft !== frameTop) {
                            resolve();
                            return;
                        }
                        previous_top = element.scrollLeft;

                        // schedule next frame for execution
                        setTimeout(scroll_frame, 0);
                    }

                    // boostrap the animation process
                    setTimeout(scroll_frame, 0);
                }
                catch (e) {
                    var sdf = "";
                }
            });
        },
        ready: function (element, options) {
            // TODO: Initialize the page here.
            var page = this;
            var l = []
            for (var i = 0; i < 10; i++) {
                l.push({ index: i });
            }
            this.flipsnap = element.querySelector('#flipsnap').winControl;
            this.flipsnap.itemTemplate = '/demos/ui/controls/flipsnap/templateTest.html';
            this.flipsnap.itemMaxWidth = 800;
            this.flipsnap.initList(l, function (elt, itemData) {
            });
        },
        updateLayout: function () {
          

        }
    });
})();
