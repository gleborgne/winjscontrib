WinJSContrib.Childviewflyout

To use this control, reference the javascript and css in your page or in default.html:

<script src="/scripts/winjscontrib/winjscontrib.ui.navigator.js"></script>
<script src="/scripts/winjscontrib/winjscontrib.ui.childviewflyout.js"></script>
<link href="/css/winjscontrib/winjscontrib.ui.childviewflyout.css" rel="stylesheet" />

Then declare the control where you want to use it :
<div id="childview" data-win-control="WinJSContrib.UI.ChildViewFlyout"></div>

Now, you just have to set its content :
var childview = element.querySelector('#childview').winControl;
childview.open('/pages/childviewflyout/page1/page1.html');

This childview is a subnavigation system, with its own history. 
Within a page, you could call it like this :
var nav = WinJSContrib.UI.parentChildView(this.element);
nav.navigate('/pages/childviewflyout/page2/page2.html')


If you need more, or need some help, look at the samples or start a new discussion at :
https://github.com/gleborgne/winjscontrib