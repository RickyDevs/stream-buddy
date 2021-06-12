import { initBuddy, fadeToActionAndRestore, isActionValid, rotateBy, changeColor } from './buddy_three.js';
import { doConnect, MessageProcessor } from './buddy_ws.js';
var wsBuddy = 'ws://192.168.1.18:8081/ws';
export class BuddyHandler {
    constructor() {
    }
    isActionValid(cmd) {
        return isActionValid(cmd);
    }
    fadeToActionAndRestore(cmd, timeout) {
        console.log(cmd);
        fadeToActionAndRestore(cmd, timeout);
    }
    showBubble(bubbleText, html) {
        var bubble = document.getElementById('buddy_bubble');
        if (html) {
            bubble.innerHTML = bubbleText;
        }
        else {
            bubble.innerText = bubbleText;
        }
        setTimeout(function () {
            console.log('show hello', bubble.innerText);
            bubble.style.opacity = "1";
        }, 500);
        setTimeout(function () {
            console.log('hide hello', bubble.innerText);
            bubble.style.opacity = "0";
        }, 4000);
    }
    changeColor(color) {
        changeColor(color);
    }
}
export class BuddyMessageProcessor extends MessageProcessor {
    constructor(buddyHandler) {
        super();
        this._buddyHandler = buddyHandler;
    }
    onMessage(data) {
        console.log(data);
        var command = {
            from: '',
            cmd: data
        };
        if (data.trim().startsWith('{')) {
            command = JSON.parse(data);
        }
        var cmd = command.cmd.trim();
        if (!cmd) {
            command.cmd = cmd = 'hello';
        }
        if (this._buddyHandler.isActionValid(cmd)) {
            this._buddyHandler.fadeToActionAndRestore(cmd, 0.2);
        }
        else {
            if (this.specialCommand(command)) {
                return;
            }
            // on error...
            this._buddyHandler.fadeToActionAndRestore("No", 0.4);
        }
    }
    specialCommand(command) {
        var cmd = command.cmd.trim();
        if (cmd.startsWith('rotate ')) {
            var param = cmd.split(' ');
            rotateBy(parseInt(param[1]));
            return true;
        }
        if (cmd.startsWith('color ')) {
            var param = cmd.split(' ');
            this._buddyHandler.changeColor(param[1]);
            return true;
        }
        if (cmd.startsWith('hello')) {
            this._buddyHandler.fadeToActionAndRestore('wave', 0.2);
            this._buddyHandler.showBubble('Hello ' + command.from + '!');
            return true;
        }
        if (cmd.startsWith('talk ')) {
            var talkText = cmd.substr(5).trim();
            if ((talkText.length > 0) && !talkText.includes('<') && !talkText.includes('>')) {
                this._buddyHandler.showBubble(talkText.substr(0, 1).toUpperCase() + talkText.substr(1));
            }
            return true;
        }
        if (cmd.startsWith('so ')) {
            var soUser = this.sanitizeUsername(cmd.substr(2));
            if (soUser.length > 0) {
                this._buddyHandler.fadeToActionAndRestore('thumbsup', 0.2);
                this._buddyHandler.showBubble(`Partilhem o apoio com o streamer <b>${soUser}</b>! Vão lá e façam follow!`, true);
            }
            return true;
        }
        if (cmd.startsWith('ola ')) {
            var olaUser = this.sanitizeUsername(cmd.substr(3));
            if (olaUser.length > 0) {
                this._buddyHandler.fadeToActionAndRestore('wave', 0.2);
                this._buddyHandler.showBubble(`Olá ${olaUser}!`);
            }
            return true;
        }
        return false;
    }
    sanitizeUsername(rawUsername) {
        var user = rawUsername.trim();
        if (user.startsWith('@')) {
            user = user.substring(1);
        }
        return user;
    }
}
function handlePageLoad() {
    var container = document.getElementById('info');
    if (!container) {
        return;
    }
    initBuddy(container);
    doConnect(wsBuddy, new BuddyMessageProcessor(new BuddyHandler()));
    //handleBubble()
}
/*
function handleBubble() {
    var aspect = window.innerWidth / window.innerHeight;

    var bubble = document.getElementById('buddy_bubble_position');

    bubble.style.top = (window.innerHeight * 0.5 - aspect).toFixed(0) + 'px';
    console.log('handleBubble', window.innerHeight, aspect);
}*/
window.addEventListener('load', handlePageLoad, false);
//window.addEventListener('resize', handleBubble, false);
