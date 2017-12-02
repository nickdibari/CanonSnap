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
    let width = frame.width;
    let height = frame.height;
    let horizontal = frame.angle.horizontal;
    let tilt = frame.angle.tilt;
    let type = frame.detection.type;

    // Find Human Subjects in frame
    if (type === 'Human'){
        console.log('Got a live one!');
        var subjects = frame.detection.subjects;
        var len = frame.detection.subjects.length;
        let subjectList = [];

        for (let i = 0; i < len; i++){
            var human = {};
            var id = subjects[i].subjectID;
            var cenX = subjects[i].centerX;
            var cenY = subjects[i].centerY;
            var leftEyeX = subjects[i].leftEyeX;
            var leftEyeY = subjects[i].leftEyeY;
            var rightEyeX = subjects[i].rightEyeX;
            var rightEyeY = subjects[i].rightEyeY;
            human = {
                id: id,
                width: width,
                height: height,
                horizontal: horizontal,
                tilt: tilt,
                cenX: cenX,
                cenY: cenY,
                leftEyeX: leftEyeX,
                leftEyeY: leftEyeY,
                rightEyeX: rightEyeX,
                rightEyeY: rightEyeY,
            };
            console.log('Properly parsed Human: ' + id);
            subjectList.push(human)
            console.log(subjectList)
        }
    }

    else{
        console.log('No humans here..')
    }
}
