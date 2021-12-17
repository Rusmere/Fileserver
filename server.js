//a fileserver
var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var url = require('url');
var util = require('util');
var querystring = require('querystring');
var port = Number(process.argv.slice(2))||80;
var server = http.createServer(function (req, res) {
    function list(dirname) {
        fs.readdir(dirname, (err, files) => {
            if (err) {
                console.log(err);
                return;
            }
            var str = '';
            files.forEach(function (item) {
                str += `<li><a href="${item}">${item}</a></li>`;
            });
            res.writeHead(200, { 'Content-Type': "text/html;charset=utf-8" });
            res.end(`<ul>${str}</ul>`);
        });
    }
    var urlObj = url.parse(req.url, true);
    var pathname = urlObj.pathname;
    var query = urlObj.query;
    if (pathname == '/') {
        pathname = '/index.html';
    }
    if (pathname == '/list') {
        list(__dirname);
        return;
    }
    var realPath = path.join(__dirname, querystring.unescape(pathname));
    fs.exists(realPath, function (exists) {
        if (!exists) {
            console.log('');
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        fs.lstatSync(realPath).isDirectory() ? list(realPath) : fs.readFile(realPath, function (err, data) {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 Internal Server Error</h1>');
                return;
            }
            var contentType = mime.getType(realPath);
            res.writeHead(200, { 'Content-Type': contentType + ';charset=utf-8' });
            res.end(data);
        });
    });
    console.log(req.method + ' ' + querystring.unescape(pathname));
});
server.listen(port);
console.log('Server running at http://localhost:' + port);