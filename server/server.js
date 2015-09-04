var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
var sh = require('shelljs');
var url = require("url"),
path = require("path"),
fs = require("fs");

var cwd = sh.pwd() + "/../../arm";

app.use(express.static('client'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function parseQueryString(parmStr) {
  var qidx = parmStr.indexOf("?") + 1;
  var query = parmStr.substr(qidx, parmStr.length - qidx), map   = {};
  console.log("query:"+query);
  query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
    (map[key] = map[key] || []).push(value);
  });
  return map;
}
  
function ConvertToHex(numberValue){
  var decNumber = Number(numberValue);
  return decNumber.toString(16).toUpperCase();
}

function ConvertToDec(hexNumber){
  return parseInt(hexNumber,16);
}

function dumpFileList(lookatpath, response) {
  console.log("lookatpath:"+lookatpath+" path:"+path);
  var line1 = {};
  var file_num = 0;
  fs.readdir(lookatpath, function (status, files) {
    if (status) {
      var line = {};
      line['error'] = status.message;
      response.json(line1);
      response.end();
      console.log("dumpFileList: error:" + status.message);
    }

    files.map(function (file) {
        return path.join(lookatpath, file);
    }).filter(function (file) {
        return fs.statSync(file).isFile();
    }).forEach(function (file) {
      var ext = path.extname(file);
      if (ext.indexOf('elf') > -1 || 
        ext.indexOf('s') > -1 ||
        ext.indexOf('lst') > -1 ) {
        line1[file_num] = file;
        console.log("%s (%s)", file, ext);
        file_num = file_num + 1;
      }
    });
    response.json(line1);
  });
}

function dumpFile(filename, type, response) {
  console.log("filename:"+filename);
  fs.open(filename, 'r', function(status, fd) {
    if (status) {
      var line = {};
      line['error'] = status.message;
      response.json(line1);
      response.end();
      console.log("dumpFile: error:" + status.message);
      return;
    }
//    var line1 = {};
//    line1["00000000"] = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f];
//    file_val.push(line1);
//    line1 = {};
//    line1["00000016"] = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f];
//    file_val.push(line1);
//    console.log(data.length);
//    console.log(data);
      var addr = 0;
      var line1 = {};
      var not_done = 1;
      var bytesRead = 1;
      while (bytesRead > 0) {
        var cpbuf = [];
        var buffer = new Buffer(16);
        bytesRead = fs.readSync(fd, buffer, 0, 16);
        console.log("br:" + bytesRead);
        console.log(buffer.toString('utf8', 0, bytesRead));
        var i = 0;
        while (i < 16 && i < bytesRead) {
          console.log("i:" + i + " d:" + buffer[i]);
          cpbuf[i] = buffer[i];
          i++;
        }
        line1[addr] = cpbuf;
        addr += 16;
      }
      response.json(line1);
      response.end();
    });
  }

app.get('/convert', function(req, res){
    var reqUrl = req.url;
    console.log("convert - reqUrl:"+reqUrl);
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
      dumpFile(file, type, res);
      return;
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('handler didn\'t understand request');
    console.log("handler didn't understand request");
    res.end();
});

app.get('/get_list', function(req, res) {
    var reqUrl = req.url;
    console.log("get_list - reqUrl:"+reqUrl+ " cwd:"+cwd);
    var uri = url.parse(reqUrl).pathname
    , filename = path.join(process.cwd(), uri);

    var contentTypesByExtension = {
      '.html': "text/html",
      '.css':  "text/css",
      '.js':   "text/javascript"
    };
    console.log(parseQueryString(reqUrl));
    dumpFileList(cwd, res);
    return;
});

app.listen(3000);
console.log('on port 3000');