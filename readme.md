WinJS Contrib is salt and pepper to get your WinJS applications more tasty.
It provides some utilities, helpers and controls to make your developers life happyer (or at least that's what we try to do).

Have a look at [API documentation](http://gleborgne.github.io/winjscontrib/api/) to see a glimpse of what is available.

We also rolled a series of blog post explaining what you can do with WinJS Contrib.

[WinJS Contrib Basics](http://mcnextpost.com/2015/04/21/winjs-contrib-basics/)

[WinJS and ES6](http://mcnextpost.com/2015/04/23/winjs-and-es6/)

[WinJS controls as webcomponents](http://mcnextpost.com/2015/04/26/using-winjs-controls-as-webcomponents/)

[Registering your controls as webcomponents](http://mcnextpost.com/2015/04/27/registering-your-winjs-webcomponents/)

## What is WinJS ?
It is a single page application (SPA) framework. The goal of WinJS is to provide the basis for HTML5 applications with almost native performances. It was originally designed by Microsoft for making Windows applications in HTML5 (for Windows, Windows Phone and Xbox One app stores).
Now WinJS is open source. it can still be used for Windows apps, but also in cross platform hybrid apps. All details are available on [WinJS website](http://www.buildwinjs.com), and you can experiment with it in their [playground](http://try.buildwinjs.com).

## So why a contrib project ?
At [MCNEXT](http://www.mcnext.com), we have made several Windows Application using WinJS. While the framework is great to achieve high performance applications, it lacks some feature to ease the development story. From project to project we built some of those features and wanted to share it with you.

The goal of the library is to help enhance UI and performance of your WinJS applications on all platforms. The helpers provides realworld mecanism missing from WinJS like two way binding, a mecanism for using arguments in custom bindings, referencing functions from your markup and/or controls, a couple powerfull navigation controls and much much more.

Instead of one big library, WinJSContrib is a set of small NuGet packages (and probably very soon Bower packages), each containing a specific feature or control. You could [check the list in NuGet](http://www.nuget.org/packages?q=winjscontrib)

## how to get started ?
If you haven't yet, have a look at [WinJS website](http://www.buildwinjs.com).

Then it is very easy. Go to NuGet package manager and add the core package :
``` 
install-package WinJSContrib.Core
```

## What can I do with WinJS Contrib ?

The library contains the following elements :

### CONTROLS
+ a replacement for the default "navigator.js" provided in WinJS project templates 
+ a boilerplate custom control 
+ a control for managing listview layout in your markup 
+ extended splash screen control 
+ progress indicator control 
+ semantic zoom wrapper control 
+ hub control with multipass rendering 
+ grid control with multipass rendering 
+ tab control 
+ childviewflyout control 
+ a control for wrapping listviews with grouping and semantic zoom 
+ a control for flyout page in Windows Phone 8.1 

### BINDINGS
+ parameterized bindings 
+ show / hide 
+ enable / disable 
+ Images and background-images 
+ date formatting 
+ two way binding 

### HELPERS
+ a set of utility methods 
+ EventTracker (manage event listeners release) 
+ a search engine (full javascript !), with multi-threaded search and indexing 
+ wrapper for background tasks 
+ wrapper for contact API 
+ wrapper for multi-views 

## Wanna deep dive ?
We are still shaping libraries, samples and documentation. The github project is made of samles for the various platforms, it is a nice way to start looking at features. The sample applications are available in Windows Store, and Windows Phone Store.

It's still under construction but a look at [API Documentation](http://gleborgne.github.io/winjscontrib/api/index.html) might help.

## Anything wrong ?
We are happy to get feedback, If you find something unclear, or have questions, feel free to get in touch.


## License 
The MIT License (MIT)
[OSI Approved License]

The MIT License (MIT)

Copyright (c) 2015 MCNEXT

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
