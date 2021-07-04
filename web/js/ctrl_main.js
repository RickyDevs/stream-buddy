//  var secureCb;
//  var secureCbLabel;
var wsUri;
var consoleLog;
var connectBut;
var disconnectBut;
var sendMessage;
var sendBut;
var clearLogBut;
var websocket;
var PageElements = {
    CommandList: 'ul#command_list',
    ClearList: 'button#clear_command_list'
};
function echoHandlePageLoad() {
    if (document.getElementById('webSocketSupp') == undefined) {
        return;
    }
    // @ts-ignore
    if (window.WebSocket) {
        document.getElementById('webSocketSupp').style.display = 'block';
    }
    else {
        document.getElementById('noWebSocketSupp').style.display = 'block';
    }
    //    secureCb = document.getElementById('secureCb');
    //    secureCb.checked = false;
    //    secureCb.onclick = toggleTlS;
    //    secureCbLabel = document.getElementById('secureCbLabel')
    wsUri = document.getElementById('wsUri');
    //initializeLocation();
    // Connect if the user presses enter in the connect field.
    wsUri.onkeypress = function (e) {
        if (!e) {
            e = window.event;
        }
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            doConnect();
            return false;
        }
    };
    connectBut = document.getElementById('connect');
    connectBut.onclick = doConnect;
    disconnectBut = document.getElementById('disconnect');
    disconnectBut.onclick = doDisconnect;
    sendMessage = document.getElementById('sendMessage');
    // Send message if the user presses enter in the the sendMessage field.
    sendMessage.onkeypress = function (e) {
        if (!e) {
            e = window.event;
        }
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            doSend();
            return false;
        }
    };
    sendBut = document.getElementById('send');
    sendBut.onclick = doSend;
    var sendButAd = document.getElementById('sendAd');
    sendButAd.onclick = doSendAd;
    consoleLog = document.getElementById('consoleLog');
    clearLogBut = document.getElementById('clearLogBut');
    clearLogBut.onclick = clearLog;
    setGuiConnected(false);
    document.getElementById('disconnect').onclick = doDisconnect;
    document.getElementById('send').onclick = doSend;
    // 
    setTimeout(() => {
        connectToTwitch();
    }, 1000);
    $(PageElements.ClearList).on('click', clearCommandList);
}
function initializeLocation() {
    // See if the location was passed in.
    wsUri.value = getParameterByName('location');
    if (wsUri.value != '') {
        return;
    }
    var wsScheme = 'ws:';
    if (window.location.protocol.toString() == 'https:') {
        wsScheme = 'wss:';
        //      secureCb.checked = true;
    }
    var wsPort = (window.location.port.toString() == '' ? '' : ':' + window.location.port);
    wsUri.value = wsScheme + '//echo.websocket.org' + wsPort;
}
/*  function toggleTlS()
{
  if (secureCb.checked)
  {
    wsUri.value = wsUri.value.replace('ws:', 'wss:');
  }
  else
  {
    wsUri.value = wsUri.value.replace ('wss:', 'ws:');
  }
}
*/
function getParameterByName(name, url) {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)', 'i'), results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function doConnect() {
    console.log('do Connect');
    // @ts-ignore
    if (window.MozWebSocket) {
        logErrorToConsole('Info', 'This browser supports WebSocket using the MozWebSocket constructor');
        // @ts-ignore
        window.WebSocket = window.MozWebSocket;
    }
    // @ts-ignore
    else if (!window.WebSocket) {
        logErrorToConsole('ERROR', 'This browser does not have support for WebSocket');
        return;
    }
    // prefer text messages
    var uri = wsUri.value;
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
function doDisconnect() {
    websocket.close();
}
function doSend() {
    logTextToConsole('SENT: ' + sendMessage.value);
    websocket.send(sendMessage.value);
}
var __runAd;
function doSendAd() {
    __runAd();
}
function logTextToConsole(text) {
    console.log(text);
    //var span = document.createTextNode(text);
    //logElementToConsole(span);
    var commandList = $(PageElements.CommandList);
    //commandList.children().add(createCommandListItem(text));
    createCommandListItem(text).appendTo(commandList);
    //console.log(commandList);
}
// label is a string like 'Info' or 'Error'.
function logErrorToConsole(label, text) {
    var span = document.createElement('span');
    span.style.wordWrap = 'break-word';
    span.style.color = 'red';
    span.innerHTML = '<strong>' + label + ':</strong> ';
    var textNode = document.createTextNode(text);
    span.appendChild(textNode);
    logElementToConsole(span);
}
function logElementToConsole(element) {
    var p = document.createElement('p');
    p.style.wordWrap = 'break-word';
    //    p.innerHTML = getSecureTag();
    p.appendChild(element);
    consoleLog.appendChild(p);
    while (consoleLog.childNodes.length > 50) {
        consoleLog.removeChild(consoleLog.firstChild);
    }
    consoleLog.scrollTop = consoleLog.scrollHeight;
}
function onOpen(evt) {
    logTextToConsole('CONNECTED');
    setGuiConnected(true);
    // For convenience, put the cursor in the message field, and at the end of the text.
    sendMessage.focus();
    sendMessage.selectionStart = sendMessage.selectionEnd = sendMessage.value.length;
}
function onClose(evt) {
    logTextToConsole('DISCONNECTED');
    setGuiConnected(false);
}
function onMessage(evt) {
    var span = document.createElement('span');
    span.style.wordWrap = 'break-word';
    span.style.color = 'blue';
    span.innerHTML = 'RECEIVED: ';
    var message = document.createTextNode(evt.data);
    span.appendChild(message);
    logElementToConsole(span);
}
function onError(evt) {
    logErrorToConsole('ERROR', evt.data);
}
function setGuiConnected(isConnected) {
    wsUri.disabled = isConnected;
    connectBut.disabled = isConnected;
    disconnectBut.disabled = !isConnected;
    sendMessage.disabled = !isConnected;
    sendBut.disabled = !isConnected;
    //    secureCb.disabled = isConnected;
    var labelColor = 'black';
    if (isConnected) {
        labelColor = '#999999';
    }
    //    secureCbLabel.style.color = labelColor;
}
function clearLog() {
    while (consoleLog.childNodes.length > 0) {
        consoleLog.removeChild(consoleLog.lastChild);
    }
}
/*  function getSecureTag()
{
  if (secureCb.checked)
  {
    return '<img src="img/tls-lock.png" width="6px" height="9px"> ';
  }
  else
  {
    return '';
  }
}
*/
function createCommandListItem(text) {
    var li = $('<li></li>', {
        class: "list-primary"
    });
    var title = $(`<div class="task-title"> <span class="task-title-sp">${text}</span> </div>`);
    var badge = $('<span class="badge bg-theme">Done</span>');
    badge.appendTo(title);
    var controls = $('<div class="pull-right">' +
        '<button class="btn btn-success"></button>' +
        '<button class="btn btn-primary"></button>' +
        '<button class="btn btn-danger"></button>' +
        '</div>');
    controls.appendTo(title);
    title.appendTo(li);
    return li;
}
function clearCommandList() {
    $(PageElements.CommandList).empty();
}
class CommandProcessor {
    constructor(websocket) {
        this._comsumer = websocket;
    }
    send(user, command, message, flags, extra) {
        if (command === "robot") {
            if (this._comsumer) {
                this._comsumer.send(JSON.stringify({
                    from: user,
                    cmd: message
                }));
            }
        }
        if (command === "so") {
            if (this._comsumer) {
                this._comsumer.send(JSON.stringify({
                    from: user,
                    cmd: "so " + message
                }));
            }
        }
    }
}
function connectToTwitch() {
    var _nextDoorbell = 0;
    var _command;
    function runAd() {
        if (!_command) {
            _command = new CommandProcessor(websocket);
        }
        var message = "Queres Ajudar o canal de forma gratuita? Escreve /host rickydevs no chat do TEU canal para dar host a este streamer. Obrigado!";
        _command.send('', 'robot', 'talk ' + message, undefined, undefined);
        logTextToConsole('SENT: ' + message);
    }
    __runAd = runAd;
    // @ts-ignore
    ComfyJS.onCommand = (user, command, message, flags, extra) => {
        console.log(user, command, message, flags, extra);
        if (!_command) {
            _command = new CommandProcessor(websocket);
        }
        _command.send(user, command, message, flags, extra);
        logTextToConsole('SENT: ' + message);
    };
    // @ts-ignore
    ComfyJS.onChat = function (user, message, flags, self, extra) {
        if (user == 'SoundAlerts') {
            return;
        }
        var now = Date.now();
        if (_nextDoorbell < now) {
            var player = $('audio#player');
            player[0].play();
            console.log('doorbell com' + user);
            setTimeout(runAd, 60 * 1000);
        }
        _nextDoorbell = now + (3 * 60 * 1000);
    };
    // @ts-ignore
    ComfyJS.onConnected = function (address, port, isFirstConnect) {
        logTextToConsole('connected to twitch');
    };
    // @ts-ignore
    ComfyJS.Init("rickydevs");
}
window.addEventListener('load', echoHandlePageLoad, false);
