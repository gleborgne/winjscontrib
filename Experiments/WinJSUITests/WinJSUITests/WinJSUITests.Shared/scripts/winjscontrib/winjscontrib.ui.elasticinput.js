/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

(function () {
	'use strict';
	WinJS.Namespace.define("WinJSContrib.UI", {
		ElasticInput: WinJS.Class.define(
			 /**
             * @class WinJSContrib.UI.ElasticInput
             * @classdesc
             * This control provide an elastic input.
             * @param {HTMLElement} element DOM element containing the control
             * @param {Object} options
			 * @example
			 * <div data-win-control="WinJSContrib.UI.ElasticInput" data-page-member="loginctrl" id="login" data-win-options="{type:'text',label:'login'}"></div>
			 * <div data-win-control="WinJSContrib.UI.ElasticInput" data-page-member="pwdctrl" id="pwd" data-win-options="{type:'password',label:'login.password'}"></div>
             */
            function ElasticInput(element, options) {
            	var ctrl = this;
            	options = options || {};
            	ctrl.element = element || document.createElement('div');
            	ctrl.element.classList.add('input__elasticinput');
            	ctrl.element.classList.add('input');
            	ctrl.element.classList.add('win-disposable');
            	ctrl.input = document.createElement('input');
            	ctrl.input.classList.add("input__field");
            	ctrl.input.classList.add("input__field__elasticinput");
            	ctrl.label = document.createElement('label');
            	ctrl.label.setAttribute('tabindex', '-1');
            	if (options.type) {
            		ctrl.input.type = options.type;
            	}
            	if (options.label) {
            		var r = WinJS.Resources.getString(options.label);
            		ctrl.label.innerHTML = r.value;
            	}
            	ctrl.onfocusBinded = ctrl.onfocus.bind(ctrl);
            	ctrl.label.className = 'input__label__elasticinput';
            	ctrl.svg = document.createElement('div');
            	ctrl.element.appendChild(ctrl.label);
            	if (window.MSApp && window.MSApp.execUnsafeLocalFunction) {
            	    MSApp.execUnsafeLocalFunction(function () {
            	        ctrl.element.innerHTML += '<svg focusable="false" class="graphic graphic__elasticinput" preserveAspectRatio="none" viewBox="0 0 1200 60" height="100%" width="300%" class="graphic graphic__elasticinput"><path d="M1200,9c0,0-305.005,0-401.001,0C733,9,675.327,4.969,598,4.969C514.994,4.969,449.336,9,400.333,9C299.666,9,0,9,0,9v43c0,0,299.666,0,400.333,0c49.002,0,114.66,3.484,197.667,3.484c77.327,0,135-3.484,200.999-3.484C894.995,52,1200,52,1200,52V9z"/></svg>';
            	    });
            	} else {
            	    ctrl.element.innerHTML += '<svg focusable="false" class="graphic graphic__elasticinput" preserveAspectRatio="none" viewBox="0 0 1200 60" height="100%" width="300%" class="graphic graphic__elasticinput"><path d="M1200,9c0,0-305.005,0-401.001,0C733,9,675.327,4.969,598,4.969C514.994,4.969,449.336,9,400.333,9C299.666,9,0,9,0,9v43c0,0,299.666,0,400.333,0c49.002,0,114.66,3.484,197.667,3.484c77.327,0,135-3.484,200.999-3.484C894.995,52,1200,52,1200,52V9z"/></svg>';
            	}
            	ctrl.element.appendChild(ctrl.input);
            	ctrl.input = ctrl.element.querySelector('.input__field');
            	ctrl.input.addEventListener('focus', ctrl.onfocusBinded)
            	ctrl.onblurBinded = ctrl.onblur.bind(ctrl);
            	ctrl.input.addEventListener('blur', ctrl.onblurBinded)
            	ctrl.input.onfocus = function () {

            	}
            }, {
            	onfocus: function () {
            		var ctrl = this;
            		ctrl.input.classList.add('input--filled');
            		ctrl.element.classList.add('forceshow');
            	},
            	onblur: function () {
            		var ctrl = this;
            		var ctrl = this;
            		if (!ctrl.input.value) {
            			ctrl.input.classList.remove('input--filled');
            			ctrl.element.classList.remove('forceshow');
            		}
            	},
            	innerText: {
            		get: function () {
            			return this.input.innerText;
            		},
            		set: function (value) {
            			this.input.innerText = value;
            		}
            	},
            	value: {
            		get: function () {
            			return this.input.value;
            		},
            		set: function (value) {
            			this.input.value = value;
            		}
            	},
            	dispose: function () {
            		var ctrl = this;
            		ctrl.input.removeEventListener('focus', ctrl.onblurBinded)
            		ctrl.input.removeEventListener('focus', ctrl.onfocusBinded)
            	}
            })
	});
})();