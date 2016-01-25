/* 
 * WinJS Contrib v2.1.0.6
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

var WinJSContrib = WinJSContrib || {};
WinJSContrib.UPnP = WinJSContrib.UPnP || {};

(function (global) {

    WinJSContrib.UPnP.deviceTypes = {
        ContentDirectory1: 'urn:schemas-upnp-org:service:ContentDirectory:1',
        ContentDirectory2: 'urn:schemas-upnp-org:service:ContentDirectory:2',
        ContentDirectory3: 'urn:schemas-upnp-org:service:ContentDirectory:3',
        ContentDirectory4: 'urn:schemas-upnp-org:service:ContentDirectory:4',
        MediaRenderer1: 'urn:schemas-upnp-org:device:MediaRenderer:1',
        MediaRenderer2: 'urn:schemas-upnp-org:device:MediaRenderer:2',
        MediaRenderer3: 'urn:schemas-upnp-org:device:MediaRenderer:3',
        MediaRenderer4: 'urn:schemas-upnp-org:device:MediaRenderer:4',
        MediaServer1: 'urn:schemas-upnp-org:device:MediaServer:1',
        MediaServer2: 'urn:schemas-upnp-org:device:MediaServer:2',
        MediaServer3: 'urn:schemas-upnp-org:device:MediaServer:3',
        MediaServer4: 'urn:schemas-upnp-org:device:MediaServer:4',
        AVTransport1:'urn:schemas-upnp-org:service:AVTransport:1',
        AVTransport2: 'urn:schemas-upnp-org:service:AVTransport:2',
        ConnectionManager1: 'urn:schemas-upnp-org:service:ConnectionManager:1',
        ConnectionManager2: 'urn:schemas-upnp-org:service:ConnectionManager:2',
        ConnectionManager3: 'urn:schemas-upnp-org:service:ConnectionManager:3'
    };

    WinJSContrib.UPnP.devicesDiscovery = function devicesDiscovery(filter, callback, timeout) {
        var hostName;
        try {
            hostName = new Windows.Networking.HostName("239.255.255.250");
        } catch (ex) {
            error({ message: "Invalid host name." });
            return;
        }

        var devices = new WinJS.Binding.List();

        var discovery = {
            devices: devices,
            hasError: null,
            promise: null,
        };

        function exists(url) {
            var matches = devices.filter(function (d) {
                return (url == d.deviceDescriptionUrl);
            });
            return matches.length > 0;
        }

        function discover(filter) {
            return new WinJS.Promise(function (complete, error) {
                var clientSocket = new Windows.Networking.Sockets.DatagramSocket();

                function onsuccess(err) {
                    try {
                        if (clientSocket)
                            clientSocket.close();
                    } catch (ex) {
                    }
                    complete(devices);
                }

                function onerror(err) {
                    try {
                        if (clientSocket)
                            clientSocket.close();
                    } catch (ex) {
                    }
                    error(err);
                }

                clientSocket.onmessagereceived = function (args) {
                    var e = args;
                    var reader = args.getDataReader();
                    var count = reader.unconsumedBufferLength;
                    var data = reader.readString(count);
                    var completed = false;

                    if (data) {
                        var items = data.split('\n');
                        items.forEach(function (item) {
                            if (!completed && item.toLowerCase().indexOf('location:') == 0) {
                                var url = item.substr(9, item.length - 9);
                                completed = true;
                                if (!exists(url)) {
                                    WinJS.xhr({ url: url }).then(function (r) {

                                        var rawdevice = xmlToJson(r.responseXML);
                                        var device = rawdevice.root.device;

                                        device.deviceDescriptionUrl = url;
                                        device.rootUrl = url.substr(0, url.indexOf('/', 8));
                                        if (!exists(url)) {
                                            devices.push(new WinJSContrib.UPnP.UPnPDevice(device));
                                        }

                                        if (callback)
                                            callback(device, url);
                                    }, function (err) {
                                        console.error('calling device failed');
                                        console.error(err);
                                    });
                                }
                            }
                        });
                    }

                }

                clientSocket.getOutputStreamAsync(hostName, "1900").then(function (outputStream) {
                    var message = "M-SEARCH * HTTP/1.1\r\n" +
                                        "HOST: 239.255.255.250:1900\r\n" +
                                          "ST:" + (filter || "upnp:rootdevice") + "\r\n" +
                                          "MAN:\"ssdp:discover\"\r\n" +
                                          "MX:3\r\n\r\n";


                    var writer = new Windows.Storage.Streams.DataWriter(outputStream);
                    writer.unicodeEncoding = Windows.Storage.Streams.UnicodeEncoding.Utf8;
                    writer.writeString(message);
                    return writer.storeAsync();
                }).then(function () {
                    return WinJS.Promise.timeout(timeout || 20000);
                }).then(onsuccess, onerror);
            }).then(function (res) {
                discovery.hasError = false;
            }, function (err) {
                discovery.hasError = true;
                discovery.error = err;
            });
        }

        var promises = [];

        if (!filter || (typeof filter == 'string')) {
            promises.push(discover(filter));
        }
        else if (filter && typeof filter != 'string' && filter.length) {
            for (var i = 0 ; i < filter.length; i++) {
                promises.push(discover(filter[i]));
            }
        }

        discovery.promise = WinJS.Promise.join(promises);

        return discovery;
    }

    function endsWith(text, search) {
        return text.indexOf(search) == text.length - search.length;
    }

    WinJSContrib.UPnP.getContentType = function (url, extension) {
        var lowerUrl = url.toLowerCase();

        if (extension == "mp3" || endsWith(lowerUrl, ".mp3"))
            return "audio/mp3";

        if (extension == "mp4" || endsWith(lowerUrl, ".mp4"))
            return "video/mp4";

        if (extension == "avi" || endsWith(lowerUrl, ".avi"))
            return "video/avi";

        if (extension == "mkv" || endsWith(lowerUrl, ".mkv"))
            return "video/x-matroska";
    }

    function xmlToJson(xml) {

        // Create the return object
        var obj = {};

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);

                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            var properties = 0;
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof (obj[nodeName]) == "undefined") {
                    var tmp = xmlToJson(item);
                    var colonIdx = nodeName.indexOf(':');
                    if (colonIdx > 0) {
                        var clearNode = nodeName.substr(colonIdx + 1, nodeName.length - colonIdx - 1);

                    }

                    if (clearNode && !obj[clearNode]) {
                        obj[clearNode] = tmp;
                    } else {
                        obj[nodeName] = tmp;
                    }

                    properties++;
                } else {
                    if (typeof (obj[nodeName].push) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                    properties++;
                }
            }

            if (obj['#text'] && typeof obj['#text'] == 'string') {
                obj['#text'] = obj['#text'].trim();
            }
            if (properties == 1 && obj['#text'] && typeof obj['#text'] == 'string') {
                obj = obj['#text'];
            }
        }

        for (var e in obj["@attributes"]) {
            if (!obj[e])
                obj[e] = obj["@attributes"][e];
        }

        return obj;
    };

    /**
     * UPnP device
     * @class
     */
    WinJSContrib.UPnP.UPnPDevice = function (deviceObj) {
        for (var p in deviceObj) {
            this[p] = deviceObj[p];
        }
    }

    WinJSContrib.UPnP.UPnPDevice.prototype.getService = function (serviceType) {
        var device = this;
        var service = null;

        if (typeof serviceType == 'string')
            serviceType = [serviceType];

        if (device.serviceList && device.serviceList.service) {
            service = device.serviceList.service.filter(function (s) {
                return serviceType.indexOf(s.serviceType) >= 0;
            })[0];

            if (!service && device.deviceList) {
                device.deviceList.device.forEach(function (childdevice) {
                    var childService = childdevice.serviceList.service.filter(function (s) {
                        return serviceType.indexOf(s.serviceType) >= 0;
                    })[0];

                    if (childService)
                        service = childService;
                });
            }
        }

        if (service) {
            service.rootUrl = device.rootUrl;
            service.url = device.rootUrl + service.controlURL;
        }

        return service;
    }

    WinJSContrib.UPnP.UPnPDevice.prototype.getAVTransport = function () {
        var service = this.getService([WinJSContrib.UPnP.deviceTypes.AVTransport1, WinJSContrib.UPnP.deviceTypes.AVTransport2]);
        if (service) {
            return new WinJSContrib.UPnP.UPnPAVTransport(service);
        }
    }

    WinJSContrib.UPnP.UPnPDevice.prototype.getContentDirectory = function () {
        var service = this.getService([WinJSContrib.UPnP.deviceTypes.ContentDirectory1, WinJSContrib.UPnP.deviceTypes.ContentDirectory2, WinJSContrib.UPnP.deviceTypes.ContentDirectory3, WinJSContrib.UPnP.deviceTypes.ContentDirectory4]);
        if (service) {
            return new WinJSContrib.UPnP.UPnPContentDirectory(service);
        }
    }

    WinJSContrib.UPnP.UPnPDevice.prototype.getConnectionManager = function () {
        var service = this.getService([WinJSContrib.UPnP.deviceTypes.ConnectionManager1, WinJSContrib.UPnP.deviceTypes.ConnectionManager2, WinJSContrib.UPnP.deviceTypes.ConnectionManager3]);
        if (service) {
            return new WinJSContrib.UPnP.UPnPConnectionManager(service);
        }
    }

    /**
     * Code largely from https://github.com/richtr/plug.play.js
     */

    WinJSContrib.UPnP.UPnPService = function (serviceObj, opts) {

        this.options = opts || { debug: false };
        this.svc = serviceObj;

        // API stub
        this.action = function () { };

        //if (!this.svc || !(this.svc instanceof NetworkService)) {

        //    this.debugLog('First argument provided in constructor MUST be a valid NetworkService object');

        //    return this;
        //}

        //if (!this.svc.type || this.svc.type.indexOf('upnp:') !== 0) {

        //    this.debugLog('First argument provided in constructor MUST be a _UPnP_ NetworkService object');

        //    return this;

        //}

        //this.svcType = this.svc.type.replace('upnp:', '');
        this.svcType = this.svc.serviceType;
        this.svcUrl = this.svc.url;

        var self = this;

        // Full API
        this.action = function (upnpAction, upnpParameters, callback) {

            return new WinJS.Promise(function (promiseComplete, promiseError) {

                // Handle .action( name, callback )
                if (!callback && Object.prototype.toString.call(upnpParameters) == '[object Function]') {
                    callback = upnpParameters;
                    upnpParameters = {};
                }

                // Generate a callback stub if a Function has not been provided
                if (!callback || Object.prototype.toString.call(callback) !== '[object Function]') {
                    callback = function (e, response) { };
                }

                // Create a UPnP XML Request message
                var svcMsg = self.createRequest(self.svcType, upnpAction, upnpParameters);

                // Send the UPnP XML Request message to the current service
                self.sendRequest(self.svcType, upnpAction, self.svcUrl, svcMsg, function (e, xmlResponse) {

                    if (e !== null) {
                        callback.apply(self, [e, null]);
                        promiseError(e);
                        return;
                    }

                    // Parse UPnP XML Response message
                    self.handleResponse(upnpAction, xmlResponse.responseXML || "", upnpParameters, function (e, upnpResponse) {

                        // Fire callback
                        callback.apply(self, [e, upnpResponse]);

                        // Fire promise
                        if (e !== null) {
                            promiseError(e);
                        } else {
                            promiseComplete(upnpResponse);
                        }

                    });

                });
            });
        }
    };

    WinJSContrib.UPnP.UPnPService.prototype.constructor = WinJSContrib.UPnP.UPnPService;

    // UPnP XML MESSAGING TEMPLATES

    WinJSContrib.UPnP.UPnPService.prototype.requestTemplate = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
     "<s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" " +
       "xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">\n" +
       "\t<s:Body>\n" +
         "\t\t<u:{ACTION_NAME} xmlns:u=\"{ACTION_TYPE}\">\n" +
           "{ACTION_VARS}" +
         "\t\t</u:{ACTION_NAME}>\n" +
       "\t</s:Body>\n" +
     "</s:Envelope>\n";

    // UPNP PRIMITIVE VARIABLE TYPE CHECKERS
    // from http://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.0.pdf
    WinJSContrib.UPnP.UPnPService.prototype.types = {

        "i1": function (val, allowedValues, toNative) {
            var i8 = new Int8Array(1);
            i8[0] = val;

            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(i8[0], allowedValues);

        },

        "i2": function (val, allowedValues, toNative) {
            var i16 = new Int16Array(1);
            i16[0] = val;
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(i16[0], allowedValues);
        },

        "i4": function (val, allowedValues, toNative) {
            var i32 = new Int32Array(1);
            i32[0] = val;
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(i32[0], allowedValues);
        },

        "ui1": function (val, allowedValues, toNative) {
            var ui8 = new Uint8Array(1);
            ui8[0] = val;
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(ui8[0], allowedValues);
        },

        "ui2": function (val, allowedValues, toNative) {
            var ui16 = new Uint16Array(1);
            ui16[0] = val;
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(ui16[0], allowedValues);
        },

        "ui4": function (val, allowedValues, toNative) {
            var ui32 = new Uint32Array(1);
            ui32[0] = val;
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(ui32[0], allowedValues);
        },

        "int": function (val, allowedValues, toNative) {
            if (val === undefined || val === null || isNaN(val)) {
                val = 0;
            } else if (typeof val !== 'number') {
                if (val === true) {
                    val = 1;
                } else {
                    val = parseInt(val + "", 10);
                }
            }
            if (!toNative) {
                val = expandExponential(val + "");
            }
            if (isNaN(val)) val = 0;
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
        },

        "r4": function (val, allowedValues, toNative) {
            var f32 = new Float32Array(1);
            f32[0] = val;
            if (!toNative) {
                return f32[0] ? expandExponential(f32[0] + "") : "0";
            }
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(f32[0], allowedValues);
        },

        "r8": function (val, allowedValues, toNative) {
            var f64 = new Float64Array(1);
            f64[0] = val;
            if (!toNative) {
                return f64[0] ? expandExponential(f64[0] + "") : "0";
            }
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(f64[0], allowedValues);
        },

        "number": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['r8'](val, allowedValues, toNative);
        },

        "fixed_14_4": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['float'](val, allowedValues, toNative);
        },

        "float": function (val, allowedValues, toNative) {
            var _float = parseFloat(val);
            if (!toNative) {
                return _float ? expandExponential(_float + "") : "0";
            }
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(_float, allowedValues);
        },

        "char": function (val, allowedValues, toNative) {
            if (val === undefined || val === null || val === "" || (val + "") == "NaN" || val instanceof RegExp) {
                val = "";
            } else if (val === false || val === true || val == "true" || val == "yes" || val == "false" || val == "no") {
                val = (val === true || val == "true" || val == "yes") ? "1" : "0";
            } else {
                val = val.toString();
            }
            if (val.length > 0) {
                val = WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
                return val.charAt(0);
            }
            return val;
        },

        "string": function (val, allowedValues, toNative) {
            if (val === undefined || val === null || val === "" || (val + "") == "NaN" || val instanceof RegExp) {
                val = "";
            }
            val = val + "";

            val = WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
            return val;
        },

        "xmlObj": function (val, allowedValues, toNative) {
            if (val === undefined || val === null || val === "" || (val + "") == "NaN" || val instanceof RegExp) {
                val = "";
            }
            val = val + "";

            val = WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
            try {
                var s = '';

                var currentPos = val.indexOf('&');
                while (currentPos > 0) {
                    var idx = val.indexOf(';', currentPos);
                    if (idx < 0 || (idx - currentPos) > 5) {
                        val = val.substr(0, currentPos) + "&amp;" + val.substr(currentPos + 1, val.length - (currentPos + 1));
                    }
                    currentPos = val.indexOf('&', currentPos + 1);
                }

                var xml = parseXML(val);
                return xmlToJson(xml);
            } catch (exception) {
                console.error(exception);
                return val;
            }
        },

        "date": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['dateTime'](val, allowedValues, toNative);
        },

        "dateTime": function (val, allowedValues, toNative) {
            if (toNative) { // Parse to ECMA Date object
                if (Object.prototype.toString.call(val) == '[object String]') {
                    val = new Date(parseDate(val));
                    if (isNaN(val)) val = "";
                } else if (Object.prototype.toString.call(val) == '[object Date]') {
                    val = val;
                }
            } else { // Parse to ISO-8601 string
                if (Object.prototype.toString.call(val) == '[object String]') {
                    val = val + "";
                } else if (Object.prototype.toString.call(val) == '[object Date]') {
                    if (val.toString() == "Invalid Date") { // opera specific functionality
                        val = "";
                    } else {
                        val = val.toISOString();
                    }
                }
            }
            val = WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
            return val;
        },

        "dateTime_tz": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['dateTime'](val, allowedValues, toNative);
        },

        "time": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['dateTime'](val, allowedValues, toNative);
        },

        "time_tz": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['dateTime'](val, allowedValues, toNative);
        },

        "boolean": function (val, allowedValues, toNative) {
            if (val == 'false' || val == 'f' || val == 'no' || val == 'n' || val instanceof RegExp || val <= 0 || !val) {
                if (toNative) {
                    val = false;
                } else {
                    val = "0";
                }
            } else {
                if (toNative) {
                    val = true;
                } else {
                    val = "1";
                }
            }
            return val;
        },

        "bin_base64": function (val, allowedValues, toNative) {
            if (val === undefined || val === null || val === "" || (val + "") == "NaN" || val instanceof RegExp) {
                val = "";
            }
            if (val === true || val === false) {
                val = val === true ? "1" : "0";
            }
            if (toNative) { // convert to string
                val = atob(val + "");
            } else { // convert to base64
                val = btoa(val + "");
            }
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
        },

        "bin_hex": function (val, allowedValues, toNative) {
            if (val === undefined || val === null || val === "" || (val + "") == "NaN" || val instanceof RegExp) {
                val = "";
            }
            if (val === true || val === false) {
                val = val === true ? "1" : "0";
            }
            if (toNative) { // convert to string
                val = htoa(val + "");
            } else { // convert to hex
                val = atoh(val + "");
            }
            return WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues(val, allowedValues);
        },

        "uri": function (val, allowedValues, toNative) {
            if (toNative) {
                val = decodeURI(val + "");
            }
            return WinJSContrib.UPnP.UPnPService.prototype.types['string'](val, allowedValues); // No URI syntax checking
        },

        "uuid": function (val, allowedValues, toNative) {
            return WinJSContrib.UPnP.UPnPService.prototype.types['string'](val, allowedValues); // No UUID syntax checking
        }

    };

    // Override .types toString function
    for (var type in WinJSContrib.UPnP.UPnPService.prototype.types) {
        WinJSContrib.UPnP.UPnPService.prototype.types[type]._name = type;
        WinJSContrib.UPnP.UPnPService.prototype.types[type]["toString"] = function () { return this._name; };
    }

    WinJSContrib.UPnP.UPnPService.prototype.createRequest = function (upnpServiceType, upnpActionName, parameters) {

        parameters = this.formatParameters(parameters);

        this.debugLog('Creating UPnP XML Control Message for [' + upnpActionName + '] with parameters:');
        this.debugLog(JSON ? JSON.stringify(parameters) : null);

        // Build basic part of XML request
        var svcMsg = this.requestTemplate.replace(/\{ACTION_TYPE\}/g, encodeXML(trim(upnpServiceType)));

        svcMsg = svcMsg.replace(/\{ACTION_NAME\}/g, encodeXML(trim(upnpActionName)));

        var svcInParams = parameters['request'],
            svcInParams_xml = "";

        if (svcInParams) {

            // Generate XML parameters syntax
            for (var svcParam in svcInParams) {

                // Perform type checking sanitization
                if (svcInParams[svcParam]['type'] !== undefined && svcInParams[svcParam]['type'] !== null) {

                    // get the primitive sanitization function
                    var typeCheck = this.types[svcInParams[svcParam]['type']];

                    if (typeCheck) {
                        svcInParams[svcParam]['value'] = typeCheck(svcInParams[svcParam]['value'], svcInParams[svcParam]['allowedValueList'], false);
                    }

                }

                if (svcInParams[svcParam]['value'] === null || svcInParams[svcParam]['value'] === undefined) {

                    svcInParams[svcParam]['value'] = ""; // pass through empty value

                }

                svcInParams_xml += "\t\t\t<" + svcParam + ">" + encodeXML(trim(svcInParams[svcParam]['value'] + "")) + "</" + svcParam + ">\n";

            }

        }

        // Add ACTION_VARS, if any
        svcMsg = svcMsg.replace(/\{ACTION_VARS\}/g, svcInParams_xml);

        // DEBUG
        this.debugLog('[REQUEST] (SOAPAction: ' + upnpServiceType + '#' + upnpActionName + ') ' + svcMsg);

        return svcMsg;

    };

    WinJSContrib.UPnP.UPnPService.prototype.sendRequest = function (upnpServiceType, upnpActionName, upnpEndpointURL, upnpRequestXML, onUPnPResponse) {

        var soapaction = '\"' + upnpServiceType.replace(/[\"\#]/g, '') + '#' + upnpActionName.replace(/[\"\#]/g, '') + '\"'
        var httpClient = new Windows.Web.Http.HttpClient();
        var uri = new Windows.Foundation.Uri(upnpEndpointURL);
        var request = new Windows.Web.Http.HttpRequestMessage(Windows.Web.Http.HttpMethod.post, uri);
        request.headers.append('SOAPACTION', soapaction);
        //request.headers.append('Content-Type', 'text/xml; charset="utf-8";');        

        request.content = new Windows.Web.Http.HttpStringContent(upnpRequestXML, Windows.Storage.Streams.UnicodeEncoding.utf8, "text/xml");

        httpClient.sendRequestAsync(request).then(function (r) {
            var content = r.content.readAsStringAsync().then(function (text) {
                var xml = parseXML(text);
                var r = {
                    status: 200,
                    responseText: text,
                    responseXML: xml
                };
                onUPnPResponse.apply(this, [null, r]);
            });

        }, function (err) {
            onUPnPResponse.apply(undefined, [new UPnPError('XmlHttpRequest failed'), null]);
        });

        return this;

        try {

            var xhr = new XMLHttpRequest();

            xhr.open('POST', upnpEndpointURL);
            xhr.setRequestHeader('Content-Type', 'text/xml; charset="utf-8";');
            xhr.setRequestHeader('action', soapaction);
            xhr.setRequestHeader('zurgl', soapaction);
            xhr.setRequestHeader('SOAPAction', soapaction);

            xhr.onabort = xhr.onerror = function () {

                onUPnPResponse.apply(undefined, [new UPnPError('XmlHttpRequest failed'), null]);

                //xhrManager.release(xhr);

            };

            var self = this;

            xhr.onreadystatechange = function () {

                if (this.readyState < 4) return;

                if (this.status !== 200) {

                    onUPnPResponse.apply(undefined, [new UPnPError('XmlHttpRequest expected 200 OK. Received ' + this.status + ' response.'), null]);

                    self.debugLog("[ERROR-RESPONSE] " + this.responseText);

                    //xhrManager.release(xhr);

                    return;

                }

                self.debugLog("[SUCCESS-RESPONSE] " + this.responseText);

                onUPnPResponse.apply(this, [null, this]);

                //xhrManager.release(xhr);

            };

            xhr.send(upnpRequestXML);

        } catch (e) {

            onUPnPResponse.apply(undefined, [new UPnPError(e), null]);

        }

        return this; // allow method chaining

    };

    WinJSContrib.UPnP.UPnPService.prototype.handleResponse = function (upnpActionName, upnpResponseXML, parameters, onUPnPResolved) {

        parameters = this.formatParameters(parameters);

        var svcOutParams = parameters['response'];

        var responseJSON = {};

        // Process all XML response variables
        var responseContainer = upnpResponseXML.getElementsByTagName ?
                                  upnpResponseXML.getElementsByTagName(upnpActionName + "Response") : null;

        // If we don't have any response variables, try again with the namespace attached (required for lib to work in Firefox)
        if (responseContainer === null || responseContainer.length <= 0) {
            responseContainer = upnpResponseXML.getElementsByTagName ?
                                      upnpResponseXML.getElementsByTagName("u:" + upnpActionName + "Response") : null;
        }

        if (responseContainer !== null && responseContainer.length > 0) {

            var responseVars = responseContainer[0].childNodes;

            if (responseVars && responseVars.length > 0) {

                for (var i = 0, l = responseVars.length; i < l; i++) {

                    var varName = responseVars[i].nodeName;
                    var varVal = responseVars[i].firstChild ? trim(decodeXML(responseVars[i].firstChild.nodeValue + "")) : null;

                    // Perform type checking sanitization if requested
                    if (svcOutParams[varName] && svcOutParams[varName]['type'] !== undefined && svcOutParams[varName]['type'] !== null) {

                        // get the primitive sanitization function
                        var typeCheck = this.types[svcOutParams[varName]['type']];

                        if (typeCheck) {
                            varVal = typeCheck(varVal, svcOutParams[varName]['allowedValueList'] || null, true);
                        }

                    }

                    responseJSON[varName] = (varVal !== undefined && varVal !== null) ? varVal : "";

                }

            }

        }

        // Fire callback with the parsed action response data
        onUPnPResolved.apply(undefined, [null, { data: responseJSON }]);

        return this; // allow method chaining

    };

    WinJSContrib.UPnP.UPnPService.prototype.formatParameter = function (parameter) {

        var param = {};

        if (parameter['type'] !== undefined || parameter['value'] !== undefined || parameter['allowedValueList'] !== undefined) {

            param = parameter;

            if (parameter['allowedValueList'] !== undefined && typeof parameter['allowedValueList'] !== 'array') {
                parameter['allowedValueList'] = [];
            }

        } else {

            param = { value: parameter };

        }

        // check type is valid, otherwise discard requested type
        if (param['type'] !== undefined && param['type'] !== null) {

            if (!this.types[(param['type'] + "")]) {

                delete param['type'];

            }

        }

        return param;

    };

    // Normalize the input parameters argument
    WinJSContrib.UPnP.UPnPService.prototype.formatParameters = function (parameters) {

        if (parameters === undefined || parameters === null) {
            parameters = {};
        }

        if (!parameters['request']) {
            parameters['request'] = {};
        }

        if (!parameters['response']) {
            parameters['response'] = {};
        }

        for (var param in parameters) {

            if (param === 'request' || param === 'response') {

                for (var processParam in parameters[param]) {

                    parameters[param][processParam] = this.formatParameter(parameters[param][processParam]);

                }

            } else { // append as 'request' parameter and remove from root object

                parameters['request'][param] = this.formatParameter(parameters[param]);

                delete parameters[param];

            }

        }

        return parameters;

    };

    // ALLOWED VALUE LIST CHECKER

    WinJSContrib.UPnP.UPnPService.prototype.checkAllowedValues = function (val, allowedValueList) {

        // Check against allowedValues if provided
        if (val && allowedValueList && Object.prototype.toString.call(allowedValueList) == '[object Array]') {

            var matchFound = false;

            for (var i = 0, l = allowedValueList.length; i < l; i++) {

                if (val == allowedValueList[i]) {

                    matchFound = true;
                    break;

                }
            }

            if (!matchFound) {
                return "";
            }
        }

        return val;

    };

    // UPnP DEBUGGER

    WinJSContrib.UPnP.UPnPService.prototype.debugLog = function (msg, level) {
        if ((this.options && this.options.debug)) {
            console[level || 'log']("Plug.UPnP: " + msg);
        }
    };

    // UPnP ERROR OBJECT

    var UPnPError = function (description) {
        return {
            'description': description
        };
    };

    function parseXML(text) {
        return (new DOMParser()).parseFromString(text, "text/xml");
    }

    // *** CUSTOM TYPE FUNCTIONS ***

    // BASE64 FUNCTIONS
    // (forked from https://github.com/dankogai/js-base64/blob/master/base64.js)

    var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var b64tab = (function (bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    })(b64chars);

    var cb_encode = function (ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
            ord = ccc.charCodeAt(0) << 16
                | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
                | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
            chars = [
                b64chars.charAt(ord >>> 18),
                b64chars.charAt((ord >>> 12) & 63),
                padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
                padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
            ];
        return chars.join('');
    };

    var cb_decode = function (cccc) {
        var len = cccc.length,
            padlen = len % 4,
            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
              | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
              | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0)
              | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
            chars = [
                String.fromCharCode(n >>> 16),
                String.fromCharCode((n >>> 8) & 0xff),
                String.fromCharCode(n & 0xff)
            ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };

    var btoa = global.btoa || function (b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };

    var atob = global.atob || function (a) {
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };

    // HEX FUNCTIONS

    var hexChars = '0123456789abcdef';

    var hextab = (function (bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[i] = bin.charAt(i);
        return t;
    })(hexChars);

    function toHex(n) {
        var result = ''
        var start = true;
        for (var i = 32; i > 0;) {
            i -= 4;
            var digit = (n >> i) & 0xf;
            if (!start || digit != 0) {
                start = false;
                result += hextab[digit];
            }
        }
        return (result == '' ? '0' : result);
    }

    function pad(str, len, pad) {
        var result = str;
        for (var i = str.length; i < len; i++) {
            result = pad + result;
        }
        return result;
    }

    function ntos(n) {
        n = n.toString(16);
        if (n.length == 1) n = "0" + n;
        n = "%" + n;
        return unescape(n);
    }

    function htoa(str) {
        str = str.toUpperCase().replace(new RegExp("s/[^0-9A-Z]//g"));
        var result = "";
        var nextchar = "";
        for (var i = 0; i < str.length; i++) {
            nextchar += str.charAt(i);
            if (nextchar.length == 2) {
                result += ntos(parseInt(nextchar, 16));
                nextchar = "";
            }
        }
        return result;
    }

    function atoh(str) {
        var result = "";
        for (var i = 0; i < str.length; i++) {
            result += pad(toHex(str.charCodeAt(i) & 0xff), 2, '0');
        }
        return result;
    }

    // NUMBER FUNCTIONS

    function expandExponential(str) {
        return str.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function (x, s, n, f, c) {
            var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
            c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
            z = (new Array(c + 1)).join("0"), r = n + f;
            return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
        });
    };

    // STRING FUNCTIONS

    var trim = function (str) {
        if (String.prototype.trim) {
            return str.trim();
        } else {
            return str.replace(/^\s+|\s+$/g, "");
        }
    };

    var encodeXML = function (str) {
        return str.replace(/\&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/'/g, '&#39;')
                   .replace(/"/g, '&quot;');
    };

    var decodeXML = function (str) {
        return str.replace(/\&quot;/g, '"')
                   .replace(/\&\#39;/g, '\'')
                   .replace(/\&gt;/g, '>')
                   .replace(/\&lt;/g, '<')
                   .replace(/\&amp;/g, '&');
    };

    /**
     * Date.parse with progressive enhancement for ISO 8601 <https://github.com/csnover/js-iso8601>
     * © 2011 Colin Snover <http://zetafleet.com>
     * Released under MIT license.
     *
     * 2012 - Modifications to accept times without dates - by Rich Tibbett
     */

    var parseDate = function (date) {
        var timestamp, struct, minutesOffset = 0, numericKeys = [1, 4, 5, 6, 7, 10, 11];

        if (typeof date !== 'string') date += "";

        if ((struct = /^((\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:[T\s]?(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{4}))?)?$/.exec(date))) {

            struct = struct.slice(1, struct.length);

            // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
            for (var i = 0, k; (k = numericKeys[i]) ; ++i) {
                struct[k] = +struct[k] || 0;
            }

            // allow undefined days and months
            struct[2] = (+struct[2] || 1) - 1;
            struct[3] = +struct[3] || 1;

            if (struct[8] !== 'Z' && struct[9] !== undefined) {
                minutesOffset = ((struct[10] / 100) - ((struct[10] / 100) % 1)) * 60 + (struct[10] % 100);

                if (struct[9] === '+') {
                    minutesOffset = 0 - minutesOffset;
                }
            }

            timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
        }
        else {
            timestamp = Date.parse ? Date.parse(date) : NaN;
        }

        return timestamp;
    };

    var allowedContentDirectoryTypes = {
        'urn:schemas-upnp-org:service:ContentDirectory:1': true,
        'urn:schemas-upnp-org:service:ContentDirectory:2': true,
        'urn:schemas-upnp-org:service:ContentDirectory:3': true,
        'urn:schemas-upnp-org:service:ContentDirectory:4': true
    };

    WinJSContrib.UPnP.UPnPContentDirectory = function (serviceObj, opts) {

        WinJSContrib.UPnP.UPnPService.apply(this, [serviceObj, opts]);

        this.upnpType = serviceObj.serviceType;
        //if (serviceObj.type.indexOf('upnp:') === 0) {
        //    this.upnpType = this.upnpType.replace('upnp:', '');
        //}

        if (!allowedContentDirectoryTypes[this.upnpType]) {
            console.error("Provided service is not a UPnP Media Server Service");
            return;
        }

        // *** ContentDirectory:1 methods

        this.getSystemUpdateId = function (callback) {

            return this.action('GetSystemUpdateID', {
                request: {},
                response: {
                    Id: {
                        type: this.types.ui4
                    }
                }
            }, callback);

        };

        this.getSearchCapabilities = function (callback) {

            return this.action('GetSearchCapabilities', {
                request: {},
                response: {
                    SearchCaps: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getSortCapabilities = function (callback) {

            return this.action('GetSortCapabilities', {
                request: {},
                response: {
                    SortCaps: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.browse = function (objectId, browseFlag, filter, startingIndex, requestedCount, sortCriteria, callback) {

            return this.action('Browse', {
                request: {
                    ObjectID: {
                        value: objectId || '0',
                        type: this.types.string
                    },
                    BrowseFlag: {
                        value: browseFlag || 'BrowseDirectChildren',
                        type: this.types.string
                    },
                    Filter: {
                        value: filter || '*',
                        type: this.types.string
                    },
                    StartingIndex: {
                        value: startingIndex || '0',
                        type: this.types.ui4
                    },
                    RequestedCount: {
                        value: requestedCount || '0',
                        type: this.types.ui4
                    },
                    SortCriteria: {
                        value: sortCriteria,
                        type: this.types.string
                    }
                },
                response: {
                    Result: {
                        type: this.types.xmlObj
                    },
                    NumberReturned: {
                        type: this.types.ui4
                    },
                    TotalMatches: {
                        type: this.types.ui4
                    },
                    UpdateID: {
                        type: this.types.ui4
                    }
                }
            }, callback);

        };

        this.search = function (objectId, browseFlag, filter, startingIndex, requestedCount, sortCriteria, callback) {

            return this.action('Search', {
                request: {
                    ObjectID: {
                        value: objectId || '0',
                        type: this.types.string
                    },
                    BrowseFlag: {
                        value: browseFlag || 'BrowseDirectChildren',
                        type: this.types.string
                    },
                    Filter: {
                        value: filter || '*',
                        type: this.types.string
                    },
                    StartingIndex: {
                        value: startingIndex || '0',
                        type: this.types.ui4
                    },
                    RequestedCount: {
                        value: requestedCount || '0',
                        type: this.types.ui4
                    },
                    SortCriteria: {
                        value: sortCriteria,
                        type: this.types.string
                    }
                },
                response: {
                    Result: {
                        type: this.types.xmlObj
                    },
                    NumberReturned: {
                        type: this.types.ui4
                    },
                    TotalMatches: {
                        type: this.types.ui4
                    },
                    UpdateID: {
                        type: this.types.ui4
                    }
                }
            }, callback);

        };


        // *** ContentDirectory:2 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:ContentDirectory:2') {

            // TODO: GetFeatureList, GetSortExtensionCapabilities, MoveObject

        }


        // *** ContentDirectory:3 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:ContentDirectory:3') {

            // TODO

        }

        // *** ContentDirectory:4 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:ContentDirectory:4') {
            // TODO
        }
    };
    WinJSContrib.UPnP.UPnPContentDirectory.prototype = Object.create(WinJSContrib.UPnP.UPnPService.prototype);

    var allowedConnectionManagerTypes = {
        'urn:schemas-upnp-org:service:ConnectionManager:1': true,
        'urn:schemas-upnp-org:service:ConnectionManager:2': true,
        'urn:schemas-upnp-org:service:ConnectionManager:3': true
    };

    WinJSContrib.UPnP.UPnPConnectionManager = function (serviceObj, opts) {

        WinJSContrib.UPnP.UPnPService.apply(this, [serviceObj, opts]);

        this.upnpType = serviceObj.serviceType;
        //if (serviceObj.type.indexOf('upnp:') === 0) {
        //    this.upnpType = this.upnpType.replace('upnp:', '');
        //}

        if (!allowedConnectionManagerTypes[this.upnpType]) {
            console.error("Provided service is not a UPnP Service");
            return;
        }

        // *** ConnectionManager:1 methods

        this.getCurrentConnectionIDs = function (callback) {

            return this.action('GetCurrentConnectionIDs', {
                request: {},
                response: {
                    ConnectionIDs: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getCurrentConnectionInfo = function (connectionId, callback) {

            return this.action('GetCurrentConnectionInfo', {
                request: {
                    ConnectionID: {
                        value: connectionId,
                        type: this.types.ui4
                    }
                },
                response: {
                    RcsID: {
                        type: this.types.i4
                    },
                    AVTransportID: {
                        type: this.types.i4
                    },
                    ProtocolInfo: {
                        type: this.types.string
                    },
                    PeerConnectionManager: {
                        type: this.types.string
                    },
                    PeerConnectionID: {
                        type: this.types.i4
                    },
                    Direction: {
                        type: this.types.string
                    },
                    Status: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getProtocolInfo = function (callback) {

            return this.action('GetProtocolInfo', {
                request: {},
                response: {
                    Source: {
                        type: this.types.string
                    },
                    Sink: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        // *** ConnectionManager:2 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:ConnectionManager:2') {
            // TODO
        }

    };

    WinJSContrib.UPnP.UPnPConnectionManager.prototype = Object.create(WinJSContrib.UPnP.UPnPService.prototype);

    var allowedAVTransportTypes = {
        'urn:schemas-upnp-org:service:AVTransport:1': true,
        'urn:schemas-upnp-org:service:AVTransport:2': true
    };

    WinJSContrib.UPnP.UPnPAVTransport = function (serviceObj, opts) {

        WinJSContrib.UPnP.UPnPService.apply(this, [serviceObj, opts]);

        this.upnpType = serviceObj.serviceType;
        //if (serviceObj.type.indexOf('upnp:') === 0) {
        //    this.upnpType = this.upnpType.replace('upnp:', '');
        //}

        if (!allowedAVTransportTypes[this.upnpType]) {
            console.error("Provided service is not a UPnP Media Renderer Service");
            return;
        }

        // *** AVTransport:1 methods

        this.getDeviceCapabilities = function (instanceId, callback) {

            return this.action('GetDeviceCapabilities', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    PlayMedia: {
                        type: this.types.string
                    },
                    RecMedia: {
                        type: this.types.string
                    },
                    RecQualityModes: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getMediaInfo = function (instanceId, callback) {

            return this.action('GetMediaInfo', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    NrTracks: {
                        type: this.types.ui4
                    },
                    MediaDuration: {
                        type: this.types.string
                    },
                    CurrentURI: {
                        type: this.types.string
                    },
                    CurrentURIMetaData: {
                        type: this.types.string
                    },
                    NextURI: {
                        type: this.types.string
                    },
                    NextURIMetaData: {
                        type: this.types.string
                    },
                    PlayMedium: {
                        type: this.types.string
                    },
                    RecordMedium: {
                        type: this.types.string
                    },
                    WriteStatus: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getPositionInfo = function (instanceId, callback) {

            return this.action('GetPositionInfo', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    Track: {
                        type: this.types.ui4
                    },
                    TrackDuration: {
                        type: this.types.string
                    },
                    TrackMetaData: {
                        type: this.types.xmlObj
                    },
                    TrackURI: {
                        type: this.types.string
                    },
                    RelTime: {
                        type: this.types.string
                    },
                    AbsTime: {
                        type: this.types.string
                    },
                    RelCount: {
                        type: this.types.i4
                    },
                    AbsCount: {
                        type: this.types.i4
                    }
                }
            }, callback);

        };

        this.getTransportInfo = function (instanceId, callback) {

            return this.action('GetTransportInfo', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentTransportState: {
                        type: this.types.string
                    },
                    CurrentTransportStatus: {
                        type: this.types.string
                    },
                    CurrentSpeed: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getTransportSettings = function (instanceId, callback) {

            return this.action('GetTransportSettings', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    PlayMode: {
                        type: this.types.ui4
                    },
                    RecQualityMode: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.setAVTransportURI = function (instanceId, currentURI, currentURIMetaData, callback) {

            return this.action('SetAVTransportURI', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    CurrentURI: {
                        value: currentURI,
                        type: this.types.string
                    },
                    CurrentURIMetaData: {
                        value: currentURIMetaData,
                        type: this.types.string
                    }
                },
                response: {}
            }, callback);

        };

        this.play = function (instanceId, speed, callback) {

            return this.action('Play', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Speed: {
                        value: speed || '1',
                        type: this.types.string
                    }
                },
                response: {}
            }, callback);

        };

        this.pause = function (instanceId, callback) {

            return this.action('Pause', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {}
            }, callback);

        };

        this.stop = function (instanceId, callback) {

            return this.action('Stop', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {}
            }, callback);

        };

        this.next = function (instanceId, callback) {

            return this.action('Next', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {}
            }, callback);

        };

        this.previous = function (instanceId, callback) {

            return this.action('Previous', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {}
            }, callback);

        };

        this.seek = function (instanceId, unit, target, callback) {

            return this.action('Seek', {
                request: {
                    InstanceID: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Unit: {
                        value: unit,
                        type: this.types.string
                    },
                    Target: {
                        value: target,
                        type: this.types.string
                    }
                },
                response: {}
            }, callback);

        };

        // *** AVTransport:2 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:AVTransport:2') {

            // TODO

        }
    };
    WinJSContrib.UPnP.UPnPAVTransport.prototype = Object.create(WinJSContrib.UPnP.UPnPService.prototype);

    var allowedRenderingControlTypes = {
        'urn:schemas-upnp-org:service:RenderingControl:1': true,
        'urn:schemas-upnp-org:service:RenderingControl:2': true,
        'urn:schemas-upnp-org:service:RenderingControl:3': true
    };

    WinJSContrib.UPnP.UPnPRenderingControl = function (serviceObj, opts) {

        WinJSContrib.UPnP.UPnPService.apply(this, [serviceObj, opts]);

        this.upnpType = serviceObj.serviceType;
        //if (serviceObj.type.indexOf('upnp:') === 0) {
        //    this.upnpType = this.upnpType.replace('upnp:', '');
        //}

        if (!allowedRenderingControlTypes[this.upnpType]) {
            console.error("Provided service is not a UPnP Media Renderer Service");
            return;
        }

        // *** RenderingControl:1 methods

        this.listPresets = function (instanceId, callback) {

            return this.action('ListPresets', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentPresetNameList: {
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.selectPreset = function (instanceId, presetName, callback) {

            return this.action('SelectPreset', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    PresetName: {
                        value: presetName || "FactoryDefaults",
                        type: this.types.string
                    }
                }
            }, callback);

        };

        this.getBrightness = function (instanceId, callback) {

            return this.action('GetBrightness', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentBrightness: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setBrightness = function (instanceId, desiredBrightness, callback) {

            return this.action('SetBrightness', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredBrightness: {
                        value: desiredBrightness,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getContrast = function (instanceId, callback) {

            return this.action('GetContrast', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentContrast: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setContrast = function (instanceId, desiredContrast, callback) {

            return this.action('SetContrast', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredContrast: {
                        value: desiredContrast,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getSharpness = function (instanceId, callback) {

            return this.action('GetSharpness', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentSharpness: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setSharpness = function (instanceId, desiredSharpness, callback) {

            return this.action('SetSharpness', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredSharpness: {
                        value: desiredSharpness,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getRedVideoGain = function (instanceId, callback) {

            return this.action('GetRedVideoGain', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentRedVideoGain: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setRedVideoGain = function (instanceId, desiredRedVideoGain, callback) {

            return this.action('SetRedVideoGain', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredRedVideoGain: {
                        value: desiredRedVideoGain,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getGreenVideoGain = function (instanceId, callback) {

            return this.action('GetGreenVideoGain', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentGreenVideoGain: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setGreenVideoGain = function (instanceId, desiredGreenVideoGain, callback) {

            return this.action('SetGreenVideoGain', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredGreenVideoGain: {
                        value: desiredGreenVideoGain,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getBlueVideoGain = function (instanceId, callback) {

            return this.action('GetBlueVideoGain', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentBlueVideoGain: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setBlueVideoGain = function (instanceId, desiredBlueVideoGain, callback) {

            return this.action('SetBlueVideoGain', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredBlueVideoGain: {
                        value: desiredBlueVideoGain,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getRedVideoBlackLevel = function (instanceId, callback) {

            return this.action('GetRedVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentRedVideoBlackLevel: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setRedVideoBlackLevel = function (instanceId, desiredRedVideoBlackLevel, callback) {

            return this.action('SetRedVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredRedVideoBlackLevel: {
                        value: desiredRedVideoBlackLevel,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getGreenVideoBlackLevel = function (instanceId, callback) {

            return this.action('GetGreenVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentGreenVideoBlackLevel: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setGreenVideoBlackLevel = function (instanceId, desiredGreenVideoBlackLevel, callback) {

            return this.action('SetGreenVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredGreenVideoBlackLevel: {
                        value: desiredGreenVideoBlackLevel,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getBlueVideoBlackLevel = function (instanceId, callback) {

            return this.action('GetBlueVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentBlueVideoBlackLevel: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setBlueVideoBlackLevel = function (instanceId, desiredBlueVideoBlackLevel, callback) {

            return this.action('SetBlueVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredBlueVideoBlackLevel: {
                        value: desiredBlueVideoBlackLevel,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getBlueVideoBlackLevel = function (instanceId, callback) {

            return this.action('GetBlueVideoBlackLevel', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentBlueVideoBlackLevel: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getColorTemperature = function (instanceId, callback) {

            return this.action('GetColorTemperature', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentColorTemperature: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setColorTemperature = function (instanceId, desiredColorTemperature, callback) {

            return this.action('SetColorTemperature', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredColorTemperature: {
                        value: desiredColorTemperature,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getHorizontalKeystone = function (instanceId, callback) {

            return this.action('GetHorizontalKeystone', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentHorizontalKeystone: {
                        type: this.types.i2
                    }
                }
            }, callback);

        };

        this.setHorizontalKeystone = function (instanceId, desiredHorizontalKeystone, callback) {

            return this.action('SetHorizontalKeystone', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredHorizontalKeystone: {
                        value: desiredHorizontalKeystone,
                        type: this.types.i2
                    }
                }
            }, callback);

        };

        this.getVerticalKeystone = function (instanceId, callback) {

            return this.action('GetVerticalKeystone', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    }
                },
                response: {
                    CurrentVerticalKeystone: {
                        type: this.types.i2
                    }
                }
            }, callback);

        };

        this.setVerticalKeystone = function (instanceId, desiredVerticalKeystone, callback) {

            return this.action('SetVerticalKeystone', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    DesiredVerticalKeystone: {
                        value: desiredVerticalKeystone,
                        type: this.types.i2
                    }
                }
            }, callback);

        };

        this.getMute = function (instanceId, channel, callback) {

            return this.action('GetMute', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    }
                },
                response: {
                    CurrentMute: {
                        type: this.types.boolean
                    }
                }
            }, callback);

        };

        this.setMute = function (instanceId, channel, desiredMute, callback) {

            return this.action('SetMute', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    },
                    DesiredMute: {
                        value: desiredMute,
                        type: this.types.boolean
                    }
                }
            }, callback);

        };

        this.getVolume = function (instanceId, channel, callback) {

            return this.action('GetVolume', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    }
                },
                response: {
                    CurrentVolume: {
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.setVolume = function (instanceId, channel, desiredVolume, callback) {

            return this.action('SetVolume', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    },
                    DesiredVolume: {
                        value: desiredVolume,
                        type: this.types.ui2
                    }
                }
            }, callback);

        };

        this.getVolumeDB = function (instanceId, channel, callback) {

            return this.action('GetVolumeDB', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    }
                },
                response: {
                    CurrentVolume: {
                        type: this.types.i2
                    }
                }
            }, callback);

        };

        this.setVolumeDB = function (instanceId, channel, desiredVolume, callback) {

            return this.action('SetVolumeDB', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    },
                    DesiredVolume: {
                        value: desiredVolume,
                        type: this.types.i2
                    }
                }
            }, callback);

        };

        this.getVolumeDBRange = function (instanceId, channel, callback) {

            return this.action('GetVolumeDBRange', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    }
                },
                response: {
                    MinValue: {
                        type: this.types.i2
                    },
                    MaxValue: {
                        type: this.types.i2
                    },
                }
            }, callback);

        };

        this.getLoudness = function (instanceId, channel, callback) {

            return this.action('GetLoudness', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    }
                },
                response: {
                    CurrentLoudness: {
                        type: this.types.boolean
                    }
                }
            }, callback);

        };

        this.setLoudness = function (instanceId, channel, desiredLoudness, callback) {

            return this.action('SetLoudness', {
                request: {
                    InstanceId: {
                        value: instanceId,
                        type: this.types.ui4
                    },
                    Channel: {
                        value: channel || 'Master',
                        type: this.types.string
                    },
                    DesiredLoudness: {
                        value: desiredLoudness,
                        type: this.types.boolean
                    }
                }
            }, callback);

        };

        // *** RenderingControl:2 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:RenderingControl:2' ||
              this.upnpType === 'urn:schemas-upnp-org:service:RenderingControl:3') {

            this.getStateVariables = function (instanceId, stateVariableList, callback) {

                return this.action('GetStateVariables', {
                    request: {
                        InstanceId: {
                            value: instanceId,
                            type: this.types.ui4
                        },
                        StateVariableList: {
                            value: stateVariableList,
                            type: this.types.string
                        }
                    },
                    response: {
                        StateVariableValuePairs: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.setStateVariables = function (instanceId, renderingControlUDN, serviceType, serviceId, stateVariableValuePairs, callback) {

                return this.action('SetStateVariables', {
                    request: {
                        InstanceId: {
                            value: instanceId,
                            type: this.types.ui4
                        },
                        RenderingControlUDN: {
                            value: renderingControlUDN,
                            type: this.types.string
                        },
                        ServiceType: {
                            value: serviceType,
                            type: this.types.string
                        },
                        ServiceId: {
                            value: serviceId,
                            type: this.types.string
                        },
                        StateVariableValuePairs: {
                            value: stateVariableValuePairs,
                            type: this.types.string
                        }
                    },
                    response: {
                        StateVariableList: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

        }

        // *** RenderingControl:3 methods

        if (this.upnpType === 'urn:schemas-upnp-org:service:RenderingControl:3') {

            this.getAllowedTransforms = function (instanceId, callback) {

                return this.action('GetAllowedTransforms', {
                    request: {
                        InstanceId: {
                            value: instanceId,
                            type: this.types.ui4
                        }
                    },
                    response: {
                        CurrentAllowedTransformSettings: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.getTransforms = function (instanceId, callback) {

                return this.action('GetTransforms', {
                    request: {
                        InstanceId: {
                            value: instanceId,
                            type: this.types.ui4
                        }
                    },
                    response: {
                        CurrentTransformValues: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.setTransforms = function (instanceId, desiredTransformValues, callback) {

                return this.action('SetTransforms', {
                    request: {
                        InstanceId: {
                            value: instanceId,
                            type: this.types.ui4
                        },
                        DesiredTransformValues: {
                            value: desiredTransformValues,
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.getAllAvailableTransforms = function (instanceId, callback) {

                return this.action('GetAllAvailableTransforms', {
                    response: {
                        AllAllowedTransformSettings: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.getAllowedDefaultTransforms = function (instanceId, callback) {

                return this.action('GetAllowedDefaultTransforms', {
                    response: {
                        AllowedDefaultTransformSettings: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.getDefaultTransforms = function (instanceId, callback) {

                return this.action('GetDefaultTransforms', {
                    response: {
                        CurrentDefaultTransformSettings: {
                            type: this.types.string
                        }
                    }
                }, callback);

            };

            this.setDefaultTransforms = function (instanceId, desiredDefaultTransformSettings, callback) {

                return this.action('SetDefaultTransforms', {
                    request: {
                        DesiredDefaultTransformSettings: {
                            value: desiredDefaultTransformSettings,
                            type: this.types.string
                        }
                    }
                }, callback);

            };

        }

    };
    WinJSContrib.UPnP.UPnPRenderingControl.prototype = Object.create(WinJSContrib.UPnP.UPnPService.prototype);

})(window);