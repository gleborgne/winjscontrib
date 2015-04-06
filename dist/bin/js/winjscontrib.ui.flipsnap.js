/* 
 * WinJS Contrib v2.0.3.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
	'use strict';
	WinJS.Namespace.define("WinJSContrib.UI", {
		FlipSnap: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
			var ctrl = this;
			this.element = element || document.createElement('DIV');
			options = options || {};
			this.element.winControl = this;
			this.element.classList.add('win-disposable');
			this.element.classList.add('mcn-layout-ctrl');
			this.element.classList.add('flipsnapcontainer');
			this.list = document.createElement('DIV');
			this.list.classList.add('flipsnaplist');
			this.element.appendChild(this.list);
			this._navPromises = [];
			WinJS.UI.setOptions(this, options);
			ctrl._itemTemplate = options.itemTemplate;
			ctrl._itemMaxWidth = options.itemMaxWidth;
			if (!ctrl._itemMaxWidth) {
				ctrl._itemMaxWidth = 800;
			}
			ctrl._itemMaxMarge = options.itemMaxMarge;
			if (!ctrl._itemMaxMarge) {
				ctrl._itemMaxMarge = 10;
			}
			ctrl._currentPosition = options.currentPosition
			if (!ctrl._currentPosition)
				ctrl._currentPosition = 0;
			ctrl.style = document.createElement('style');
			ctrl.listOnscrollbinded = ctrl.listOnscroll.bind(ctrl);
			ctrl.element.appendChild(ctrl.style);
			ctrl.list.addEventListener('scroll', ctrl.listOnscrollbinded);
			ctrl.updateLayout();
			ctrl._navBtns();
		}, {
			_navBtns: function () {
				var ctrl = this;
				ctrl.next = document.createElement('button');
				ctrl.next.innerHTML = "&#57571;"
				ctrl.next.className = "navbutton navbutton-right hide";
				ctrl.prev = document.createElement('button');
				ctrl.prev.innerHTML = "&#57570;"
				ctrl.prev.className = "navbutton navbutton-left hide";
				ctrl.element.appendChild(ctrl.next);
				ctrl.element.appendChild(ctrl.prev);
				WinJSContrib.UI.tap(ctrl.next, function () {
					ctrl.toNext();
				});
				WinJSContrib.UI.tap(ctrl.prev, function () {
					ctrl.toPrev();
				});
			},
			listOnscroll: function () {
				var ctrl = this;
				if (ctrl._timeout)
					clearTimeout(ctrl._timeout)
				ctrl._timeout = setTimeout(function () {
					var newPosition = Math.round(ctrl.list.scrollLeft / ctrl._itemw);
					if (ctrl._currentPosition !== newPosition) {
						ctrl._currentPosition = newPosition;

						var selectedItems = ctrl.list.querySelectorAll('.selected');
						for (var i = 0, l = selectedItems.length; i < l ; i++) {
							selectedItems[i].classList.remove('selected');
						}

						ctrl.list.children[ctrl._currentPosition].classList.add('selected');
						ctrl.dispatchEvent("positionchanged", { currentPosition: ctrl._currentPosition });
						if (ctrl.canGoForward) {
							ctrl.next.classList.remove('hide');
						}
						else {
							ctrl.next.classList.add('hide');
						}
						if (ctrl.canGoBack) {
							ctrl.prev.classList.remove('hide');
						}
						else {
							ctrl.prev.classList.add('hide');
						}
						console.log(ctrl._currentPosition);
					}
				}, 0);
			},

			toNext: function () {
				var ctrl = this;
				WinJS.Promise.join(ctrl._navPromises).then(function () {
					ctrl._navPromises.push(ctrl._smooth_scroll_to(ctrl.list, (ctrl._itemw + ctrl._itemMaxMarge) * (ctrl._currentPosition + 1), 300));
				}, function () { })
			},

			toPrev: function () {
				var ctrl = this;
				WinJS.Promise.join(ctrl._navPromises).then(function () {
					var index = (ctrl._currentPosition - 1);
					if (index < 0)
						index = 0
					ctrl._navPromises.push(ctrl._smooth_scroll_to(ctrl.list, (ctrl._itemw + ctrl._itemMaxMarge) * index, 300));
				}, function () { })
			},

			_smooth_scroll_to: function (element, target, duration) {
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
							requestAnimationFrame(scroll_frame);
						}

						// boostrap the animation process
						requestAnimationFrame(scroll_frame);
					}
					catch (e) {
						var sdf = "";
					}
				});
			},

			initList: function (list, itemHandling) {
				var ctrl = this;
				var template = ctrl._itemTemplate;
				if (template)
					template = WinJSContrib.Utils.getTemplate(template);
				else {
					throw "Where is the tempalte ?";
				}
				var promises = [];

				if (list && list.length) {
					ctrl._dataList = list;
					if (list.length > 1) {
						ctrl.next.classList.remove('hide');
					}
					list.forEach(function (fipitem, index) {
						if (fipitem)
							promises.push(template.render(fipitem).done(function (rendered) {
								var elt = rendered.children[0];
								if (index == 0) {
									elt.classList.add('flipsnapfistitem');
									elt.classList.add('selected');
								}
								elt.classList.add('flipsnapitem')
								itemHandling(elt, fipitem, index);
								ctrl.list.appendChild(elt);
								if (index + 1 === list.length) {
									var lastitem = document.createElement('div');
									lastitem.className = "flipsnaplastitem";
									ctrl.list.appendChild(lastitem);
								}
							}));
					});
				}
				return WinJS.Promise.join(promises).then(function () {
					requestAnimationFrame(function () {
						ctrl.list.scrollLeft = (ctrl._itemw + ctrl._itemMaxMarge) * (ctrl._currentPosition)
						//ctrl._navPromises.push(ctrl._smooth_scroll_to(ctrl.list, ctrl._itemw * (ctrl._currentPosition), 300));
					});
				});
			},

			reset: function () {
			},

			itemTemplate: {
				get: function () {
					return this._itemTemplate;
				},
				set: function (val) {
					this._itemTemplate = val;
				}
			},

			canGoBack: {
				get: function () {
					if (this._currentPosition == 0)
						return false;
					else
						return true
				}
			},

			dataList: {
				get: function () {
					if (this._dataList)
						return this._dataList;
					else
						return [];
				}
			},

			canGoForward: {
				get: function () {
					return (this._currentPosition + 1 < this.dataList.length)
				}
			},

			currentPosition: {
				get: function () {
					return this._currentPosition;
				},
				set: function (val) {
					var ctrl = this;
					ctrl._currentPosition = val;
					ctrl._navPromises.push(ctrl._smooth_scroll_to(ctrl.list, (ctrl._itemw + ctrl._itemMaxMarge) * (ctrl._currentPosition), 300));

				}
			},

			itemMaxWidth: {
				get: function () {
					return this._itemMaxWidth;
				},
				set: function (val) {
					this._itemMaxWidth = val;
				}
			},

			dispose: function () {
				var ctrl = this;
				ctrl.list.removeEventListener('scroll', ctrl.listOnscroll);
				WinJS.Utilities.disposeSubTree(this.element);
				this.element = null;
			},

			updateLayout: function () {
				var ctrl = this;
				var windowInnerWidth = window.innerWidth;
				ctrl._itemw = ctrl._itemMaxWidth;
				var marge = (windowInnerWidth - ctrl._itemMaxWidth) / 2;
				var margeitem = ctrl._itemMaxMarge;
				if (windowInnerWidth < 800) {
					ctrl._itemw = windowInnerWidth;
					marge = 0;
					margeitem = 0;
				}
				if (ctrl.currentPosition) {
					ctrl.list.scrollLeft = (ctrl._itemw + margeitem) * ctrl.currentPosition;
				}
				ctrl.style.innerHTML = ".flipsnapcontainer .flipsnaplist{ -ms-scroll-snap-points-x: snapInterval(0%, " + (ctrl._itemw + margeitem) + "px); }" +
                    " .flipsnapcontainer  .flipsnaplist .flipsnapitem.flipsnapfistitem { margin-left:" + marge + "px } .flipsnaplist .flipsnapitem{ min-width:" + ctrl._itemw + "px } " +
                    " .flipsnapcontainer .flipsnaplist .flipsnaplastitem { max-width:" + marge + "px ; min-width:" + marge + "px }" +
                    " .flipsnapcontainer .flipsnaplist .flipsnapitem {margin-right:" + margeitem + "px }"

			}

		}),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("positionchanged"))
	});
})();