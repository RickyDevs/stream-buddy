"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
var fsp = fs_1.default.promises;
var rootPath = path_1.default.join(__dirname, "/../../web");
console.log(rootPath);
var mimeTypes = {
    html: "text/html",
    js: 'application/javascript',
    css: 'text/css',
    wav: 'audio/wav'
};
const requestListener = function (req, res) {
    var url = url_1.default.parse(String(req.url)).pathname;
    function logResponse(file, mimeType) {
        console.log(req.method, url, '-', mimeType);
    }
    function sendError(err) {
        res.writeHead(500);
        res.end(err);
        logResponse(String(url), '500');
    }
    var mimeType = mimeTypes.html;
    if (url == '/') {
        fsp.readFile(path_1.default.join(rootPath, "index.html"))
            .then(contents => {
            res.setHeader("Content-Type", mimeType);
            res.writeHead(200);
            res.end(contents);
            logResponse("index.html", mimeType);
        })
            .catch(sendError);
    }
    else {
        var filePath = path_1.default.join(rootPath, '.' + url);
        if (fs_1.default.existsSync(filePath)) {
            var fileExt = path_1.default.extname(filePath).replace('.', '');
            if (mimeTypes.hasOwnProperty(fileExt)) {
                mimeType = mimeTypes[fileExt];
            }
            fsp.readFile(filePath)
                .then(contents => {
                res.setHeader("Content-Type", mimeType);
                res.writeHead(200);
                res.end(contents);
                logResponse(filePath, mimeType);
            })
                .catch(sendError);
        }
        else {
            sendError('not found');
        }
    }
};
const host = '0.0.0.0', port = 8081;
const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
    console.log('client connect');
    ws.on('message', function incoming(data) {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
    //ws.send('something');
});
wss.shouldHandle = function (req) {
    const url = url_1.default.parse(String(req.url)).pathname;
    return url == '/ws';
};
