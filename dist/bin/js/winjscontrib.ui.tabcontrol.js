/* 
 * WinJS Contrib v2.0.1.0
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/ui.js" />
(function () {
    "use strict";

    WinJS.Namespace.define("WinJSContrib.UI", {
        TabPages: WinJS.Class.define(
            // Define the constructor function for the PageControlNavigator.
            function TabPages(element, options) {
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
                    ctrl.tabContent = document.createElement('DIV');
                    ctrl.tabContent.className = 'mcn-tabpages-content';
                    ctrl.element.appendChild(ctrl.tabContent);
                }
                ctrl.navigator = new WinJSContrib.UI.PageControlNavigator(ctrl.tabContent, { global: false, delay: 10, disableHistory: true });
                ctrl.navigator.animationWaitForPreviousPageClose = false;
                ctrl.navigator.animations.exitPage = WinJSContrib.UI.Animation.tabExitPage;
                ctrl.navigator.animations.enterPage = WinJSContrib.UI.Animation.tabEnterPage;

                if (!ctrl.tabHeader) {
                    ctrl.tabHeader = document.createElement('DIV');
                    ctrl.tabHeader.className = 'mcn-tabpages-header';
                    ctrl.element.appendChild(ctrl.tabHeader);
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
                    }
                    else {
                        ctrl.left = 'left';
                        ctrl.right = 'right';
                    }

                    ctrl.swipeSlide = new WinJSContrib.UI.SwipeSlide(ctrl.tabContent);
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


                            if (arg.detail.direction == 'left') {
                                pageElt.winControl.getAnimationElements = function () { return null; }
                                //ctrl.navigator.pageElement.exitPage = function () { return WinJS.Promise.wrap(); };
                                WinJSContrib.UI.Animation.slideToLeft(pageElt);
                            }
                            else if (arg.detail.direction == 'right') {
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

                        else if (arg.detail.direction == 'right') {
                            ctrl.navigator.animations.enterPage = function () {
                                return WinJSContrib.UI.Animation.slideFromLeft(ctrl.tabContent);
                            }

                            if (ctrl.currentTab.index == 0) {
                                ctrl.selectByIndex(ctrl.tabs.default.length - 1)
                            }
                            else {
                                ctrl.selectByIndex(ctrl.currentTab.index - 1);
                            }

                        } else if (arg.detail.direction == 'left') {
                            ctrl.navigator.animations.enterPage = function () {
                                return WinJSContrib.UI.Animation.slideFromRight(ctrl.tabContent);
                            }

                            if (ctrl.currentTab.index == ctrl.tabs.default.length - 1) {
                                ctrl.selectByIndex(0)
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
                },

                selectFirst: function (skipHeader) {
                    this.selectTab(this.tabs.default[0], skipHeader);
                },

                selectTab: function (tab, skipHeader) {
                    var ctrl = this;

                    if (tab == ctrl.currentTab)
                        return;

                    var link = ctrl.getPageLink(tab);
                    if (link) {
                        ctrl.navigator.open(link.uri, link.args);
                        ctrl.currentTab = tab;
                        var currentHeader = ctrl.tabHeader.querySelector('.mcn-tabpages-headeritem.current');
                        if (currentHeader) WinJS.Utilities.removeClass(currentHeader, 'current');

                        if (!skipHeader)
                            ctrl.selectTabHeader();
                    }
                },

                selectTabHeader: function () {
                    var ctrl = this;
                    if (ctrl.currentTab) {
                        WinJS.Utilities.addClass(ctrl.currentTab.element, 'current');
                    }
                },

                selectByIndex: function (index, skipHeader, group) {
                    var ctrl = this;

                    var grp = ctrl.tabs[group || 'default'];
                    var tab = grp[index];

                    if (tab)
                        ctrl.selectTab(tab, skipHeader);
                },

                selectByItem: function (item, skipHeader, group) {
                    var ctrl = this;
                    var grp = ctrl.tabs[group || 'default'];
                    for (var i = 0 ; i < grp.length; i++) {
                        var tab = grp[i];
                        if (tab.item == item) {
                            ctrl.selectTab(tab, skipHeader);
                            break;
                        }
                    }
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
                            $(tab.element).tap(function () {
                                ctrl.selectTab(tab);
                            });
                        })(element);
                    }
                },

                addTab: function (tabItem, group) {
                    this.addTabs([tabItem]);
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

                    tabItems.forEach(function (tabitem) {
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
                        $(tabelt).tap(function () {
                            if (tab.link.oninvoked) {
                                tab.link.oninvoked(ctrl, tab);
                            }
                            else {
                                ctrl.selectTab(tab);
                            }
                        });

                        template.render(tabitem).done(function (rendered) {
                            while (rendered.children.length > 0) {
                                tabelt.appendChild(rendered.children[0]);
                            }


                        });
                    });
                },


            })
    });
})();
