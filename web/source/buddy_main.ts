

import { initBuddy, fadeToActionAndRestore, isActionValid, rotateBy, changeColor } from './buddy_three.js';
import { doConnect, MessageProcessor } from './buddy_ws.js';

// Free tts  - https://freetts.com/Home/PlayAudio?Language%3Dpt-PT%26Voice%3DCristiano_Male%26TextMessage%3Dcatano%26id%3DCristiano%26type%3D1


var wsBuddy = 'ws://192.168.1.18:8081/ws';

interface Command {
	from: string;
	cmd: string;
}

export class BuddyHandler {
	constructor() {
	}
	isActionValid(cmd: string): boolean {
		return isActionValid(cmd);
	}
	fadeToActionAndRestore(cmd: string, timeout: number): void {
		console.log(cmd)
		fadeToActionAndRestore(cmd, timeout);
	}
	findBubbleByTextLen(len: number): string {
		if (len > 80) {
			return 'buddy_bubble_3lines';
		}
		if (len > 35) {
			return 'buddy_bubble_2lines';
		}
		return 'buddy_bubble';
	}
	showBubble(bubbleText: string, html?: boolean, timeout?: number) {
		var bubble = document.getElementById(this.findBubbleByTextLen(bubbleText.length));
		if (html) {
			bubble.innerHTML = bubbleText;
		} else {
			bubble.innerText = bubbleText;
		}

		setTimeout(function() {
			console.log('show hello', bubble.innerText)
			bubble.style.opacity = "1";
		}, 500);
		setTimeout(function() {
			console.log('hide hello', bubble.innerText)
			bubble.style.opacity = "0";
		}, timeout > 0? timeout : 4000);
	}

	changeColor(color: string) {
		changeColor(color);
	}
}


export class BuddyMessageProcessor extends MessageProcessor {
	_buddyHandler: BuddyHandler;

	constructor(buddyHandler: BuddyHandler) {
		super();
		this._buddyHandler = buddyHandler;
	}

	onMessage(data: string): void {
		console.log(data);
		var command = {
			from: '',
			cmd: data
		}
		if (data.trim().startsWith('{')) {
			command = JSON.parse(data);
		}

		var cmd = command.cmd.trim();

		if (!cmd) {
			command.cmd = cmd = 'hello';
		}

		if (this._buddyHandler.isActionValid(cmd)) {
			this._buddyHandler.fadeToActionAndRestore(cmd, 0.2);
		} else {
			if (this.specialCommand(command)) {
				return;
			}
			// on error...
			this._buddyHandler.fadeToActionAndRestore("No", 0.4);
		}
	}
	specialCommand(command: Command): boolean {
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
			const textLimit = 140, timePerLetter = 110, minTimeToShow = 4000;
			var talkText = cmd.substr(5, textLimit).trim();
			var time = Math.max(minTimeToShow, talkText.length * timePerLetter);
			if ((talkText.length > 0) && !talkText.includes('<') && !talkText.includes('>')) {
				this._buddyHandler.showBubble(talkText.substr(0,1).toUpperCase() + talkText.substr(1), false, time);
			}
			return true;
		}

		if (cmd.startsWith('so ')) {
			var soUser = this.sanitizeUsername(cmd.substr(2));
			if (soUser.length > 0) {
				this._buddyHandler.fadeToActionAndRestore('thumbsup', 0.2);
		
				this._buddyHandler.showBubble(`Partilhem o apoio com o streamer <b>${soUser}</b>! Vão lá e façam follow!`, true, 9000);
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

	private sanitizeUsername(rawUsername: string) {
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

