
import * as http from "http";
import fs from 'fs';
import path from 'path';
import URL from 'url';

var fsp = fs.promises;


var rootPath = path.join(__dirname, "/../../web");
console.log(rootPath)

var mimeTypes: {[ext: string]: string} = {
	html: "text/html",
	js: 'application/javascript',
	css: 'text/css',
	wav: 'audio/wav'
}


const requestListener: http.RequestListener = function (req, res) {
	var url = URL.parse(String(req.url)).pathname;

	function logResponse(file: string, mimeType: string) {
		console.log(req.method, url, '-', mimeType);
	}

	function sendError(err: any) {
		res.writeHead(500);
		res.end(err);
		logResponse(String(url), '500');
	}




	var mimeType = mimeTypes.html;
	if (url == '/') {
		fsp.readFile(path.join(rootPath, "index.html"))
        .then(contents => {
            res.setHeader("Content-Type", mimeType);
            res.writeHead(200);
			res.end(contents);
			logResponse("index.html", mimeType);
        })
        .catch(sendError);
	} else {
		var filePath = path.join(rootPath, '.' + url)
		if (fs.existsSync(filePath)) {
			var fileExt = path.extname(filePath).replace('.', '');
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
		} else {
			sendError('not found');
		}
	}
};

const host = '0.0.0.0', port = 8081;

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});





import WebSocket = require('ws');

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
    const url = URL.parse(String(req.url)).pathname;
	return url == '/ws';
}