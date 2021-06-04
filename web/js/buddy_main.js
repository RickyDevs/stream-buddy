import { initBuddy, fadeToActionAndRestore, isActionValid, rotateBy, changeColor } from './buddy_three.js';
import { doConnect } from './buddy_ws.js';
function handlePageLoad() {
    initBuddy();
    doConnect('ws://192.168.1.18:8080', (command) => {
        console.log(command);
        var cmd = command.trim();
        if (isActionValid(cmd)) {
            fadeToActionAndRestore(cmd, 0.2);
        }
        else {
            if (command.startsWith('rotate')) {
                var param = command.split(' ');
                rotateBy(parseInt(param[1]));
                return;
            }
            if (command.startsWith('color')) {
                var param = command.split(' ');
                changeColor(param[1]);
                return;
            }
            fadeToActionAndRestore("No", 0.4);
        }
    });
}
window.addEventListener('load', handlePageLoad, false);
