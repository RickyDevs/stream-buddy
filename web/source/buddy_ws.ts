

var websocket: WebSocket;
var tryReopen = 0;

export abstract class MessageProcessor {
    constructor() {
    }

    abstract onMessage(msg: string): void; 
}


var _messageProcessor: MessageProcessor;


export function doConnect(uri: string, messageProcessor: MessageProcessor) {

	if (messageProcessor) {
        _messageProcessor = messageProcessor;
    }
    
    console.log('do Connect', uri);
    // @ts-ignore
    if (window.MozWebSocket) {
        console.info('This browser supports WebSocket using the MozWebSocket constructor');
        // @ts-ignore
        window.WebSocket = window.MozWebSocket;
    
    } 
    // @ts-ignore
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
    console.log(event.data, JSON.stringify(event.data));
    if ((typeof event.data == 'string') && _messageProcessor) {
		_messageProcessor.onMessage(event.data);
    }
}