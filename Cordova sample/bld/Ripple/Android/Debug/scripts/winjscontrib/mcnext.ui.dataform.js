(function () {
    'use strict';
    var DataFormState = WinJS.Class.mix(WinJS.Class.define(function () {
        this._initObservable();
    }, {
    }), WinJS.Binding.mixin, WinJS.Binding.expandProperties({ isValid: false, updated: false }));

    WinJS.Namespace.define("MCNEXT.UI", {
        DataForm: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            var ctrl = this;
            this.element = element || document.createElement('FORM');
            //$(this.element).submit(function (e) {
            //    e.preventDefault()
            //})
            options = options || {};
            this.groups = options.groups;
            this.messages = options.messages;
            this.rules = options.rules;
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
            if (MCNEXT.CrossPlatform)
                MCNEXT.CrossPlatform.cordovaClass(this.element.classList);
            WinJS.UI.setOptions(this, options);
            WinJS.UI.processAll(this.element).done(function () {
                WinJS.Binding.processAll(ctrl.element, ctrl.state);
            });

            $('.mcn-dataform-cancel', this.element).click(function (arg) {
                arg.preventDefault();
                ctrl.cancel();
            });
        }, {
            messages: {
                get: function () {
                    return this._messages;
                },
                set: function (val) {
                    this._messages = val;
                }
            },
            rules: {
                get: function () {
                    return this._rules;
                },
                set: function (val) {
                    this._rules = val;
                }
            },
            groups: {
                get: function () {
                    return this._groups;
                },
                set: function (val) {
                    this._groups = val;
                }
            },
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

                    dataform.state.updated = false;
                    dataform.validator.resetForm();

                    dataform.autobindFields();
                    WinJS.Binding.processAll(this.element, this.state).done(function () {
                        var tooltips = dataform.allowTooltip;
                        dataform.allowTooltip = false;
                        dataform.validator.form();
                        dataform.allowTooltip = tooltips;
                        dataform.checkState();
                        dataform.initValidator();
                    });
                    dataform.dispatchEvent("itemchanged", { dataform: this, item: val });
                }
            },

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
                    MCNEXT.UI.DataFormBinding(ctrl.state.item, srcProperty.split('.'), fieldElt, [destFieldType]);
                });
            },

            checkState: function () {
                var nbInvalids = this.validator.numberOfInvalids();
                this.state.isValid = nbInvalids == 0;
            },

            cancel: function () {
                var dataform = this;
                if (dataform.workOnCopy) {
                    dataform.item = $.extend(true, {}, dataform.state.refItem);
                }
            },

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

            validate: function () {
                var res = this.validator.form();
                return res;
            },

            dispose: function () {
                WinJS.Utilities.disposeSubTree(this.element);
            }
        }, {
            Converters: {
                "none": {
                    fromObject: function (val) {
                        return val.toString();
                    },
                    fromInput: function (val) {
                        return val;
                    }
                },
                "text": {
                    fromObject: function (val) {
                        if (typeof val === "undefined" || val === null)
                            return '';

                        return val.toString();
                    },
                    fromInput: function (val) {
                        return val;
                    }
                },
                "number": {
                    fromObject: function (val) {
                        if (typeof val !== "number")
                            return '';

                        return val.toString();
                    },
                    fromInput: function (val) {
                        if (typeof val !== "undefined" || val !== null)
                            return parseFloat(val);
                    }
                },
                "boolean": {
                    fromObject: function (val) {
                        if (typeof val === "undefined" || val === null)
                            return '';

                        return val.toString();
                    },
                    fromInput: function (val) {
                        if (val === 'true')
                            return true;
                        if (val === 'false')
                            return false;

                        return null;
                    }
                },
                "object": {
                    fromObject: function (val) {
                        return val;
                    },
                    fromInput: function (val) {
                        return val;
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

        DataFormBinding: WinJS.Binding.initializer(function (source, sourceProperty, dest, destProperty) {
            var dataform = MCNEXT.UI.parentDataForm(dest);
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
            var converter = MCNEXT.UI.DataForm.Converters[inputType] || MCNEXT.UI.DataForm.Converters['text'];

            function updateInputFromObject() {
                var data = MCNEXT.Utils.readProperty(source, sourceProperty);
                if (typeof data === "undefined")
                    data = null;

                data = converter.fromObject(data);

                MCNEXT.Utils.writeProperty(dest, destProperty, data);
            }

            function updateObjectFromInput() {
                dataform.checkState();
                dataform.updated = true;
                fieldUpdated = true;

                if (!dest.id || dataform.validator.element(dest)) {
                    var val = MCNEXT.Utils.getProperty(dest, destProperty).propValue;
                    if (val !== undefined)
                        val = converter.fromInput(val);

                    MCNEXT.Utils.writeProperty(source, sourceProperty, val);
                }
            }

            dest.onchange = updateObjectFromInput;
            if (dest.id) {
                dest.onblur = function () {
                    if (fieldUpdated)
                        dataform.validator.element(dest);
                }
            }

            if (!dest.winControl) {
                dest.classList.add('win-disposable');
                dest.winControl = {
                    dispose: function () {
                        dest.onchange = null;
                        dest.onblur = null;
                        //dest.removeEventListener('change', updateObjectFromInput);
                    }
                }
            }

            var bindingDesc = {
            };

            bindingDesc[sourceProperty] = updateInputFromObject;
            return WinJS.Binding.bind(source, bindingDesc);
        })
    });
})();