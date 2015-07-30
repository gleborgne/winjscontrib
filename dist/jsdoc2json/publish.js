/**
    @overview Builds a tree-like JSON string from the doclet data.
    @version 0.0.3
    @example
        ./jsdoc scratch/jsdoc_test.js -t templates/haruki -d console -q format=xml
 */
'use strict';

function graft(parentNode, childNodes, parentLongname, parentName) {
    childNodes
    .filter(function (element) {
        return (element.memberof == parentLongname);
    })
    .forEach(function (element, index) {
        var i,
            len;

        if (element.kind == 'namespace') {
            if (! parentNode.namespaces) {
                parentNode.namespaces = [];
            }

            var thisNamespace = {
            	'kind': 'namespace',
                'name': element.name,
                'fullname': element.longname,
                'description': element.description || '',
                'access': element.access || '',
                'virtual': !!element.virtual,
                'meta': {
                	filename : element.meta.filename,
                	lineno : element.meta.lineno
                }
            };

            parentNode.namespaces.push(thisNamespace);

            graft(thisNamespace, childNodes, element.longname, element.name);
        }
        else if (element.kind == 'mixin') {
            if (! parentNode.mixins) {
                parentNode.mixins = [];
            }

            var thisMixin = {
            	'kind': 'mixin',
                'name': element.name,
                'fullname': element.longname,
                'description': element.description || '',
                'access': element.access || '',
                'virtual': !!element.virtual,
                'meta': {
                	filename : element.meta.filename,
                	lineno : element.meta.lineno
                }
            };

            parentNode.mixins.push(thisMixin);

            graft(thisMixin, childNodes, element.longname, element.name);
        }
        else if (element.kind == 'function') {
            if (! parentNode.functions) {
                parentNode.functions = [];
            }

            var thisFunction = {
            	'kind': 'function',
                'name': element.name,
                'fullname': element.longname,
                'access': element.access || '',
                'virtual': !!element.virtual,
                'description': element.description || '',
                'parameters': [ ],
                'examples': [],
                'meta': {
                	filename : element.meta.filename,
                	lineno : element.meta.lineno
                }
            };

            parentNode.functions.push(thisFunction);

            if (element.returns) {
                thisFunction.returns = {
                    'type': element.returns[0].type? (element.returns[0].type.names.length === 1? element.returns[0].type.names[0] : element.returns[0].type.names) : '',
                    'description': element.returns[0].description || ''
                };
            }

            if (element.examples) {
                for (i = 0, len = element.examples.length; i < len; i++) {
                    thisFunction.examples.push(element.examples[i]);
                }
            }

            if (element.params) {
                for (i = 0, len = element.params.length; i < len; i++) {
                    thisFunction.parameters.push({
                        'name': element.params[i].name,
                        'fullname': element.params[i].longname,
                        'type': element.params[i].type? (element.params[i].type.names.length === 1? element.params[i].type.names[0] : element.params[i].type.names) : '',
                        'description': element.params[i].description || '',
                        'default': element.params[i].defaultvalue || '',
                        'variable': element.params[i].variable || '',
                        'optional': typeof element.params[i].optional === 'boolean'? element.params[i].optional : '',
                        'nullable': typeof element.params[i].nullable === 'boolean'? element.params[i].nullable : ''
                    });
                }
            }
        }        
        else if (element.kind == 'member') {
            if (! parentNode.properties) {
                parentNode.properties = [];
            }
            var thismember = {
            	'kind': 'member',
                'name': element.name,
                'fullname': element.longname,
                'isEnum': element.isEnum,
                'access': element.access || '',
                'virtual': !!element.virtual,
                'description': element.description || '',
                'type': element.type? (element.type.length === 1? element.type[0] : element.type) : '',
                'meta': {
                	filename : element.meta.filename,
                	lineno : element.meta.lineno
                }
            }
            parentNode.properties.push(thismember);

            if (element.isEnum && element.properties) {
                thismember.properties = [];
                for (i = 0, len = element.properties.length; i < len; i++) {
                    var prop = element.properties[i];
                    thismember.properties.push({
                    	'kind': 'member',
                        'name': prop.name,
                        'fullname': element.longname,
                		'access': prop.access || '',
                        'virtual': !!prop.virtual,
                        'description': prop.description || '',
                        'type': thismember.type
                    });
                }
            }
        }

        else if (element.kind == 'event') {
            if (! parentNode.events) {
                parentNode.events = [];
            }

            var thisEvent = {
            	'kind': 'event',
                'name': element.name,
                'fullname': element.longname,
                'access': element.access || '',
                'virtual': !!element.virtual,
                'description': element.description || '',
                'parameters': [],
                'examples': [],
                'meta': {
                	filename : element.meta.filename,
                	lineno : element.meta.lineno
                }
            };

            parentNode.events.push(thisEvent);

            if (element.returns) {
                thisEvent.returns = {
                    'type': element.returns.type? (element.returns.type.names.length === 1? element.returns.type.names[0] : element.returns.type.names) : '',
                    'description': element.returns.description || ''
                };
            }

            if (element.examples) {
                for (i = 0, len = element.examples.length; i < len; i++) {
                    thisEvent.examples.push(element.examples[i]);
                }
            }

            if (element.params) {
                for (i = 0, len = element.params.length; i < len; i++) {
                    thisEvent.parameters.push({
                        'name': element.params[i].name,
                        'fullname': element.params[i].longname,
                		'type': element.params[i].type? (element.params[i].type.names.length === 1? element.params[i].type.names[0] : element.params[i].type.names) : '',
                        'description': element.params[i].description || '',
                        'default': element.params[i].defaultvalue || '',
                        'variable': element.params[i].variable || '',
                        'optional': typeof element.params[i].optional === 'boolean'? element.params[i].optional : '',
                        'nullable': typeof element.params[i].nullable === 'boolean'? element.params[i].nullable : ''
                    });
                }
            }
        }
        else if (element.kind == 'class' || element.kind == 'typedef') {

            if (element.kind === 'class' && !parentNode.classes) {
                parentNode.classes = [];
            }

            if (element.kind === 'typedef' && !parentNode.typedefinitions) {
                parentNode.typedefinitions = [];
            }

            var thisClass = {
            	'kind': 'class',
                'name': element.name,
                'fullname': element.longname,
                'description': element.classdesc || element.description || '',
                'extends': element.augments || [],
                'access': element.access || '',
                'virtual': !!element.virtual,
                'fires': element.fires || '',
                'constructor': {
                    'name': element.name,
                    'description': element.description || '',
                    'parameters': [
                    ],
                    'examples': []
                },
                'meta': {
                	filename : element.meta.filename,
                	lineno : element.meta.lineno
                }
            };

            if (element.kind === 'class' )
                parentNode.classes.push(thisClass);
            else if (element.kind === 'typedef')
                parentNode.typedefinitions.push(thisClass);

            if (element.examples) {
                for (i = 0, len = element.examples.length; i < len; i++) {
                    thisClass.constructor.examples.push(element.examples[i]);
                }
            }

            if (element.params) {
                for (i = 0, len = element.params.length; i < len; i++) {
                    thisClass.constructor.parameters.push({
                        'name': element.params[i].name,
                        'fullname': element.params[i].longname,                
                		'type': element.params[i].type? (element.params[i].type.names.length === 1? element.params[i].type.names[0] : element.params[i].type.names) : '',
                        'description': element.params[i].description || '',
                        'default': element.params[i].defaultvalue || '',
                        'variable': element.params[i].variable || '',
                        'optional': typeof element.params[i].optional === 'boolean'? element.params[i].optional : '',
                        'nullable': typeof element.params[i].nullable === 'boolean'? element.params[i].nullable : ''
                    });
                }
            }

            if (element.properties) {
                thisClass.properties = [];
                for (i = 0, len = element.properties.length; i < len; i++) {
                    var prop = element.properties[i];
                    thisClass.properties.push({
                        'name': prop.name,
                        'fullname': prop.longname,
                		'access': prop.access || '',
                        'virtual': !!prop.virtual,
                        'description': prop.description || '',
                        'type': prop.type? (prop.type.length === 1? prop.type[0] : prop.type) : ''
                    });
                }
            }



            graft(thisClass, childNodes, element.longname, element.name);
       }
    });
}

/**
    @param {TAFFY} data
    @param {object} opts
 */
exports.publish = function(data, opts) {

    var root = {},
        docs;

    data({undocumented: true}).remove();
    docs = data().get(); // <-- an array of Doclet objects

    graft(root, docs);

    if (opts.destination === 'console') {
        if (opts.query && opts.query.format === 'xml') {
            var xml = require('js2xmlparser');
            console.log( xml('jsdoc', root) );
        }
        else {
            global.dump(root);
        }
    }
    else {
        console.log('This template only supports output to the console. Use the option "-d console" when you run JSDoc.');
    }

};