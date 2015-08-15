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
  
  function ConvertToHex(numberValue){
    var decNumber = Number(numberValue);
    return decNumber.toString(16).toUpperCase();
  }

  function ConvertToDec(hexNumber){
    return parseInt(hexNumber,16);
  }

  function dumpFile(filename, type, response) {
    filename = "/Users/jsymolon/arm/" + filename;
    console.log("filename:"+filename);
    fs.readFile(filename, "binary", function(err, data) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
      }
//      var line1 = {};
//    line1["00000000"] = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f];
//    file_val.push(line1);
//    line1 = {};
//    line1["00000016"] = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f];
//    file_val.push(line1);
      //console.log(data.length);
      //console.log(data);
      var addr = 0;
      var d_len = data.length;
      //d_len = 8;
      var cur_data = 0;
      var line1 = {};
      while (cur_data <= d_len) {
        var i = 0;
        var buffer = [];
        while (i < 16 && cur_data + i < d_len) {
          console.log("i:" + i + " cd:" + cur_data + " d:" + data[cur_data + i]);
          buffer[i] = data[cur_data + i];
          i++;
        }
        line1[addr] = buffer;
        addr += 16;
        cur_data += 16;
      }
      response.json(line1);
      response.end();
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
//    res.writeHead(500, {"Content-Type": "text/plain"});
//    res.write("Convert:" + parmMap['file'] + ' ' + parmMap['type']);
//    res.end();
    dumpFile(file, type, res);
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