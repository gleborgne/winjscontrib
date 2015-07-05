//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

/* Instructions :
 * Ce contrôle affiche un simple input[type='text'] qui lorsque l'on clique dessus affiche un flyout avec à l'intérieur un widget mobiscroll.
 * Un bouton "supprimer" s'affiche à droite de l'input pour permettre la suppression de la valeur.
 * Le widget mobiscroll étant en mode "display: inline", le bouton "OK" est recréé manuellement.
 * currentDate accepte un string au format ISO-8601 ou une date, et retourne une date. */

/* Plugins nécessaires :
 * - jQuery
 * - Mobiscroll >= 2.8.3
 *   http://mobiscroll.com/
 * - Font Awesome (pour l'icône de suppression, sinon vous devrez le redéfinir avec SEGOE UI)
 *   http://fontawesome.io/ */

/* HTML :
 * <div data-win-control="MCNEXT.UI.DateTimeScroller"
 *      data-win-bind="winControl.currentDate: PropertyToBind"
 *      data-win-options="{ mobiscroll: { lang: 'fr' } }"></div> */

/* CSS :
.ui-date-time-scroller {
    .ui-date-time-input {
        margin-right: 10px;
    }

    .ui-date-time-reset {
        color: white;
        background-color: red;
        border-radius: 10px;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        text-align: center;
        min-width: 0;

        span.icon {
            font-size: 30pt;
            margin: 5px;
        }
    }
} */

(function () {
    "use strict";

    function createInputElement(ctrl) {
        var input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("readonly", "readonly");
        input.classList.add("ui-date-time-input");
        ctrl._input = input;

        return input;
    }

    function createResetElement() {
        var reset = document.createElement("button");
        reset.classList.add("ui-date-time-reset");

        var icon = document.createElement("span");
        icon.classList.add("icon");
        icon.classList.add("icon-remove");
        reset.appendChild(icon);

        return reset;
    }

    function createFlyoutControl(ctrl, options) {
        var flyout = new WinJS.UI.Flyout(null, {});

        var divScroll = document.createElement("div"),
            $divScroll = $(divScroll);
        flyout.element.appendChild(divScroll);
        $divScroll.mobiscroll().date({ "lang": options.lang, "display": "inline" });
        ctrl.mobiscroll = $divScroll.mobiscroll("getInst");

        // En mode "inline" il faut créer le bouton soi-même
        var buttonOk = document.createElement("button");
        buttonOk.setAttribute("type", "button");
        buttonOk.classList.add("ui-date-time-ok");
        buttonOk.innerText = ctrl.mobiscroll.settings.setText;
        flyout.element.appendChild(buttonOk);

        buttonOk.addEventListener("click", function (e) {
            ctrl._input.value = ctrl.mobiscroll.val;
            ctrl._currentDate = ctrl.mobiscroll.getDate();
            flyout.hide();
            ctrl._change();
        });

        return flyout;
    }

    WinJS.Namespace.define("MCNEXT.UI", {
        DateTimeScroller: WinJS.Class.define(
            function (element, options) {
                var ctrl = this;
                this.element = element || document.createElement("div");
                this.element.classList.add("ui-date-time-scroller");
                this.element.classList.add("win-disposable");
                this.element.winControl = this;

                this.options = options || {};
                this.options.defaultDate = options.defaultDate || new Date();
                this.options.mobiscroll = options.mobiscroll || {};
                WinJS.UI.setOptions(this, options);

                var inputElement = createInputElement(ctrl);
                this.element.appendChild(inputElement);

                var resetElement = createResetElement();
                this.element.appendChild(resetElement);

                var flyout = createFlyoutControl(ctrl, ctrl.options.mobiscroll);
                flyout.anchor = inputElement;
                this.element.appendChild(flyout.element);

                inputElement.addEventListener("click", function (e) {
                    flyout.show();
                });

                resetElement.addEventListener("click", function (e) {
                    flyout.hide();
                    inputElement.value = "";
                });
            },
            {
                _currentDate: null,

                _change: function () {
                    var ctrl = this;
                    var event = document.createEvent("CustomEvent");
                    event.initCustomEvent("change", true, true, null);
                    ctrl.element.dispatchEvent(event);
                },

                currentDate: {
                    get: function () {
                        var ctrl = this;
                        return ctrl._currentDate;
                    },
                    set: function (date) {
                        var ctrl = this;
                        if (date) {
                            // Date peut être un string au format ISO-8601
                            if (typeof date === "string") {
                                date = new Date(date);
                            }

                            ctrl._currentDate = date;
                            ctrl.mobiscroll.setDate(date, true, null);
                            ctrl._input.value = ctrl.mobiscroll.val;
                        } else {
                            ctrl._currentDate = null;
                            ctrl.mobiscroll.setDate(ctrl.options.defaultDate, true, null);
                            ctrl._input.value = "";
                        }
                    }
                }
            }
        )
    });

    WinJS.Class.mix(MCNEXT.UI.DateTimeScroller, WinJS.Utilities.createEventProperties("change"));
    WinJS.Class.mix(MCNEXT.UI.DateTimeScroller, WinJS.UI.DOMEventMixin);
})();