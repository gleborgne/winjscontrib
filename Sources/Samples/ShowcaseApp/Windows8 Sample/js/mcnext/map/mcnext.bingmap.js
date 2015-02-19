//you may use this code freely as long as you keep the copyright notice and don't 
// alter the file name and the namespaces
//This code is provided as is and we could not be responsible for what you are making with it
//project is available at http://winjscontrib.codeplex.com

/// <reference path="/Bing.Maps.JavaScript/js/veapiModules.js" />
/// <reference path="/Bing.Maps.JavaScript/js/veapicore.js" />

(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var nav = WinJS.Navigation;

    WinJS.Namespace.define("MCNEXT.UI", {
        BingMapCtrl: WinJS.Class.define(
            function BingMapCtrl(element, options) {
                this.element = element || document.createElement("div");
                this.element.style.position = 'relative';

                this.mapContainer = document.createElement('div');
                this.mapContainer.style.width = '100%';
                this.mapContainer.style.height = '100%';
                this.element.appendChild(this.mapContainer);
                this.BingKey = options.key;
                element.winControl = this;
            },
            {
                initMap: function (latitude, longitude) {
                    var ctrl = this;
                    return new WinJS.Promise(function (complete) {
                        Microsoft.Maps.loadModule('Microsoft.Maps.Map', {
                            callback: function () {
                                var options =
                                    {
                                        credentials: ctrl.BingKey,
                                        mapTypeId: Microsoft.Maps.MapTypeId.road,
                                        zoom: 10
                                    };

                                if (latitude && longitude) {
                                    options.center = new Microsoft.Maps.Location(latitude, longitude);
                                }

                                ctrl.map = new Microsoft.Maps.Map(ctrl.mapContainer, options);
                                ctrl.dataLayer = new Microsoft.Maps.EntityCollection();
                                ctrl.map.entities.push(ctrl.dataLayer);

                                complete(ctrl.map);
                            }
                        });
                    });
                },
                dispose: function () {
                    if (this.customInfobox) {
                        this.customInfobox.hide();
                    }
                    this.map.dispose();
                },
                initClustering: function (singlePinCallback, clusteredPinCallback /* function (eq, latlong) */) { //callbacks should return pin
                    var ctrl = this;
                    ctrl.clusteredData = new ClusteredEntityCollection(ctrl.map, {
                        "singlePinCallback": singlePinCallback,
                        "clusteredPinCallback": clusteredPinCallback
                    });
                },
                customInfoBox: function () {
                    this.customInfobox = new CustomInfobox(this.map, { "showArrow": false, showCloseButton: false, color: 'transparent', borderColor: 'none' });
                },
                addPin: function (latitude, longitude, pinOptions) { //{ icon: '/images/maplocation.png', width: 30, height: 33 }
                    var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(latitude, longitude), pinOptions);
                    this.dataLayer.push(pushpin);
                },
                changeMapOptionsFrom: function (computation) {
                    var options = this.map.getOptions();
                    options = computation(options);
                    this.map.setView(options);
                },
                zoomOn: function (latitude, longitude, zoom) {
                    var ctrl = this;
                    ctrl.changeMapOptionsFrom(function (options) {
                        options.center = new Microsoft.Maps.Location(latitude, longitude);
                        var currentZoom = ctrl.map.getZoom();
                        if (zoom) {
                            options.zoom = zoom;
                            return options;
                        }

                        if (currentZoom < 18)
                            options.zoom = 18;

                        return options;
                    });
                },
                setBounds: function (minLat, minLong, maxLat, maxLong) {
                    var focusOnPins = Microsoft.Maps.LocationRect.fromEdges(minLat, minLong, maxLat, maxLong);
                    ctrl.map.setView({ "bounds": focusOnPins });
                },
                getCurrentPosition: function () {
                    var geolocator = new Windows.Devices.Geolocation.Geolocator();
                    return geolocator.getGeopositionAsync();
                },
                getLastPosition: function () {
                    var ctrl = this;
                    if (ctrl.lastposition)
                        return WinJS.Promise.wrap(ctrl.lastposition);

                    return ctrl.getCurrentPosition().then(function (pos) {
                        ctrl.lastposition = pos;
                        return WinJS.Promise.wrap(ctrl.lastposition);
                    });
                },
                geocoding: function (address) {
                    var ctrl = this;
                    return new WinJS.Promise(function (complete, error) {
                        $.ajax({
                            url: 'http://dev.virtualearth.net/REST/v1/Locations?q=' + encodeURIComponent(address) + '&key=' + ctrl.BingKey,
                            dataType: 'json'
                        }).then(function (data) {
                            var res = [];
                            if (data.resourceSets && data.resourceSets.length && data.resourceSets[0] && data.resourceSets[0].resources && data.resourceSets[0].resources.length) {
                                data.resourceSets[0].resources.forEach(function (e) {
                                    if (e.geocodePoints && e.geocodePoints.length && e.geocodePoints[0].coordinates) {
                                        res.push({ address: address, name: e.address.formattedAddress, latitude: e.geocodePoints[0].coordinates[0], longitude: e.geocodePoints[0].coordinates[1] });
                                    }
                                });
                            }
                            complete(res);
                        }, function (err) {
                            error(err);
                        });
                    });
                },
                reverseGeocoding: function (latitude, longitude) {
                    var ctrl = this;
                    return new WinJS.Promise(function (complete, error) {
                        $.ajax({
                            url: 'http://dev.virtualearth.net/REST/v1/Locations/' + latitude + ',' + longitude + '?key=' + ctrl.BingKey,
                            dataType: 'json'
                        }).then(function (data) {
                            var res = [];
                            if (data.resourceSets && data.resourceSets.length && data.resourceSets[0] && data.resourceSets[0].resources && data.resourceSets[0].resources.length) {
                                res.push({ address: data.resourceSets[0].resources[0].address.formattedAddress, latitude: lat, longitude: long });
                            }
                            complete(res);
                        }, function (err) {
                            error(err);
                        });
                    });
                },
                getRoute: function (points, walking) {
                    var ctrl = this;
                    return new WinJS.Promise(function (complete, error) {
                        var res = [];
                        var rootUrl = 'http://dev.virtualearth.net/REST/v1/Routes';
                        if (walking)
                            rootUrl = rootUrl + '/Walking';
                        var url = rootUrl + '?routePathOutput=Points'
                                //'&wp.1=' + start.Latitude + ',' + start.Longitude +
                                //'&wp.2=' + end.Latitude + ',' + end.Longitude +
                               + '&key=' + ctrl.BingKey + "&c=fr";

                        points.forEach(function (pt, index) {
                            if (pt.latitude && pt.longitude) {
                                url = url + '&wp.' + index + '=' + pt.latitude + ',' + pt.longitude
                            }
                            else if (pt.Latitude && pt.Longitude) {
                                url = url + '&wp.' + index + '=' + pt.Latitude + ',' + pt.Longitude
                            }
                        });

                        $.ajax({
                            url: url,
                            dataType: 'json'
                        }).then(function (data) {
                            if (data.resourceSets && data.resourceSets.length && data.resourceSets[0] && data.resourceSets[0].resources && data.resourceSets[0].resources.length) {
                                data.resourceSets[0].resources.forEach(function (e) {
                                    res.push(e);
                                });
                            }
                            complete(res);
                        }, function (err) {
                            error(err);
                        });
                    });
                },
                showRoute: function (points, walking) {
                    var ctrl = this;
                    return new WinJS.Promise(function (complete, error) {
                        ctrl.getRoute(points, walking).done(function (routes) {
                            if (routes && routes.length) {
                                var route = routes[0];
                                var bbox = route.bbox;
                                var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
                                ctrl.map.setView({ bounds: viewBoundaries });

                                if (route.routePath && route.routePath.line) {
                                    var routeline = route.routePath.line;
                                    var routepoints = new Array();

                                    for (var i = 0; i < routeline.coordinates.length; i++) {
                                        var pt = routeline.coordinates[i];
                                        routepoints[i] = new Microsoft.Maps.Location(pt[0], pt[1]);
                                    }

                                    if (ctrl.routeshape) {
                                        ctrl.map.entities.remove(ctrl.routeshape);
                                        ctrl.routeshape = undefined;
                                    }
                                    if (ctrl.routeshape1) {
                                        ctrl.map.entities.remove(ctrl.routeshape1);
                                        ctrl.routeshape1 = undefined;
                                    }
                                    if (ctrl.routeshape2) {
                                        ctrl.map.entities.remove(ctrl.routeshape2);
                                        ctrl.routeshape2 = undefined;
                                    }
                                    // Draw the routes on the map                                    
                                    ctrl.routeshape = new Microsoft.Maps.Polyline(routepoints, { strokeThickness: 12, strokeColor: new Microsoft.Maps.Color(150, 200, 0, 0) });
                                    ctrl.map.entities.push(ctrl.routeshape);
                                }
                            }
                            complete(routes);
                        }, function (err) {
                            error(err);
                        });
                    });
                },
                showSelectedRoute: function (routes, walking, idx) {
                    var ctrl = this;
                    return new WinJS.Promise(function (complete, error) {
                        //     ctrl.getRoute(points, walking).done(function (routes) {
                        if (routes && routes.length) {
                            var route = routes[0];
                            var bbox = route.bbox;
                            var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
                            ctrl.map.setView({ bounds: viewBoundaries });

                            if (route.routePath && route.routePath.line) {
                                var routeline = route.routePath.line;
                                var routepoints = new Array();

                                for (var i = 0; i <= idx.start; i++) {  //routeline.coordinates.length; i++) {
                                    var pt = routeline.coordinates[i];
                                    routepoints.push(new Microsoft.Maps.Location(pt[0], pt[1]));
                                }

                                if (ctrl.routeshape) {
                                    ctrl.map.entities.remove(ctrl.routeshape);
                                    ctrl.routeshape = undefined;
                                }

                                // Draw the routes on the map                                    
                                ctrl.routeshape = new Microsoft.Maps.Polyline(routepoints, { strokeThickness: 12, strokeColor: new Microsoft.Maps.Color(100, 200, 0, 0) });
                                ctrl.map.entities.push(ctrl.routeshape);
                                var routepoints = new Array();
                                for (var i = idx.start; i <= idx.end; i++) {  //routeline.coordinates.length; i++) {
                                    var pt = routeline.coordinates[i];
                                    routepoints.push(new Microsoft.Maps.Location(pt[0], pt[1]));
                                }

                                if (ctrl.routeshape1) {
                                    ctrl.map.entities.remove(ctrl.routeshape1);
                                    ctrl.routeshape1 = undefined;
                                }

                                // Draw the routes on the map                                    
                                ctrl.routeshape1 = new Microsoft.Maps.Polyline(routepoints, { strokeThickness: 12, strokeColor: new Microsoft.Maps.Color(200, 200, 0, 0) });
                                ctrl.map.entities.push(ctrl.routeshape1);
                                var routepoints = new Array();

                                for (var i = idx.end; i < routeline.coordinates.length; i++) {  //routeline.coordinates.length; i++) {
                                    var pt = routeline.coordinates[i];
                                    routepoints.push(new Microsoft.Maps.Location(pt[0], pt[1]));
                                }

                                if (ctrl.routeshape2) {
                                    ctrl.map.entities.remove(ctrl.routeshape2);
                                    ctrl.routeshape2 = undefined;
                                }

                                // Draw the routes on the map                                    
                                ctrl.routeshape2 = new Microsoft.Maps.Polyline(routepoints, { strokeThickness: 12, strokeColor: new Microsoft.Maps.Color(100, 200, 0, 0) });
                                ctrl.map.entities.push(ctrl.routeshape2);
                            }
                        }
                        //}
                        complete(routes);
                        //}, function (err) {
                        //    error(err);
                        //});
                    });
                }

            })
    });
})();
