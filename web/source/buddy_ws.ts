

var websocket: WebSocket;
var tryReopen = 0;

var messageCallback: (command: string) => void

export function doConnect(uri: string, messageCb: (command: string) => void) {

	if (messageCb) {
        messageCallback = messageCb;
    }
    
    console.log('do Connect', uri);
    // @ts-ignore
    if (window.MozWebSocket) {
        console.info('This browser supports WebSocket using the MozWebSocket constructor');
        // @ts-ignore
        window.WebSocket = window.MozWebSocket;
    }
    else if (!window.WebSocket) {
        console.error('This browser does not have support for WebSocket');
        return;
    }

    // prefer text messages
    //var uri = //wsUri.value;
    if (uri.indexOf('?') == -1) {
        uri += '?encoding=text';
    } else {
        uri += '&encoding=text';
    }
    websocket = new WebSocket(uri);
    websocket.onopen = function (evt: Event) { onOpen(evt) };
    websocket.onclose = function (evt: CloseEvent) { onClose(evt) };
    websocket.onmessage = function (evt: MessageEvent) { onMessage(evt) };
    websocket.onerror = function (evt) { onError(evt) };
}


function onOpen(event: Event) {
    console.log('WS is open');
    tryReopen = 3;
}

function onClose(event: CloseEvent) {
    websocket = undefined;
    if (tryReopen == 0) {
        return;
    }
    console.log('Retry open WS', tryReopen);
    tryReopen--;
    setTimeout(doConnect, 2000);
}

function onError(event: Event) {
  console.error('WS Error', event);
}

function onMessage(event: MessageEvent) {
    if ((typeof event.data == 'string') && messageCallback) {
		messageCallback(event.data);
    }
}