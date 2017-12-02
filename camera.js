'use strict';

const Camera = require('howielib').MMCamera;
const Discovery = require('howielib').Discovery;
const logger = require('howielib').Logger;

logger.setLevel('info');

let camera = new Camera();

camera.ipConnect(onConnect);

function onConnect (responseCode) {
    if (responseCode !== 'OK'){
        console.log('Problem connecting to camera: ' + responseCode);
        return;
    }

    else{
        console.log('Connected OK!');
        camera.startStream(onFrame);
    }
}

function onFrame (frame) {
    // Get image metadata
    var width = frame.width;
    var height = frame.height; 
    var horizontal = frame.angle.horizontal; 
    var tilt = frame.angle.tilt; 
    var type = frame.description.type
}
