//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

(function () {
    "use strict";

    WinJS.Namespace.define("WinJSContrib.UI", {
        HubControl: WinJS.Class.define(
            /**
             * Hub control replacement intended to be used with {@link WinJSContrib.UI.GridControl}
             * @class WinJSContrib.UI.HubControl
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function HubControl(element, options) {
                var hub = this;
                options = options || {};
                hub.element = element;

                hub.savestate = options.savestate != undefined ? options.savestate : true;
                hub.scrollContainer = (options && options.scrollContainer) ? options.scrollContainer : element;
                hub.sectionsContainer = (options && options.sectionsContainer) ? options.sectionsContainer : element.querySelector('.mcn-hub-surface');
                if (!hub.sectionsContainer) {
                    hub.sectionsContainer = document.createElement('DIV');
                    hub.sectionsContainer.className = 'mcn-hub-surface';
                    while (element.children[0]) {
                        hub.sectionsContainer.appendChild(element.children[0]);
                    }
                    element.appendChild(hub.sectionsContainer);
                }
                hub.element.className = hub.element.className + ' mcn-hub-ctrl mcn-layout-ctrl win-disposable';
                //hub.element.style.display = 'none';
                hub.element.winControl = hub;
                hub.sections = [];
                hub.multipass = options.multipass;

                hub.hubScrolledBind = hub.hubScrolled.bind(hub);
                hub.rendering = { lastScroll: 0 };
                hub.identifier = hub.element.id + "//" + hub.element.className;
                //setImmediate(function () {
                //    hub.autoRegisterSections();
                //    //hub.layout(Windows.UI.ViewManagement.ApplicationView.value);
                //});
            },
            /**
             * @lends WinJSContrib.UI.HubControl.prototype
             */
            {
                prepare: function () {
                    this.autoRegisterSections();
                },

                /**
                 * configure multipass rendering (for using in conjunction with {@link WinJSContrib.UI.GridControl}
                 */
                multipass: {
                    get: function () {
                        return this._multipass;
                    },
                    set: function (val) {
                        this._multipass = val;
                        if (val) {
                            if (val == 'item')
                                this.multipassStrategy = new MultipassByItemsStrategy();
                            else if (val == 'section')
                                this.multipassStrategy = new MultipassBySectionStrategy();
                        }
                    }
                },

                autoRegisterSections: function () {
                    var hub = this;
                    hub.sections = [];
                    var sections = hub.scrollContainer.querySelectorAll('.mcn-hub-section');
                    for (var i = 0 ; i < sections.length ; i++) {
                        var section = sections[i];
                        var sectionCtrl = section.winControl;
                        if (sectionCtrl) {
                            hub.sections.push(sectionCtrl);
                        }
                    }
                },

                registerSection: function (selector, parentElement) {
                    var sec = new Section(selector, parentElement);
                    this.sections.push(sec);
                    return sec;
                },

                layout: function (viewState) {
                    var hub = this;
                    hub.element.style.display = '';
                    var spacer = document.createElement('DIV');
                    spacer.className = 'mcn-hub-section-spacer';
                    hub.sectionsContainer.appendChild(spacer);

                    if (!hub.sections.length) {
                        hub.autoRegisterSections();
                    }

                    this.sections.forEach(function (section) {
                        section.layout(viewState);
                    });

                },
                renderItemsContent: function (forceRendering) {
                    var hub = this;
                    //console.log('render item content multipass:' + hub.multipass);
                    hub.rendering.size = {
                        width: hub.scrollContainer.clientWidth,
                        height: hub.scrollContainer.clientHeight
                    };

                    if (!hub.multipass) {
                        hub.sections.forEach(function (section) {
                            section.renderItemsContent(forceRendering);
                        });
                    }
                    else if (hub.multipassStrategy) {
                        hub.multipassStrategy.processSections(this, forceRendering);
                        hub.scrollContainer.addEventListener('scroll', hub.hubScrolledBind);
                    } else {
                        //console.log('no rendering...')
                    }
                },
                renderSection: function (section, sectionTemplate, hasTitle) {
                    var hub = this;

                    return new WinJS.Promise(function (complete, error) {
                        var template = WinJSContrib.Utils.getTemplate(sectionTemplate);
                        if (template) {
                            var sectionElt = document.createElement('DIV');
                            if (hasTitle) {
                                sectionElt.className = 'mcn-hub-section-titled';
                            }

                            template.render(section).done(function (rendered) {
                                var sectionItem = new WinJSContrib.UI.HubSection(sectionElt);
                                while (rendered.children[0]) {
                                    sectionElt.appendChild(rendered.children[0]);
                                }
                                //sectionItem.element.style.opacity = '0';
                                //sectionItem.$element = $(sectionItem.element);
                                hub.sectionsContainer.appendChild(sectionElt);
                                hub.sections.push(sectionItem);
                                complete(sectionItem);
                            });
                        }
                    });

                },
                removeSection: function (section) {
                    var hub = this;
                    var index = hub.sections.indexOf(val);
                    if (index > -1) {
                        hub.sections.splice(index, 1);
                    }
                },
                saveCtrlState: function () {
                    var hub = this;
                    var state = WinJS.Navigation.history.current.state || { hub: {} };
                    if (!state.hub)
                        state.hub = {};

                    if (hub.scrollContainer) {
                        var hubdata = {};
                        hubdata.scrollLeft = hub.scrollContainer.scrollLeft;
                        hubdata.scrollTop = hub.scrollContainer.scrollTop;
                        state.hub[hub.identifier] = hubdata;
                    }
                    WinJS.Navigation.history.current.state = state;
                    return state;
                },
                restoreCtrlState: function (state) {
                    var hub = this;
                    state = state || WinJS.Navigation.history.current.state || { hub: {} };
                    if (!state.hub)
                        state.hub = {};

                    if (hub.scrollContainer && state.hub) {
                        var hubdata = state.hub[hub.identifier];
                        if (hubdata && hubdata.scrollLeft) {
                            hub.scrollContainer.scrollLeft = hubdata.scrollLeft;
                        }
                        if (hubdata && hubdata.scrollTop) {
                            hub.scrollContainer.scrollTop = hubdata.scrollTop;
                        }
                    }
                },
                hubScrolled: function () {
                    if (!this.rendering.size) {
                        this.rendering.size = {
                            width: this.scrollContainer.clientWidth,
                            height: this.scrollContainer.clientHeight
                        };
                    }
                    var curScroll = this.scrollContainer.scrollLeft || this.scrollContainer.scrollTop;
                    var curScrollDelta = Math.abs(curScroll - this.rendering.lastScroll);
                    if (curScrollDelta > this.multipassStrategy.scrollOffset) {
                        this.multipassStrategy.processSections(this);
                        this.rendering.lastScroll = curScroll;
                    }

                },
                exitPage: function () {
                    if (this.savestate)
                        this.saveCtrlState();
                },
                pageLayout: function () {
                    var hub = this;
                    hub.layout();

                    if (hub.savestate)
                        hub.restoreCtrlState();

                    //return WinJS.Promise.timeout().then(function () {
                    //    hub.renderItemsContent();
                    //});
                },

                contentReady: function () {
                    var hub = this;
                    hub.renderItemsContent();
                },

                updateLayout: function (element, viewState, lastViewState) {
                    var hub = this;
                    var state = {
                        w: hub.scrollContainer.clientWidth,
                        h: hub.scrollContainer.clientHeight,
                    }

                    if (hub.LastLayoutState && (hub.LastLayoutState.w != state.w || hub.LastLayoutState.h != state.h)) {
                        hub.scrollContainer.scrollLeft = 0;
                        hub.scrollContainer.scrollTop = 0;
                    }

                    hub.LastLayoutState = state;
                },
                dispose: function () {
                    var hub = this;
                    hub.scrollContainer.removeEventListener('scroll', hub.hubScrolledBind);
                    if (WinJS.Utilities.disposeSubTree)
                        WinJS.Utilities.disposeSubTree(this.element);
                }
            })
    });

    WinJS.Namespace.define("WinJSContrib.UI", {
        HubSection: WinJS.Class.define(
            // Define the constructor function for the PageControlNavigator.
            function HubSection(element, options) {
                var section = this;
                section.element = element || document.createElement('DIV');
                section.element.winControl = section;
                section.element.className = section.element.className + ' mcn-hub-section win-disposable';
                section.items = [];
                section.onlayout = undefined;
            }, {
                layout: function (viewState) {
                    var section = this;
                    var layoutctrls = section.element.querySelectorAll('.mcn-layout-ctrl');
                    if (layoutctrls && layoutctrls.length) {
                        for (var i = 0 ; i < layoutctrls.length ; i++) {
                            var ctrl = layoutctrls[i].winControl;
                            if (ctrl) {
                                ctrl.multipass = ctrl.multipass || section.multipass;
                                if (ctrl.layout)
                                    ctrl.layout();
                            }
                        }
                    }

                    section.items = [];
                    var allitems = section.element.querySelectorAll('.mcn-multipass-item');
                    var numitems = allitems.length;
                    for (var i = 0 ; i < numitems ; i++) {
                        var itemCtrl = allitems[i].winControl;
                        if (itemCtrl)
                            section.items.push(itemCtrl);
                    }

                    if (section.onlayout) {
                        section.onlayout(viewState);
                    }
                },
                renderItemsContent: function () {
                    var itemsctrls = this.element.querySelectorAll('.mcn-items-ctrl');
                    if (itemsctrls && itemsctrls.length) {
                        for (var i = 0 ; i < itemsctrls.length ; i++) {
                            var ctrl = itemsctrls[i].winControl;
                            if (ctrl && ctrl.renderItemsContent)
                                ctrl.renderItemsContent();
                        }
                    }
                },
                dispose: function () {
                    if (WinJS.Utilities.disposeSubTree)
                        WinJS.Utilities.disposeSubTree(this.element);
                }
            })
    });

    function MultipassBySectionStrategy(options) {
        options = options || {};
        this.scrollOffset = this.scrollOffset || 100;
    }

    MultipassBySectionStrategy.prototype.isSectionInView = function (hub, section, vertical) {
        if (vertical) {
            var sectionOffset = section.element.offsetTop;
            var sectionSize = section.element.clientHeight;
            var tolerance = hub.rendering.size.height;

            var sectionStartPassed = (sectionOffset <= hub.scrollContainer.scrollTop + hub.rendering.size.height + tolerance);
            var sectionEndNotPassed = (sectionOffset + sectionSize + tolerance >= hub.scrollContainer.scrollTop);

            var isInView = sectionStartPassed && sectionEndNotPassed;
        }
        else {
            var sectionOffset = section.element.offsetLeft;
            var sectionSize = section.element.clientWidth;
            var tolerance = hub.rendering.size.width;

            var sectionStartPassed = (sectionOffset <= hub.scrollContainer.scrollLeft + hub.rendering.size.width + tolerance);
            var sectionEndNotPassed = (sectionOffset + sectionSize + tolerance >= hub.scrollContainer.scrollLeft);

            var isInView = sectionStartPassed && sectionEndNotPassed;
        }
        return isInView;
    }

    MultipassBySectionStrategy.prototype.processSections = function (hub, forceRendering) {
        if (hub.rendering.completed) {
            return;
        }

        var delayed = [];
        var strategy = this;
        var hasUnrendered = false;
        var vertical = hub.scrollContainer.scrollHeight > hub.scrollContainer.scrollWidth || hub.scrollContainer.scrollTop > 0;
        hub.sections.forEach(function (section, index) {
            if (!section.rendered && strategy.isSectionInView(hub, section, vertical)) {
                section.renderItemsContent();
                section.rendered = true;
            }
            else {
                hasUnrendered = true;
            }
        });

        if (!hasUnrendered) {
            hub.rendering.completed = true;
        }
    }

    function MultipassByItemsStrategy(options) {
        options = options || {};
        this.scrollOffset = this.scrollOffset || 100;
        this.pagesLoaded = 2;
    }

    MultipassByItemsStrategy.prototype.isSectionInView = MultipassBySectionStrategy.prototype.isSectionInView;
    MultipassByItemsStrategy.prototype.isItemInView = function (hub, section, item, vertical) {
        if (vertical) {
            var itemOffset = section.element.offsetTop + item.element.offsetTop;
            var itemSize = item.element.clientHeight;
            var tolerance = hub.rendering.size.height * this.pagesLoaded;

            var res = {
                isInView: false,
                isInViewWithTolerance: false
            }

            var itemStartPassed = (itemOffset <= hub.scrollContainer.scrollTop + hub.rendering.size.height);
            var itemEndNotPassed = (itemOffset + itemSize >= hub.scrollContainer.scrollTop);

            res.isInView = itemStartPassed && itemEndNotPassed;

            itemStartPassed = (itemOffset <= hub.scrollContainer.scrollTop + hub.rendering.size.height + tolerance);
            itemEndNotPassed = (itemOffset + itemSize + tolerance >= hub.scrollContainer.scrollTop);

            res.isInViewWithTolerance = itemStartPassed && itemEndNotPassed;

            if (!res.isInView && !res.isInViewWithTolerance)
                return;
        }
        else {
            var itemOffset = section.element.offsetLeft + item.element.offsetLeft;
            var itemSize = item.element.clientWidth;
            var tolerance = hub.rendering.size.width * this.pagesLoaded;

            var res = {
                isInView: false,
                isInViewWithTolerance: false
            }

            var itemStartPassed = (itemOffset <= hub.scrollContainer.scrollLeft + hub.rendering.size.width);
            var itemEndNotPassed = (itemOffset + itemSize >= hub.scrollContainer.scrollLeft);

            res.isInView = itemStartPassed && itemEndNotPassed;

            itemStartPassed = (itemOffset <= hub.scrollContainer.scrollLeft + hub.rendering.size.width + tolerance);
            itemEndNotPassed = (itemOffset + itemSize + tolerance >= hub.scrollContainer.scrollLeft);

            res.isInViewWithTolerance = itemStartPassed && itemEndNotPassed;

            if (!res.isInView && !res.isInViewWithTolerance)
                return;
        }

        return res;
    };

    MultipassByItemsStrategy.prototype.processSections = function (hub, forceRendering) {
        //if (hub.rendering.completed)
        //    return;
        //console.log('process hub section, sections: ' + hub.sections.length + ' force:' + forceRendering);
        var delayed = [];
        var strategy = this;
        var hasUnrendered = false;
        var vertical = hub.scrollContainer.scrollHeight > hub.scrollContainer.scrollWidth || hub.scrollContainer.scrollTop > 0;
        hub.sections.forEach(function (section, index) {
            if (section.items.length && (forceRendering || !section.rendered) && strategy.isSectionInView(hub, section, vertical)) {
                //console.log('process hub section ' + index);
                strategy.processSection(hub, section, vertical);
            }
            else {
                //console.log('skipped hub section ' + index);
                hasUnrendered = true;
            }
        });

        if (hub.sections.length && !hasUnrendered) {
            hub.rendering.completed = true;
        }
    };

    MultipassByItemsStrategy.prototype.getSectionItems = function (hub, section) {
        var items = [];
        var allitems = section.element.querySelectorAll('.mcn-multipass-item');
        var numitems = allitems.length;
        for (var i = 0 ; i < numitems ; i++) {
            var itemCtrl = allitems[i].winControl;
            if (itemCtrl)
                items.push(itemCtrl);
        }
        return items;
    };

    MultipassByItemsStrategy.prototype.processSection = function (hub, section, vertical) {
        var strategy = this;
        if (!section.items)
            return;

        //if (!section.renderingItems)
        //    section.renderingItems = this.getSectionItems(hub, section);

        var hasUnrendered = false;
        var numitems = section.items.length;
        for (var i = 0 ; i < numitems ; i++) {
            var itemCtrl = section.items[i];
            var iteminview = strategy.isItemInView(hub, section, itemCtrl, vertical);
            if (!itemCtrl.rendered && iteminview) {
                itemCtrl.render(!iteminview.isInView && iteminview.isInViewWithTolerance);
            }
            else {
                hasUnrendered = true;
            }
        }

        if (!hasUnrendered) {
            section.rendered = true;
        }
    };
})();