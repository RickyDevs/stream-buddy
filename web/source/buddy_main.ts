

import { initBuddy, fadeToActionAndRestore, isActionValid, rotateBy, changeColor } from './buddy_three.js';
import { doConnect } from './buddy_ws.js';

interface Command {
	from: string;
	cmd: string;
}

function specialCommand(command: Command): boolean {
	var cmd = command.cmd.trim();
	if (cmd.startsWith('rotate ')) {
		var param = cmd.split(' ');

		rotateBy(parseInt(param[1]));

		return true;
	} 
	if (cmd.startsWith('color ')) {
		var param = cmd.split(' ');

		changeColor(param[1]);

		return true;
	}

	if (cmd.startsWith('hello')) {
		var bubble = document.getElementById('buddy_bubble');
		bubble.innerText = 'Hello ' + command.from + '!';

		fadeToActionAndRestore('wave', 0.2);
		setTimeout(function() {
			console.log('show hello', bubble.innerText)
			bubble.style.opacity = "1";
		}, 500);
		setTimeout(function() {
			console.log('hide hello', bubble.innerText)
			bubble.style.opacity = "0";
		}, 4000);
		return true;
	}

	return false;
}


function handlePageLoad() {
	var container = document.getElementById( 'info' );
	initBuddy(container);

	doConnect('ws://192.168.1.18:8080', (data: string) => {
		console.log(data);
		var command = {
			from: '',
			cmd: data
		}
		if (data.trim().startsWith('{')) {
			command = JSON.parse(data);
		}

		var cmd = command.cmd.trim();


		if (isActionValid(cmd)) {
			fadeToActionAndRestore(cmd, 0.2);
		} else {
			if (specialCommand(command)) {
				return;
			}
			// on error...
			fadeToActionAndRestore("No", 0.4);
		}
	});

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

