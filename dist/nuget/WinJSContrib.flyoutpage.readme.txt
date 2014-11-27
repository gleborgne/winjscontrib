WinJSContrib.WindowsPhone.FlyoutPage

This control is for building flyouts that fills the screen entirely (or mostly). It's a common UI pattern on smartphones for building search boxes, or displaying custom menus (like the menus in the Facebook app).

To use it, declare both javascript and css
<link href="css/winjscontrib/winjscontrib.ui.flyoutpage.css" rel="stylesheet" />
<link href="css/winjscontrib/winjscontrib.ui.css" rel="stylesheet" />
<script src="/scripts/winjscontrib/winjscontrib.ui.flyoutpage.js"></script>
<script src="/scripts/winjscontrib/winjscontrib.ui.animation.js"></script>

Then add a control to your page
<div id="mainMenu" data-win-control="WinJSContrib.UI.WindowsPhone.FlyoutPage" data-win-options="{ placement: 'right'}">
	<h2>menu item 1</h2>
	<h2>menu item 2</h2>
	<h2>menu item 3</h2>
</div>

The placement options allows you to define if the menu take full width, or if it looks like docked to the right or left.
The flyout is dismissed by clicking on the backbutton on the phone.

In options, you could also specify a uri. In that case, the content of the flyout will be loaded from a fragment (with WinJS.UI.HtmlControl).

If you need more details, or need some help, look at the sample or start a new discussion at :
https://github.com/gleborgne/winjscontrib