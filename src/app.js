var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    express = require('express'),
    path = require("path"),
    // cookieParser = require('cookie-parser');
    request = require('request'),
    bodyParser = require('body-parser'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};
const app = express();
app.use(express.static(__dirname));
// app.use(cookieParser());
// app.use(bodyParser);
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

var server = http.createServer( app

);


// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

//Path location
app.get('/*',function(req, res) {
        
    // res.sendFile(path.join(__dirname + '/dist/index.html'))
    res.sendFile(path.join(__dirname + '/index.html'))
})


// console message
console.log('Server running at http://127.0.0.1:' + port + '/');
