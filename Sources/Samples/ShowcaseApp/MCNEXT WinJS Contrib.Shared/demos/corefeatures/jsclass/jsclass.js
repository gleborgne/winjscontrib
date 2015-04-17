(function () {
	"use strict";

	//Base class
	function PageBase(element, options) {
	}

	PageBase.prototype.sayHello = function () {
		WinJSContrib.Alerts.message('hello', 'hello ' + this.name);
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


	WinJS.UI.Pages.define("./demos/corefeatures/jsclass/jsclass.html", MyPage);
})();
