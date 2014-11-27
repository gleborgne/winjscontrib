WinJSContrib.Navigator

To use this control, reference the javascript file in your default.html
<script src="/scripts/winjscontrib/winjscontrib.ui.navigator.js"></script>

Then replace the navigator control by this one :
<div id="contenthost" data-win-control="WinJSContrib.UI.PageControlNavigator" data-win-options="{global:true, home: '/pages/home/home.html'}"></div>

This custom navigator add new feature on your pages, the most significant are :

- a eventTracker property to help manage addEventListener's callback (and release them automatically). To use it, simply call :
		var btn = document.getElementById('myButton');
		myPage.eventTracker.addEvent(btn, 'click', function(){
			//do something
		});

- page actions (binding interactive elements to page function) by adding data-page-action attributes
for example, if you have :
<div data-page-action="sayHello"></div>
clicking on the div will call the function "sayHello" on the page

- a promises array property, intended to gather promises in your page. The promises in this array will be canceled when user leave the page

- new events called during the lifetime of your page. Those events can be propagated to custom controls, please look at the samples to get detailed information about those events.


If you need more, or need some help, look at the samples or start a new discussion at :
https://github.com/gleborgne/winjscontrib