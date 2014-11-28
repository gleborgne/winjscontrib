//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com



//this is a boilerplate structure for observable objects. It's intended to use as a startup for building your own objects

(function () {
    'use strict';
    WinJS.Namespace.define("WinJSContrib.UI", {
        MyObservableObject: WinJS.Class.mix(WinJS.Class.define(function ctor(element, options) {
            this._initObservable();
            this.isActive = false;
            this.myObservableProperty = '';
        }, {

        }),
		WinJS.Binding.mixin,        
		WinJS.Binding.expandProperties({ isActive: false, myObservableProperty: '' }))
    });
})();