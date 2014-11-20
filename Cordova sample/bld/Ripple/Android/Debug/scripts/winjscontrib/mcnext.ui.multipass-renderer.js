//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

var MCNEXT = MCNEXT || {};
MCNEXT.UI = MCNEXT.UI || {};

(function () {
    "use strict";



    MCNEXT.UI.MultiPassRenderer = function (element, options) {
        options = options || {};
        this.items = [];
        this.container = element;
        this.multipass = options.multipass || false;
        this.itemClassName = options.itemClassName;
        this.itemTemplate = MCNEXT.Utils.getTemplate(options.itemTemplate);
        this.itemInvoked = options.itemInvoked;
        this.onitemContent = options.onitemContent;
        this.element = element;

        if (element) {
            element.className = element.className + ' mcn-items-ctrl';
            //element.style.display = 'none';
        }

        element.mcnRenderer = this;
    }

    MCNEXT.UI.MultiPassRenderer.prototype.prepareItems = function (items, renderOptions) {
        var ctrl = this;
        items = items || [];
        renderOptions = renderOptions || {};
        var numItems = items.length;

        var itemInvoked = renderOptions.itemInvoked || ctrl.itemInvoked;
        if (typeof itemInvoked == 'string')
            itemInvoked = MCNEXT.Utils.resolveMethod(ctrl.element, itemInvoked);
        var template = MCNEXT.Utils.getTemplate(renderOptions.template) || ctrl.itemTemplate;
        var className = renderOptions.itemClassName || ctrl.itemClassName;
        var onitemContent = renderOptions.onitemContent || ctrl.onitemContent;
        var container = ctrl.container;
        var registereditems = ctrl.items;


        for (var i = 0 ; i < numItems; i++) {
            var itemdata = items[i];
            var item = new MCNEXT.UI.MultiPassItem(ctrl, null, {
                data: itemdata,
                template: template,
                className: className,
                itemInvoked: itemInvoked,
                onitemContent: onitemContent
            });
            registereditems.push(item);
            container.appendChild(item.element);
        }

        if (renderOptions.renderItems || !this.multipass) {
            ctrl.renderItemsContent();
        }
        //ctrl.element.style.display = '';


    }

    MCNEXT.UI.MultiPassRenderer.prototype.renderItemsContent = function () {
        var ctrl = this;
        ctrl.items.forEach(function (item) {
            if (!item.rendered) {
                //setImmediate(function () {
                item.render();
                //});
            }
        });
    }

    MCNEXT.UI.MultiPassItem = function (renderer, element, options) {
        options = options || {};
        var item = this;
        item.renderer = renderer;
        item.element = element || document.createElement('DIV');
        item.element.className = item.element.className + ' ' + options.className + ' mcn-multipass-item';
        item.element.winControl = item;

        item.itemInvoked = options.itemInvoked;
        item.itemDataPromise = WinJS.Promise.as(options.data);

        item.itemTemplate = options.template;
        item.rendered = false;
    }

    MCNEXT.UI.MultiPassItem.prototype.render = function (delayed) {
        var ctrl = this;

        if (ctrl.itemTemplate && !ctrl.rendered) {

            ctrl.rendered = true;
            return ctrl._renderContent();
        }

        return WinJS.Promise.wrap(ctrl.contentElement);
    }

    MCNEXT.UI.MultiPassItem.prototype._renderContent = function () {
        var ctrl = this;

        if (ctrl.itemTemplate) {
            return ctrl.itemDataPromise.then(function (data) {
                ctrl.itemData = data;
                return ctrl.itemTemplate.render(data).then(function (rendered) {
                    //for (var i = 0 ; i < rendered.children.length; i++) {
                    //    ctrl.element.appendChild(rendered.children[i]);
                    //}
                    ctrl.element.appendChild(rendered);

                    if (ctrl.itemInvoked) {
                        if (typeof ctrl.itemInvoked == 'string')
                            ctrl.itemInvoked = MCNEXT.Utils.resolveMethod(ctrl.element, ctrl.itemInvoked);

                        if (ctrl.itemInvoked) {
                            $(ctrl.element).tap(function (arg) {
                                ctrl.itemInvoked(ctrl);
                            });
                        }
                    }

                    if (ctrl.onitemContent) {
                        ctrl.onitemContent(ctrl.itemData, rendered);
                    }
                    else if (ctrl.renderer.onitemContent) {
                        ctrl.renderer.onitemContent(ctrl.itemData, rendered);
                    }

                    setImmediate(function () {
                        ctrl.element.classList.add('loaded');
                    });

                    ctrl.rendered = true;
                    ctrl.contentElement = rendered;
                    return rendered;
                });
            });
        }

        return WinJS.Promise.wrap();
    }
})();