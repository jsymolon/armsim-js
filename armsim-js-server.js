/**
 * Module dependencies.
 */

var express = require('express')
  , get_list = require('./get_list')
  , convert = require('./convert')
  , http = require('http')
  , url = require("url")
  , path = require("path")
  , fs = require("fs");
var sh = require('shelljs');
var cwd = sh.pwd() + "/../../arm";
var appcwd = sh.pwd();

var app = express();

app.get('/', function(req, res){
  res.send('hello world');
});

app.get('/armsim-js', function(req, res){
  res.send('armsim hello world');
});

//app.configure(function(){
  //app.set('port', process.env.PORT || 3000);
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  //app.set('view options', {layout: false});
  //app.use(express.favicon());
  //app.use(express.logger('dev'));
  //app.use(express.bodyParser());
  //app.use(express.methodOverride());
  //app.use(app.router);
  //app.use(require('stylus').middleware(__dirname + '/public'));
  //app.use(express.static(path.join(__dirname, 'public')));
//});

//app.configure('development', function(){
//  app.use(express.errorHandler());
//});

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

function dumpFile(fname, type, response) {
  console.log("filename:");
  console.log(fname);
  var filename = fname.toString();
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



app.listen(3000);