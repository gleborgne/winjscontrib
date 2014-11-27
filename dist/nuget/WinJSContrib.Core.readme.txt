WinJSContrib.Core

This package contains the core part of WinJSContrib. Some features relies on jquery so you must add a script tag to reference jquery.

Here are some details about the different parts :


<script src="/scripts/winjscontrib/winjscontrib.core.js"></script>
This file contains the roots of WinJSContrib such as binding expression parser, function resolution by name, template resolution used by other parts of WinJSContrib, image loading promises, etc...    

<script src="/scripts/winjscontrib/winjscontrib.ui.jquery.js"></script>
Utility functions wrapped as jquery plugins


<script src="/scripts/winjscontrib/winjscontrib.bindings.js"></script>
This file contains custom bindings, for example, you have bindings for showing/hiding/disabling elements, managing images, two way binding, etc


<link href="/css/winjscontrib/winjscontrib.ui.css" rel="stylesheet" />
some helper css classes and keyframe animations required by the animation library


<script src="/scripts/winjscontrib/winjscontrib.ui.animation.js"></script>
Parameterized and custom animations


The core package also contains two files intended to serve as starting point for your own javascript objects :
winjscontrib.ui.boilerplate.control.js
winjscontrib.ui.boilerplate.observable.js



If you need more, or need some help, look at the sample or start a new discussion at :
https://github.com/gleborgne/winjscontrib