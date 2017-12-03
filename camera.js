'use strict';

const Camera = require('howielib').MMCamera;
const Discovery = require('howielib').Discovery;
const logger = require('howielib').Logger;

logger.setLevel('info');

let HUMAN_IDS = [];

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
    let img = frame.image;

    // Find Human Subjects in frame
    // Determine if Snap should be taken
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
                img: img,
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
            subjectList.push(human);
        }

        var takePicture = determineSnap(subjectList);

        if (takePicture){
            console.log('Taking picture!!!!')
        }
    }

    else{
        console.log('No humans here..')
    }
}

function determineSnap(subjectList){
    let takePicture = 0;

    let newSubject = newPerson(subjectList);

    if (newSubject){
        console.log('Got a new person!')
        takePicture += 10;
    }

    return takePicture >= 10;
}

function newPerson(subjectList){
    // Parse list of subjects to see if there are any new people in group
    let newPerson = false;
    let len = subjectList.length;

    for(let i=0; i<len; i++){
        if (!inArray(subjectList[i].id, HUMAN_IDS)){
            newPerson = true; // Found human in list of subjects not in global array
        }
    }

    // Repopulate global list
    HUMAN_IDS = [];
    for(let j=0; j<len; j++){
        HUMAN_IDS[j] = subjectList[j].id;
    }

    return newPerson;
}

function inArray(needle, haystack){
    // Determine if the needle is in the haystack
    let len = haystack.length;

    for(let i=0; i<len; i++){
        if (haystack[i] === needle){
            return true;
        }
    }

    return false;
}
