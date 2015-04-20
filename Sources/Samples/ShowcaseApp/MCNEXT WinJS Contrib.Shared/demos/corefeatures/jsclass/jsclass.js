(function () {
	"use strict";

	//Base class
	function PageBase(element, options) {
		this.name = 'my base page'
	}

	PageBase.prototype.sayHello = function () {
		WinJSContrib.Alerts.message('hello', 'hello ' + this.name + ' (from parent)');
	}

	PageBase.prototype.sayHelloOnBase = function () {
		WinJSContrib.Alerts.message('hello', 'hello ' + this.name + ' (from parent)');
	}


	function MyPage(element, options) {
		this.name = 'my page'
	}
	MyPage.prototype = new PageBase();

	MyPage.prototype.sayHello = function () {
		WinJSContrib.Alerts.message('hello override', 'hello ' + this.name);
	}

	MyPage.prototype.sayOtherHello = function () {
		WinJSContrib.Alerts.message('other hello', 'hello ' + this.name);
	}

	MyPage.prototype.init = function (element, options) {
	    console.log('page from class init')
	}

	MyPage.prototype.ready = function (element, options) {
	    console.log('page from class is ready')
	}


	WinJS.UI.Pages.define("./demos/corefeatures/jsclass/jsclass.html", MyPage);
})();
