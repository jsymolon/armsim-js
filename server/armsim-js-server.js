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

var app = express();

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

//Routes
app.get('/', function(req, res){
	console.log("root");
});

app.get('/get_list', function(req, res){
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

app.get('/convert', function(req, res){
	console.log("convert");
});

app.listen(3000);