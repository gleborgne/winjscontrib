rem node node_modules\gulp-jsdoc\node_modules\jsdoc\jsdoc "dist\bin\js" -r -t "node_modules\gulp-jsdoc\node_modules\jsdoc\templates\haruki" -d console > dist\winjscontrib.doc.json
node node_modules\gulp-jsdoc\node_modules\jsdoc\jsdoc "dist\bin\js" -r -t "dist\jsdoc2JSON" -d console > dist\winjscontrib.doc.json
copy "dist\winjscontrib.doc.json" "sources\samples\ShowcaseApp\MCNEXT WinJS Contrib.Shared\apidoc\winjscontrib.doc.json"


pause