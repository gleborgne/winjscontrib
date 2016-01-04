(function () {
    'use strict';
    
    var DataFormState = WinJS.Class.mix(WinJS.Class.define(function () {
        this._initObservable();
    }, {
    }), WinJS.Binding.mixin, WinJS.Binding.expandProperties({ isValid: false, updated: false }));

    WinJS.Namespace.define("WinJSContrib.UI", {
        DataForm: WinJS.Class.mix(WinJS.Class.define(
            /**
             * @class WinJSContrib.UI.DataForm
             * @classdesc
             * This control enhance data form management by adding validation mecanism and form state helpers. It must be placed on a form element.
             * Input fields must use {@link WinJSContrib.UI.DataFormBinding} to bind object properties to input
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
             */
            function ctor(element, options) {
                var ctrl = this;
                this.element = element || document.createElement('FORM');
                //$(this.element).submit(function (e) {
                //    e.preventDefault()
                //})
                options = options || {};
                this.groups = options.groups;
                this.messages = options.messages;
                this.rules = options.rules;
                /**
                 * state of the form
                 * @field
                 * @type {Object}
                 */
                this.state = new DataFormState();
                this.state.item = {};
                this.allowTooltip = options.allowTooltip || true;
                this.workOnCopy = options.workOnCopy || true;
                this.tooltipDelay = options.tooltipDelay || 4000;
                this.tooltipPosition = options.tooltipPosition || 'right';
                this.tooltipTheme = options.tooltipTheme || 'tooltipster-error';
                this.initValidator();
                this.element.winControl = this;
                this.element.mcnDataForm = true;
                this.element.classList.add('win-disposable');
                if (WinJSContrib.CrossPlatform && WinJSContrib.CrossPlatform.crossPlatformClass)
                    WinJSContrib.CrossPlatform.crossPlatformClass(this.element);
                WinJS.UI.setOptions(this, options);
                WinJS.UI.processAll(this.element).done(function () {
                    WinJS.Binding.processAll(ctrl.element, ctrl.state);
                });

                $('.mcn-dataform-cancel', this.element).click(function (arg) {
                    arg.preventDefault();
                    ctrl.cancel();
                });
            },
            /**
             * @lends WinJSContrib.UI.DataForm.prototype
             */
        {
            /**
             * @member {Array}
             */
            messages: {
                get: function () {
                    return this._messages;
                },
                set: function (val) {
                    this._messages = val;
                }
            },
            /**
             * @member {Array}
             */
            rules: {
                get: function () {
                    return this._rules;
                },
                set: function (val) {
                    this._rules = val;
                }
            },
            /**
             * @member {Array}
             */
            groups: {
                get: function () {
                    return this._groups;
                },
                set: function (val) {
                    this._groups = val;
                }
            },
            /**
             * object bound to data form
             * @member {Object}
             */
            item: {
                get: function () {
                    return this.state.item;
                },
                set: function (val) {
                    var dataform = this;
                    if (dataform.workOnCopy) {
                        dataform.state.item = $.extend(true, {}, val);
                        dataform.state.refItem = val;
                    }
                    else {
                        dataform.state.item = val;
                    }

                    
                    dataform.validator.resetForm();

                    dataform.autobindFields();
                    WinJS.Binding.processAll(this.element, this.state).done(function () {
                        var tooltips = dataform.allowTooltip;
                        dataform.allowTooltip = false;
                        dataform.validator.form();
                        dataform.allowTooltip = tooltips;
                        dataform.checkState();
                        dataform.initValidator();
                        dataform.state.updated = false;
                    });
                    dataform.dispatchEvent("itemchanged", { dataform: this, item: val });
                }
            },
            /**
             * indicate if form has updates
             * @member {boolean}
             */
            updated: {
                get: function () {
                    return this.state.updated;
                },
                set: function (val) {
                    this.state.updated = val;
                    this.dispatchEvent("haschanges");
                }
            },

            autobindFields: function () {
                var ctrl = this;
                $('[data-formfield]', ctrl.element).each(function () {
                    var fieldElt = this;
                    var srcProperty = $(fieldElt).data('formfield');
                    var destFieldType = 'value';
                    if (fieldElt.type == 'checkbox') {
                        destFieldType = 'checked';
                    }
                    WinJSContrib.UI.DataFormBinding(ctrl.state.item, srcProperty.split('.'), fieldElt, [destFieldType]);
                });
            },

            /**
             * check form state
             */
            checkState: function () {
                var nbInvalids = this.validator.numberOfInvalids();
                this.state.isValid = nbInvalids == 0;
            },

            /**
             * cancel updates on form item
             */
            cancel: function () {
                var dataform = this;
                if (dataform.workOnCopy) {
                    dataform.item = $.extend(true, {}, dataform.state.refItem);
                }
            },

            /**
             * apply changes to source object (relevant only if using workOnCopy)
             */
            save: function () {
                var dataform = this;
                if (dataform.workOnCopy) {
                    dataform.state.updated = false;
                    dataform.state.refItem = $.extend(true, {}, dataform.state.item);
                }
            },

            initValidator: function () {
                var dataform = this;

                this.validator = $(this.element).validate({
                    groups: this.groups,
                    rules: this.rules,
                    submitHandler: function (form) {
                        dataform.dispatchEvent('submitted', { item: dataform.state.item });
                    },

                    invalidHandler: function (form, validator) {
                        dataform.checkState();
                    },

                    errorPlacement: function (error, element) {
                        dataform.checkState();
                        if (!dataform.allowTooltip)
                            return;

                        var $e = $(element);
                        $e.tooltipster({
                            trigger: 'custom',
                            onlyOne: false,
                            position: dataform.tooltipPosition,
                            theme: dataform.tooltipTheme
                        });

                        var lastError = $e.data('lastError'),
                            newError = $(error).text();

                        $e.data('lastError', newError);

                        if (newError !== '' && newError !== lastError) {
                            $e.tooltipster('content', newError);
                            $e.tooltipster('show');
                            $e[0].tooltipsterValidationTimeout = setTimeout(function () {
                                $e[0].tooltipsterValidationTimeout = null;
                                if ($e.hasClass('tooltipster'))
                                    $e.tooltipster('hide');
                            }, dataform.tooltipDelay);
                        }
                    },

                    success: function (label, element) {
                        dataform.checkState();
                        var $e = $(element);
                        if ($e[0].tooltipsterValidationTimeout) {
                            clearTimeout($e[0].tooltipsterValidationTimeout);
                            $e[0].tooltipsterValidationTimeout = null;
                        }

                        if ($e.hasClass('tooltipstered')) {
                            $e.tooltipster('hide');
                        }
                    }

                });
            },

            /**
             * validate form
             */
            validate: function () {
                var res = this.validator.form();
                return res;
            },

            /**
             * release form
             */
            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        },
        /**
         * @lends WinJSContrib.UI.DataForm
         */
        {
            /**
             * @namespace WinJSContrib.UI.DataForm.defaultBindingOptions
             */
            DefaultBindingOptions: {
                trimText: true,
                convertEmptyToNull: true,
            },

            /**
             * @namespace WinJSContrib.UI.DataForm.Converters
             */
            Converters: {
                /**
                 * @member
                 */
                "none": {
                    fromObject: function (val, options) {
                        return val.toString();
                    },
                    fromInput: function (val, options) {
                        return val;
                    }
                },
                /**
                 * @member
                 */
                "text": {
                    fromObject: function (val, options) {
                        if (typeof val === "undefined" || val === null)
                            return '';

                        var res = val.toString();
                        
                        return res;
                    },
                    fromInput: function (val, options) {
                        var res = val;
                        if (res && options && options.trimText) {
                            res = res.trim();
                        }
                        if (options && options.convertEmptyToNull) {
                            res = (res === '') ? null : res;
                        }
                        return res;
                    }
                },
                /**
                 * @member
                 */
                "number": {
                    fromObject: function (val, options) {
                        if (typeof val !== "number")
                            return '';

                        return val.toString();
                    },
                    fromInput: function (val, options) {
                        if (typeof val !== "undefined" && val !== null)
                          //return parseFloat(val);
                          return parseFloat(val.toString().replace(',', '.').replace(' ', ''));

                        return null;
                    }
                },
                /**
                 * @member
                 */
                "boolean": {
                    fromObject: function (val, options) {
                        if (typeof val === "undefined" || val === null)
                            return '';

                        return val.toString();
                    },
                    fromInput: function (val, options) {
                        if (val === 'true')
                            return true;
                        if (val === 'false')
                            return false;

                        return null;
                    }
                },
                /**
                 * @member
                 */
                "object": {
                    fromObject: function (val, options) {
                        return val;
                    },
                    fromInput: function (val, options) {
                        return val;
                    }
                },
                /**
                 * @member
                 */
                "stringifiedObject": {
                    fromObject: function (val, options) {
                        return JSON.stringify(val);
                    },
                    fromInput: function (val, options) {
                        return JSON.parse(val);
                    }
                }
            }
        }),
        WinJS.UI.DOMEventMixin,
        WinJS.Utilities.createEventProperties("itemchanged", "haschanges", "submitted")),

        parentDataForm: function (element) {
            var current = element.parentNode;

            while (current) {
                if (current.mcnDataForm) {
                    return current.winControl;
                }
                current = current.parentNode;
            }
        },

        

        /**
         * bi-directional binding for working with input fields and custom input controls. This binding expect a {@link WinJSContrib.UI.DataForm} to be found on the parent form
         * @function WinJSContrib.UI.DataFormBinding
         * @param {Object} source object owning data
         * @param {string[]} sourceProperty path to object data
         * @param {HTMLElement} dest DOM element targeted by binding
         * @param {string[]} destProperty path to DOM element property targeted by binding
         */
        DataFormBinding: WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            //if (dest.binded && dest.winControl)
            //    dest.winControl.dispose();

            var dataform = WinJSContrib.UI.parentDataForm(dest);
            var options = WinJSContrib.UI.DataForm.DefaultBindingOptions;
            var optionsText = dest.getAttribute("data-formfield-options");
            if (optionsText) {
                options = WinJS.UI.optionsParser(optionsText, window);
            }
            var inputType = "";
            var inputOption = dest.getAttribute("data-forminput");
            if (inputOption) {
                inputType = inputOption;
            }

            var fieldUpdated = false;
            dest.classList.add('mcn-dataform-field');

            //si le noeud n'est pas un champ input html, on renseigne la propriété form, sinon plantage de jquery validate
            if (!dest.form) {
                dest.form = dataform.element;
            }

            var inputType = 'text';
            if ($(dest).data('formfield-type')) {
                inputType = $(dest).data('formfield-type');
            }
            else if (dest.nodeName !== "TEXTAREA" && typeof dest.type !== "undefined") {
                inputType = dest.type;
            }
            var converter = WinJSContrib.UI.DataForm.Converters[inputType] || WinJSContrib.UI.DataForm.Converters['text'];

            function updateInputFromObject() {
                var data = WinJSContrib.Utils.readProperty(source, sourceProperty);
                if (typeof data === "undefined")
                    data = null;

                if (dest.nodeName == "INPUT" && dest.type == "radio") {
                    var fieldname = dest.name;
                    if (dest.value == data) {
                        dest.checked = true;
                    }
                } else {
                    data = converter.fromObject(data, options);
                    WinJSContrib.Utils.writeProperty(dest, destProperty, data);
                }
            }

            function updateObjectFromInput() {
                dataform.checkState();
                if (!dest.id || dataform.validator.element(dest)) {
                    var val = null;
                    if (dest.nodeName == "INPUT" && dest.type == "radio") {
                        var fieldname = dest.name;
                        if (dest.form && dest.form[fieldname] && dest.form[fieldname].length) {
                            for (var i = 0, l = dest.form[fieldname].length; i < l ; i++) {
                                var field = dest.form[fieldname][i];
                                if (field.checked){
                                    val = field.value;
                                    break;
                                }
                            }
                        }
                    } else {
                        val = WinJSContrib.Utils.getProperty(dest, destProperty).propValue;
                    }

                    if (val !== undefined)
                        val = converter.fromInput(val, options);

                    WinJSContrib.Utils.writeProperty(source, sourceProperty, val);
                }
                dataform.updated = true;
            }

            function validateObjectOnBlur() {
                if (fieldUpdated)
                    dataform.validator.element(dest);
            }
            if (!dest.binded)
                dest.binded = true;


            if (!dest.winControl) {
                dest.classList.add('win-disposable');
                dest.winControl = {
                    dispose: function () {
                        dest.removeEventListener("change", dest.winControl.updateObjectFromInput);
                        dest.removeEventListener("blur", dest.winControl.validateObjectOnBlur);
                        if (inputType) {
                            dest.removeEventListener(inputType, dest.winControl.updateObjectFromInput);
                        }
                    }
                }
            }
            dest.winControl.updateObjectFromInput = updateObjectFromInput;
            dest.winControl.validateObjectOnBlur = validateObjectOnBlur;

            if (inputType) {
                dest.addEventListener(inputType, dest.winControl.updateObjectFromInput);
            }
            dest.addEventListener("change", dest.winControl.updateObjectFromInput);
            if (dest.id) {
                dest.addEventListener("blur", validateObjectOnBlur);
            }

            var bindingDesc = {
            };

            bindingDesc[sourceProperty] = updateInputFromObject;
            return WinJS.Binding.bind(source, bindingDesc);
        })
    });
})();
