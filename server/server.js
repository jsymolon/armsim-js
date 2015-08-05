var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
var url = require("url"),
path = require("path"),
fs = require("fs");

app.use(express.static('client'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//app.use('/users', users);

/// catch 404 and forwarding to error handler
//app.use(function(req, res, next) {
//    var err = new Error('Not Found');
//    err.status = 404;
//    next(err);
//});
function parseQueryString(parmStr) {
  var qidx = parmStr.indexOf("?") + 1;
  var query = parmStr.substr(qidx, parmStr.length - qidx), map   = {};
  console.log("query:"+query);
  query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
    (map[key] = map[key] || []).push(value);
  });

    // show the values stored
    //for (var k in map) {
    //   // use hasOwnProperty to filter out keys from the Object.prototype
    //   if (map.hasOwnProperty(k)) {
    //    console.log('key is: ' + k + ', value is: ' + map[k]);
    //  }
    //}
    return map;
  }

  function dumpFile(filename, response) {
    fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var contentType = contentTypesByExtension[path.extname(filename)];
      if (contentType) headers["Content-Type"] = contentType;
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
    });
  }

  app.get('/convert', function(req, res){
    var reqUrl = req.url;
    console.log("reqUrl:"+reqUrl);
    var uri = url.parse(reqUrl).pathname
    , filename = path.join(process.cwd(), uri);

    var contentTypesByExtension = {
      '.html': "text/html",
      '.css':  "text/css",
      '.js':   "text/javascript"
    };
    console.log(parseQueryString(reqUrl));
    console.log("filename", filename);

    var pathName = url.parse(reqUrl).pathname;
    console.log("Request for " + pathName + " received");
    if (typeof filename != 'undefined' && filename.indexOf("convert") > -1 ) {
    // asking for a file to convert
    var parmMap = parseQueryString(reqUrl);
    var file = parmMap["file"];
    var type = parmMap["type"];
    console.log("file:"+file+" type:"+type);
    res.writeHead(500, {"Content-Type": "text/plain"});
    res.write("Convert:" + parmMap['file'] + ' ' + parmMap['type']);
    res.end();
    return;
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello');
  res.write(':');
  console.log("convert");
  res.end();
});

app.listen(3000);
console.log('on port 3000');