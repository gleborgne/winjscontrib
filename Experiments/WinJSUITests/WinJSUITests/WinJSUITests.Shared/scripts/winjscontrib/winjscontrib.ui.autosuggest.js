/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        AutoSuggest: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            var ctrl = this;
            this.element = element || document.createElement('DIV');
            options = options || {};
            this.element.winControl = this;
            this.element.classList.add('win-disposable');
            this.maxHeight = 200;
            this.eventTracker = new WinJSContrib.UI.EventTracker();

            this.input = document.createElement("INPUT");
            this.flyout = document.createElement("DIV");
            this.flyout.className = "mcn-autosuggest-flyout";
            this.flyout.style.display = "none";
            this.flyoutVisible = false;
            this.element.appendChild(this.input);
            document.body.appendChild(this.flyout);
            this.flyoutContent = document.createElement("DIV");
            this.flyoutContent.className = "mcn-autosuggest-flyoutcontent";
            this.flyout.appendChild(this.flyoutContent);

            this.eventTracker.addEvent(this.input, "input", this.inputChanged.bind(this));
            this.eventTracker.addEvent(document.body, "click", function () {
                ctrl.hideFlyout();
            });

            var evtname = "click";
            this.eventTracker.addEvent(this.flyout, evtname, function (arg) {
                //arg.preventDefault();
                arg.stopPropagation();
                arg.stopImmediatePropagation();
            });

            WinJS.UI.setOptions(this, options);
        }, {
            value: {
                get: function () {
                    return this.input.value;
                },
                set: function (val) {
                    this.input.value = val;
                }
            },

            placeholderText: {
                get: function () {
                    return this.input.getAttribute("placeholder").value;
                },
                set: function (val) {
                    this.input.setAttribute("placeholder", val);
                }
            },

            inputChanged: function (arg) {
                var ctrl = this;
                
                if (ctrl.input.value && ctrl.input.value != ctrl.lastinput) {
                    ctrl.lastinput = ctrl.input.value;
                    var promises = [];
                    var suggestions = [];
                    var arg = {
                        queryText: ctrl.input.value,
                        searchSuggestionCollection : {
                            appendResultSuggestion: function (title, desc, data, options) {
                                suggestions.push({ title: title, desc: desc, data: data, options: options });
                            }
                        },
                        setPromise: function (p) {
                            promises.push(p);
                        }
                        
                    };

                    ctrl.dispatchEvent("suggestionsrequested", arg);

                    WinJS.Promise.join(promises).then(function () {
                        console.log("suggestions ok " + suggestions.length);
                        ctrl.flyoutContent.innerHTML = "";
                        var container = document.createDocumentFragment();
                        suggestions.forEach(function (s) {
                            var elt = document.createElement("DIV");
                            elt.className = "mcn-autosuggest-item";

                            if (s.options && s.options.template) {
                                ctrl.renderItemFromTemplate(s.data, elt, s.options.template);
                            } else {
                                ctrl.renderItem(s, elt);
                            }

                            container.appendChild(elt);
                            
                            elt.onclick = function () {
                                ctrl.dispatchEvent("resultsuggestionchosen", { tag: s.data });
                                ctrl.hideFlyout();
                            }
                        });
                        ctrl.flyoutContent.appendChild(container);

                        ctrl.showFlyout();

                    }, function (err) {
                        console.log("suggestions cancel")
                    });
                }
            },

            renderItemFromTemplate: function (item, container, template) {
                if (template.winControl)
                    template = template.winControl;

                if (typeof template == 'function') {
                    template(WinJS.Promise.wrap(item)).then(function (rendered) {
                        container.appendChild(rendered);
                    });
                } else if (template.render) {
                    template.render(item).then(function (rendered) {
                        container.appendChild(rendered);
                    });
                }
            },

            renderItem: function (item, container) {
                var ctrl = this;                

                if (s.options && s.options.cssIcon) {
                    var icon = document.createElement("DIV");
                    icon.className = "cssicon " + s.options.cssIcon;
                    container.appendChild(icon);
                }

                var content = document.createElement("DIV");
                content.className = "mcn-autosuggest-content";
                container.appendChild(content);

                var title = document.createElement("DIV");
                title.className = "title";
                title.innerText = s.title;
                content.appendChild(title);

                if (s.desc) {
                    var desc = document.createElement("DIV");
                    desc.className = "desc";
                    desc.innerText = s.desc;
                    content.appendChild(desc);
                }                
            },

            updateFlyoutPosition: function () {
                var ctrl = this;
                var i = ctrl.element.getBoundingClientRect();                

                ctrl.flyout.style.position = "absolute";
                ctrl.flyout.style.left = i.left + "px";
                ctrl.flyout.style.width = i.width + "px";
                ctrl.flyout.style.top = (i.top + i.height) + "px";
                ctrl.flyout.style.maxHeight = Math.min(ctrl.maxHeight, document.body.clientHeight - i.top - i.height - 50) + "px";
            },

            hideFlyout : function(){
                var ctrl = this;
                ctrl.flyout.style.display = "none";
                ctrl.flyoutVisible = false;
            },

            showFlyout: function () {
                var ctrl = this;
                ctrl.updateFlyoutPosition();
                ctrl.flyout.style.display = "";
                ctrl.flyoutVisible = true;
            },

            dispose: function () {
                this.eventTracker.dispose();
                document.body.removeChild(this.flyout);
                WinJS.Utilities.disposeSubTree(this.element);
                this.element = null;
            }
        }),
        WinJS.Utilities.eventMixin,
        WinJS.Utilities.createEventProperties("suggestionsrequested", "resultsuggestionchosen"))
    });
})();