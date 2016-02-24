/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/ui.js" />

(function () {
    "use strict";
    var FD = WinJSContrib.UI.FluentDOM;

    WinJS.Namespace.define("WinJSContrib.UI", {
        TabPages: WinJS.Class.define(function TabPages(element, options) {
            var ctrl = this;
            options = options || {};
            ctrl.element = element || document.createElement("div");
            ctrl.element.className = 'mcn-tabpages ' + ctrl.element.className;
            if (WinJSContrib.CrossPlatform && WinJSContrib.CrossPlatform.crossPlatformClass)
                WinJSContrib.CrossPlatform.crossPlatformClass(ctrl.element);
            ctrl.tabHeader = options.header || element.querySelector('.mcn-tabpages-header');
            ctrl.tabHeaderTemplate = options.headerTemplate;
            ctrl.tabContent = options.content || element.querySelector('.mcn-tabpages-content');
            ctrl.tabLinkUri = options.uri;
            ctrl.tabLinkArgs = options.args;
            ctrl.tabs = {
                "default": []
            };

            if (!ctrl.tabContent) {
                ctrl.tabContent = new FD('DIV').addClass('mcn-tabpages-content').appendTo(ctrl.element).element;
            }

            ctrl.tabWrapper = new FD('DIV').addClass('mcn-tabpages-content-wrapper').appendTo(ctrl.tabContent).element;

            ctrl.navigator = new WinJSContrib.UI.PageControlNavigator(ctrl.tabWrapper, { global: false, delay: 10, disableHistory: true });
            ctrl.navigator.animationWaitForPreviousPageClose = false;
            ctrl.navigator.animations.exitPage = WinJSContrib.UI.Animation.tabExitPage;
            ctrl.navigator.animations.enterPage = WinJSContrib.UI.Animation.tabEnterPage;

            if (!ctrl.tabHeader) {
                ctrl.tabHeader = new FD('DIV').addClass('mcn-tabpages-header').appendTo(ctrl.element).element;
            }

            ctrl._createGroupHeader('default');

            if (options.registerTabs) {
                ctrl.registerTabs();
            }

            if (options.swipeSlide && WinJSContrib.UI.SwipeSlide) {
                ctrl.setSwipeSlideOnDefaultTab(options.rightbar);
            }

        }, {
            _createGroupHeader: function (group) {
                var ctrl = this;
                if (ctrl.tabs[group] && ctrl.tabs[group].tabGroup)
                    return;

                var defaultgroup = document.createElement('DIV');
                defaultgroup.className = 'header-group-' + group + ' mcn-tabpages-headergroup';
                if (!ctrl.tabs[group])
                    ctrl.tabs[group] = [];

                ctrl.tabs[group].tabGroup = defaultgroup;
                ctrl.tabHeader.appendChild(defaultgroup);
            },

            setSwipeRightbar: function () {
                var ctrl = this;
                ctrl.left = 'right';
                ctrl.right = 'left';
            },

            setSwipeSlideOnDefaultTab: function (rightbar) {
                var ctrl = this;

                if (rightbar) {
                    ctrl.setSwipeRightbar();
                } else {
                    ctrl.left = 'left';
                    ctrl.right = 'right';
                }

                ctrl.swipeSlide = new WinJSContrib.UI.SwipeSlide(ctrl.tabWrapper);
                ctrl.navigator.animations.exitPage = function (elt) { return WinJSContrib.UI.Animation.fadeOut(elt, { duration: 100 }) };

                ctrl.swipeSlide.onswipe = function (arg) {
                    var targetStyle = ctrl.swipeSlide.target.style;
                    if (targetStyle.hasOwnProperty('webkitTransform')) {
                        console.log('running on webkit');
                    }

                    ctrl.swipeSlide.swipeHandled = true;
                    if (ctrl.currentTab && ctrl.navigator.pageElement) {
                        var pageElt = ctrl.navigator.pageElement;
                        pageElt.style.transform = targetStyle.transform;
                        if (targetStyle.hasOwnProperty('webkitTransform')) {
                            pageElt.style.webkitTransform = targetStyle.webkitTransform;
                            targetStyle.webkitTransform = '';
                        }
                        targetStyle.transform = '';

                        if (arg.detail.direction === 'left') {
                            pageElt.winControl.getAnimationElements = function () { return null; }
                            //ctrl.navigator.pageElement.exitPage = function () { return WinJS.Promise.wrap(); };
                            WinJSContrib.UI.Animation.slideToLeft(pageElt);
                        }
                        else if (arg.detail.direction === 'right') {
                            pageElt.winControl.getAnimationElements = function () { return null; }
                            //ctrl.navigator.pageElement.exitPage = function () { return WinJS.Promise.wrap(); };
                            WinJSContrib.UI.Animation.slideToRight(pageElt);
                        }
                        //ctrl.navigator.pageElement.style.opacity = 0;
                    }
                    targetStyle.transform = '';
                    if (targetStyle.hasOwnProperty('webkitTransform'))
                        targetStyle.webkitTransform = '';

                    if (ctrl.currentTab == null)
                        ctrl.selectFirst();
                    else if (arg.detail.direction === 'right') {
                        ctrl.navigator.animations.enterPage = function () {
                            return WinJSContrib.UI.Animation.slideFromLeft(ctrl.tabWrapper);
                        }

                        if (ctrl.currentTab.index == 0) {
                            ctrl.selectByIndex(ctrl.tabs.default.length - 1);
                        } else {
                            ctrl.selectByIndex(ctrl.currentTab.index - 1);
                        }

                    } else if (arg.detail.direction === 'left') {
                        ctrl.navigator.animations.enterPage = function () {
                            return WinJSContrib.UI.Animation.slideFromRight(ctrl.tabWrapper);
                        }

                        if (ctrl.currentTab.index == ctrl.tabs.default.length - 1) {
                            ctrl.selectByIndex(0);
                        }
                        else {
                            ctrl.selectByIndex(ctrl.currentTab.index + 1);
                        }
                    }
                }
            },

            getPageLinkArgs: function (tab) {
                var ctrl = this;
                return tab.link.args || ctrl.tabLinkArgs;
            },

            getPageLink: function (tab) {
                var ctrl = this;
                if (tab.link.uri || ctrl.tabLinkUri) {
                    return { uri: tab.link.uri || ctrl.tabLinkUri, args: ctrl.getPageLinkArgs(tab) };
                }

                return null;
            },

            selectFirst: function (skipHeader) {
                return this.selectTab(this.tabs.default[0], skipHeader);
            },

            selectTab: function (tab, skipHeader, args) {
                var ctrl = this;

                if (tab == ctrl.currentTab) return WinJS.Promise.wrap(null);

                var link = ctrl.getPageLink(tab);
                if (!link) return WinJS.Promise.wrap(null);

                ctrl.currentTab = tab;
                var currentHeader = ctrl.tabHeader.querySelector('.mcn-tabpages-headeritem.current');
                if (currentHeader)
                    WinJS.Utilities.removeClass(currentHeader, 'current');

                if (!skipHeader)
                    ctrl.selectTabHeader();

                var navArgs = $.extend({}, args, link.args);
                return ctrl.navigator.open(link.uri, navArgs);
            },

            selectTabHeader: function () {
                var ctrl = this;
                if (ctrl.currentTab) {
                    WinJS.Utilities.addClass(ctrl.currentTab.element, 'current');
                }
            },

            selectByIndex: function (index, skipHeader, group, args) {
                var ctrl = this;

                var grp = ctrl.tabs[group || 'default'];
                var tab = grp[index];

                if (tab)
                    return ctrl.selectTab(tab, skipHeader, args);

                return WinJS.Promise.wrap(null);
            },

            selectByName: function (name, skipHeader, group, args) {
                var ctrl = this;

                var grp = ctrl.tabs[group || 'default'];
                for (var i = 0 ; i < grp.length; i++) {
                    var tab = grp[i];
                    if (tab.item && (tab.item.id === name || tab.item.name === name)) {
                        return ctrl.selectTab(tab, skipHeader, args);
                    }
                }

                return WinJS.Promise.wrap(null);
            },

            selectByItem: function (item, skipHeader, group, args) {
                var ctrl = this;
                var grp = ctrl.tabs[group || 'default'];
                for (var i = 0 ; i < grp.length; i++) {
                    var tab = grp[i];
                    if (tab.item == item) {
                        return ctrl.selectTab(tab, skipHeader, args);
                    }
                }

                return WinJS.Promise.wrap(null);
            },

            registerTabs: function (tabItems, group) {
                var ctrl = this;
                var grp = ctrl.tabs[group || 'default'];
                if (!grp) {
                    ctrl._createGroupHeader(group);
                    grp = ctrl.tabs[group];
                }

                var tabElements = ctrl.element.querySelectorAll('.mcn-tabpages-headeritem');
                for (var i = 0 ; i < tabElements.length; i++) {
                    var element = tabElements[i];
                    (function (element) {
                        var tab = {
                            element: element,
                            link: {
                                uri: element.getAttribute('data-tabtarget')
                            }
                        };
                        element.mcnTab = tab;
                        grp.tabGroup.appendChild(element);
                        tab.index = grp.length;
                        tab.group = group;
                        grp.push(tab);
                        WinJSContrib.UI.tap(tab.element, function () {
                            ctrl.selectTab(tab);
                        });
                    })(element);
                }
            },

            addTab: function (tabItem, group) {
                return this.addTabs([tabItem], group);
            },

            addTabs: function (tabItems, group) {
                var ctrl = this;
                var grp = ctrl.tabs[group || 'default'];
                if (!grp) {
                    ctrl._createGroupHeader(group);
                    grp = ctrl.tabs[group];
                }

                var container = grp.tabGroup;
                var template = ctrl.tabHeaderTemplate;
                if (template)
                    template = WinJSContrib.Utils.getTemplate(template);

                return WinJSContrib.Promise.waterfall(tabItems, function (tabitem) {
                    var tabelt = document.createElement('DIV');
                    tabelt.className = 'mcn-tabpages-headeritem';
                    container.appendChild(tabelt);

                    var tab = {
                        element: tabelt,
                        item: tabitem,
                        link: {
                            uri: tabitem.uri || tabitem.href || ctrl.tabLinkUri,
                            args: tabitem.args || null,
                            oninvoked: tabitem.invoked
                        }
                    };

                    tabelt.mcnTab = tab;
                    tab.index = grp.length;
                    tab.group = group;
                    grp.push(tab);
                    WinJSContrib.UI.tap(tabelt, function () {
                        if (tab.link.oninvoked) {
                            tab.link.oninvoked(ctrl, tab);
                        } else {
                            ctrl.selectTab(tab);
                        }
                    });

                    return template.render(tabitem).then(function (rendered) {
                        while (rendered.children.length > 0) {
                            tabelt.appendChild(rendered.children[0]);
                        }
                    });
                });
            }
        })
    });
})();
