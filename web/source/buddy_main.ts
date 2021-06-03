

import { initBuddy, fadeToActionAndRestore, isActionValid, rotateBy } from './buddy_three.js';
import { doConnect } from './buddy_ws.js';

function handlePageLoad() {

	initBuddy();

	/*setInterval(() => {
		console.log('Wave');
		fadeToActionAndRestore( 'Wave', 0.5 );
	}, 8000);*/



	doConnect('ws://192.168.1.18:8080', (command: string) => {
		console.log(command);
		var cmd = command.trim();
		if (isActionValid(cmd)) {
			fadeToActionAndRestore(cmd, 0.2);
		} else {
			if (command.startsWith('Rotate')) {
				var param = command.split(' ');

				rotateBy(parseInt(param[1]));

				return;
			} 


			fadeToActionAndRestore("No", 0.4);
		}
	});
}

window.addEventListener('load', handlePageLoad, false);

