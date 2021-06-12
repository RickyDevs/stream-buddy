//-----------------------------------
//import { CommandProcessor } from '../ctrl_main';
import { MessageProcessor } from '../buddy_ws.js';
import { BuddyHandler, BuddyMessageProcessor } from '../buddy_main.js';
class MockMessageProcessor extends MessageProcessor {
    onMessage(msg) {
        //animation = msg;
    }
}
class MockBuddyHandler extends BuddyHandler {
    constructor(output) {
        super();
        this._output = output;
    }
    fadeToActionAndRestore(cmd, timeout) {
        this._output.animation = cmd;
    }
    showBubble(bubbleText) {
        console.log('Show bubble', bubbleText);
        this._output.bubbleText = bubbleText;
    }
    changeColor(color) {
        this._output.robotColor = color;
    }
}
var mockWebSocket = {
    animation: undefined,
    bubbleText: undefined,
    robotColor: undefined,
    send: function (message) {
        this.animation = '';
        this.bubbleText = '';
        this.robotColor = '';
        new BuddyMessageProcessor(new MockBuddyHandler(this)).onMessage(String(message));
    }
};
var testUser = 'TestUser', robotCommand = 'robot';
var commandParameter = {
    NoArg: '',
    Wave: 'wave ',
    Yes: 'yes',
    No: 'no',
    Punch: 'punch',
    ThumbsUp: 'thumbsup',
    Jump: 'jump',
    Talk: 'talk ',
    SO: 'so ',
    Ola: 'ola ',
    Dance: 'dance',
    Walk: 'walk',
    Run: 'run',
    ChangeColor: 'color '
};
QUnit.module('Insta cmd');
QUnit.test("Simple command, no parameters, expected default animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.NoArg);
    assert.equal(mockWebSocket.animation, "wave", "The default animation should be 'wave' ");
    assert.equal(mockWebSocket.bubbleText, "Hello TestUser!", "The default animation should have a bubble");
});
QUnit.test("Simple Yes, param: 'yes', expected 'yes' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Yes);
    assert.equal(mockWebSocket.animation, "yes", "The animation should be 'yes' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Simple No, param: 'no', expected 'no' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.No);
    assert.equal(mockWebSocket.animation, "no", "The animation should be 'no' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Simple wave, param: 'wave', expected 'Wave' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Wave);
    assert.equal(mockWebSocket.animation, "wave", "The animation should be 'wave' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Simple punch, param: 'punch', expected 'Punch' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Punch);
    assert.equal(mockWebSocket.animation, "punch", "The animation should be 'punch' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Simple Thumbs up, param: 'thumbsup', expected 'thumbsup' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.ThumbsUp);
    assert.equal(mockWebSocket.animation, "thumbsup", "The animation should be 'thumbsup' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Simple jump, param: 'jump', expected 'Jump' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Jump);
    assert.equal(mockWebSocket.animation, "jump", "The animation should be 'jump' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Simple custom talk, param: 'talk ...', No animation expected", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Talk + 'This is a Test!');
    assert.equal(mockWebSocket.animation, "", "The animation should be '' ");
    assert.equal(mockWebSocket.bubbleText, "This is a Test!", "The animation should have a bubble");
});
QUnit.module('SO cmd');
var soBubbleTextPrefix = 'Partilhem o apoio com o streamer <b>', soBubbleTextSufix = '</b>! Vão lá e façam follow!';
QUnit.test("SO command , param: 'so name' without @, Thumbs Up animation expected", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.SO + testUser);
    assert.equal(mockWebSocket.animation, "thumbsup", "The animation should be 'jump' ");
    assert.equal(mockWebSocket.bubbleText, soBubbleTextPrefix + testUser + soBubbleTextSufix, "The animation should have a bubble");
});
QUnit.test("SO command , param: 'so name' with @, Thumbs Up animation expected", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.SO + "@" + testUser);
    assert.equal(mockWebSocket.animation, "thumbsup", "The animation should be 'jump' ");
    assert.equal(mockWebSocket.bubbleText, soBubbleTextPrefix + testUser + soBubbleTextSufix, "The animation should have a bubble");
});
QUnit.test("SO command direct, command 'so' param: 'name' with @, Thumbs Up animation expected", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, commandParameter.SO.trim(), "@" + testUser);
    assert.equal(mockWebSocket.animation, "thumbsup", "The animation should be 'jump' ");
    assert.equal(mockWebSocket.bubbleText, soBubbleTextPrefix + testUser + soBubbleTextSufix, "The animation should have a bubble");
});
var olaBubbleTextPrefix = 'Olá ', olaBubbleTextSufix = '!';
QUnit.test("Olá command , param: 'ola name' with @, Wave animation expected", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Ola + "@" + testUser);
    assert.equal(mockWebSocket.animation, "wave", "The animation should be 'wave' ");
    assert.equal(mockWebSocket.bubbleText, olaBubbleTextPrefix + testUser + olaBubbleTextSufix, "The animation should have a bubble");
});
QUnit.module('Long cmd');
QUnit.test("Dance, param: 'dance', expected 'Dance' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Dance);
    assert.equal(mockWebSocket.animation, "dance", "The animation should be 'dance' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Walk, param: 'walk', expected 'Walking' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Walk);
    assert.equal(mockWebSocket.animation, "walk", "The animation should be 'Walking' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Run, param: 'run', expected 'Running' animation", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.Run);
    assert.equal(mockWebSocket.animation, "run", "The animation should be 'Running' ");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
});
QUnit.test("Change color, param: 'color pink', no animation expected", assert => {
    new CommandProcessor(mockWebSocket)
        .send(testUser, robotCommand, commandParameter.ChangeColor + 'pink');
    assert.equal(mockWebSocket.animation, "", "No animation should be running");
    assert.equal(mockWebSocket.bubbleText, "", "The animation shouldn't have a bubble");
    assert.equal(mockWebSocket.robotColor, "pink", "The color should be pink");
});
