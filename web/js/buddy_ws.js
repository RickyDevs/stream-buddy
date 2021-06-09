var websocket;
var tryReopen = 0;
export class MessageProcessor {
    constructor() {
    }
}
var _messageProcessor;
export function doConnect(uri, messageProcessor) {
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
    }
    else {
        uri += '&encoding=text';
    }
    websocket = new WebSocket(uri);
    websocket.onopen = function (evt) { onOpen(evt); };
    websocket.onclose = function (evt) { onClose(evt); };
    websocket.onmessage = function (evt) { onMessage(evt); };
    websocket.onerror = function (evt) { onError(evt); };
}
function onOpen(event) {
    console.log('WS is open');
    tryReopen = 3;
}
function onClose(event) {
    websocket = undefined;
    if (tryReopen == 0) {
        return;
    }
    console.log('Retry open WS', tryReopen);
    tryReopen--;
    setTimeout(doConnect, 2000);
}
function onError(event) {
    console.error('WS Error', event);
}
function onMessage(event) {
    if ((typeof event.data == 'string') && _messageProcessor) {
        _messageProcessor.onMessage(event.data);
    }
}
