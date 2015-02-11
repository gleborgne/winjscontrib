/*******************************************************************************
* Author: Richard Brundritt
* Website: http://rbrundritt.wordpress.com
* Date: May 21nd, 2011
* 
* Description: 
* This JavaScript file is meant to create a infobox control that is highly 
* customizable, reusable, and easy to extend. This method takes in a map 
* reference, and a set of options. 
* 
* Example Usage:
*
* var map, customInfobox;
*
* function GetMap()
* {
*	var map = new Microsoft.Maps.Map(document.getElementById("myMap"),{ credentials: "YOUR_BING_MAPS_KEY" });
*	
*	Microsoft.Maps.registerModule("CustomInfoboxModule", "scripts/V7CustomInfobox.min.js");
*	    Microsoft.Maps.loadModule("CustomInfoboxModule", { callback: function () {
*	        customInfobox = new CustomInfobox(map);
*	    }
*	});
* }
*
* //Have data be returned from data source and added to the cluster layer
* function ClusterLayer(results)
* {
* 	clusteredLayer.SetData(results);
* }
*
* function displayInfobox() {
*	customInfobox.show(map.getCenter(), "Hello World");
*}
********************************************************************************/

var CustomInfobox = function (map, options) {
    var _map = map,
    _content,
    _anchor,
    _infoboxContainerId,
    _handlerId;

    var _options = {
        arrowColor: '#fff',     //Color of the arrow
        arrowLength: 20,        //Length of the arrow
        arrowWidth: 30,         //Width of the arrow
        borderColor: '#000',    //Color of the infobox border
        color: '#fff',          //Background color of infobox
        minHeight: 50,          //Minium height of the content area of the infobox
        minWidth: 100,          //Minimium width of the content area of the infobox
        offset: { x: 0, y: 0 }, //Offset distance of the infobox
        orientation: 0,         //Orientation of the infobox: 0 - horizontal, 1 - vertical
        showArrow: true,
        showCloseButton: true,
        tether: false
    };

    /*********************** Private Methods ****************************/

    //Inialization method
    function _init() {
        //Create an id for the infobox
        _infoboxContainerId = map.getRootElement().parentNode.id + "_infobox";

        //Create infobox container
        $('body').append("<div id='" + _infoboxContainerId + "' style='position:absolute;z-index:10000;display:none;'></div>");

        //initialize default tethering 
        _enableTethering(_options.tether);

        //Set user options
        _setOptions(options);
    }

    //Method for generating the infobox arrow
    function _createArrow(direction) {
        var html = ["<div id='", _infoboxContainerId, "_arrow' style='position:relative;float:left;width:0;height:0;line-height:0;border-style:solid;"];
        var w = _options.arrowWidth * 0.5;
        switch (direction) {
            case 0: 	//Point up
                html.push("border-width:0 ", w, "px ", _options.arrowLength, "px ", w, "px;");
                html.push("border-color:transparent transparent ", _options.arrowColor, " transparent;");
                break;
            case 1: 	//Point Right
                html.push("border-width:", w, "px 0 ", w, "px ", _options.arrowLength, "px;");
                html.push("border-color:transparent transparent transparent ", _options.arrowColor, ";");
                break;
            case 2: 	//Point Down
                html.push("border-width:", _options.arrowLength, "px ", w, "px 0 ", w, "px;");
                html.push("border-color:", _options.arrowColor, " transparent transparent transparent;");
                break;
            case 3: 	//Point Left
                html.push("border-width:", w, "px ", _options.arrowLength, "px ", w, "px 0;");
                html.push("border-color:transparent ", _options.arrowColor, " transparent transparent;");
                break;
        }

        html.push("'></div>");

        return html.join('');
    }

    //method that controls is the 
    function _enableTethering(tether) {
        if (_handlerId != null) {   //Remove existing event handler
            Microsoft.Maps.Events.removeHandler(_handlerId);
        }

        if (tether) {   //update infobox when map is moving
            _handlerId = Microsoft.Maps.Events.addThrottledHandler(_map, 'viewchange', _render, 40);
        } else {        //hide infobox when map is moved
            _handlerId = Microsoft.Maps.Events.addHandler(_map, 'viewchangestart', _hide);
        }
    }

    //Hides the infobox from view
    function _hide() {
        //clear content and anchor information
        _anchor = null;
        _content = null;

        //Rerender infobox causes it to hide when there are no content or anchor
        _render();
    }

    //Generates the infobox UI
    function _render() {
        var container = $('#' + _infoboxContainerId);

        if (container != null && _anchor != null && _content != null) {
            if (!_map.getBounds().contains(_anchor)) {  //hide if anchor is anchor latlong on the map
                container.css('display', 'none');
            } else {
                container.css('display', '');
                var pinPixel = _map.tryLocationToPixel(_anchor, Microsoft.Maps.PixelReference.control),
                screenX = _map.getPageX() + pinPixel.x,
                screenY = _map.getPageY() + pinPixel.y;

                var key = (_map.getHeight() * 0.5 < pinPixel.y) ? 2 : 0; //Determine the quadrant that the pushpin is in. 
                key += (_map.getWidth() * 0.5 < pinPixel.x) ? 1 : 0;

                //Wrap contents
                var contents = ["<div id='", _infoboxContainerId, "_content' style='position:relative;float:left;border:1px solid ", _options.borderColor, ";background-color:", _options.color, ";min-width:", _options.minWidth, "px;min-height:", _options.minHeight, "px;'>", _content, "</div>"];

                var arrowX = 0, arrowY = 0, html;

                if (_options.showArrow) {
                    if (_options.orientation) { //vertical arrow
                        arrowX = _options.arrowWidth;
                        arrowY = _options.arrowLength;

                        if (key > 1) {  //down
                            html = contents.join('') + _createArrow(2);
                        } else {        //up
                            html = _createArrow(0) + contents.join('');
                        }
                    } else {
                        arrowX = _options.arrowLength;
                        arrowY = _options.arrowWidth;

                        if (key % 2) {  //right arrow
                            html = contents.join('') + _createArrow(1);
                        } else {        //left
                            html = _createArrow(3) + contents.join('');
                        }
                    }
                } else {
                    html = contents.join('');
                }

                container.html(html);

                //Get Width and Height of Contents
                var contentContainer = $('#' + _infoboxContainerId + '_content');

                //Add close button if enabled
                if (_options.showCloseButton) {
                    contentContainer.append("<span id='" + _infoboxContainerId + "_closeBtn' href='javascript:void()' style='position:absolute;right:5px;top:2px;cursor:pointer;font:bold 18px Arial;line-height:12px;'>x</span>");
                    $('#' + _infoboxContainerId + '_closeBtn').click(function () {
                        _hide();
                    });
                }

                //Get dimensions of contents
                var contentX = contentContainer.outerWidth(),
                    contentY = contentContainer.outerHeight();

                var w = 0, h = 0, arrowOffsetTop = 0, arrowOffsetLeft = 0;

                //Calculate dimensions of infobox container
                if (_options.orientation) {
                    w = contentX;
                    h = contentY + arrowY;

                    if (key % 2) {  //content left
                        arrowOffsetLeft = w - _options.arrowWidth;
                        screenX += _options.offset.x - w + _options.arrowWidth * 0.5;
                    } else {
                        screenX += _options.offset.x - _options.arrowWidth * 0.5;
                    }

                    if (key > 1) {  //bottom
                        screenY -= h + _options.offset.y;
                    } else {
                        screenY -= _options.offset.y;
                    }
                } else {
                    w = arrowX + contentX;
                    h = Math.max(contentY, arrowY);

                    if (key % 2) {  //right arrow
                        screenX += _options.offset.x - w;
                    } else {        //left
                        screenX += _options.offset.x;
                    }

                    if (key > 1) {
                        arrowOffsetTop = h - _options.arrowWidth;
                        screenY -= h - _options.arrowWidth * 0.5 + _options.offset.y;
                    } else {
                        screenY -= (_options.arrowWidth * 0.5 + _options.offset.y);
                    }
                }

                if (_options.showArrow) {
                    var arrow = $('#' + _infoboxContainerId + '_arrow');
                    arrow.css({ 'margin-left': Math.ceil(arrowOffsetLeft) + 'px', 'margin-top': Math.ceil(arrowOffsetTop) + 'px' });
                }

                container.css({ 'width': Math.ceil(w) + 'px', 'height': Math.ceil(h) + 'px', 'top': screenY, 'left': screenX });
            }
        } else if (container != null) {    //hide infobox
            container.html('');
            container.css('display', 'none');
        }
    }

    //Updates the default options with new options
    function _setOptions(options) {
        var tetherVal = _options.tether;

        for (attrname in options) {
            _options[attrname] = options[attrname];
        }

        if (tetherVal != _options.tether) {
            _enableTethering(_options.tether);
        }

        _render();
    }

    /*********************** Public Methods ****************************/

    //Hide the infobox
    this.hide = function () {
        _hide();
    };

    //show infobox
    this.show = function (latlong, content) {
        _anchor = latlong;
        _content = content;
        _render();
    };

    /**
    * @returns The custom infobox options.
    */
    this.getOptions = function () {
        return _options;
    };

    /**
    * Sets the custom infobox options.
    * Example: customInfobox.SetOptions({ gridSize : 30});
    */
    this.setOptions = function (options) {
        _setOptions(options);
    };

    _init();
};

//Call the Module Loaded method
Microsoft.Maps.moduleLoaded('CustomInfoboxModule');