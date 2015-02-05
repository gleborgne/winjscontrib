/* 
 * WinJS Contrib v2.0.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

//this is a blank WinJS control structure. It's intended to use as a startup for new controls

(function () {
	'use strict';
	WinJS.Namespace.define("WinJSContrib.UI", {	
		MyBrandNewControl : WinJS.Class.mix(WinJS.Class.define(function ctor(element, options){
			this.element = element || document.createElement('DIV');
			options = options || {};
			this.element.winControl = this;
			this.element.classList.add('win-disposable');
			WinJS.UI.setOptions(this, options);
		},{
			someProperty: {
				get: function(){
					return this._someProperty;
				},
				set: function(val){
					this._someProperty = val;
				}
			},
			dispose : function(){
			    WinJS.Utilities.disposeSubTree(this.element);
			    this.element = null;
			}
		}),
		WinJS.Utilities.eventMixin,
		WinJS.Utilities.createEventProperties("myevent"))
	});
})();