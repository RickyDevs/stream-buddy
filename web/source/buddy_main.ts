

import { initBuddy, fadeToActionAndRestore, isActionValid, rotateBy, changeColor } from './buddy_three.js';
import { doConnect, MessageProcessor } from './buddy_ws.js';

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
		fadeToActionAndRestore(cmd, timeout);
	}
	showBubble(bubbleText: string) {
		var bubble = document.getElementById('buddy_bubble');
		bubble.innerText = bubbleText;

		setTimeout(function() {
			console.log('show hello', bubble.innerText)
			bubble.style.opacity = "1";
		}, 500);
		setTimeout(function() {
			console.log('hide hello', bubble.innerText)
			bubble.style.opacity = "0";
		}, 4000);
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
		console.log(command);
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

		if (cmd.startsWith('talk')) {

			this._buddyHandler.showBubble(cmd.substr(5));
			return true;
		}

		return false;
	}
}

function handlePageLoad() {
	var container = document.getElementById('info');
	if (!container) {
		return;
	}

	initBuddy(container);
	doConnect('ws://192.168.1.18:8080', new BuddyMessageProcessor(new BuddyHandler()));

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

