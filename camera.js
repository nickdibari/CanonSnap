'use strict';

const Camera = require('howielib').MMCamera;
const Discovery = require('howielib').Discovery;
const logger = require('howielib').Logger;
const assert = require('assert');

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
    let type = frame.detection.type;

    // Find Human Subjects in frame
    // Determine if Snap should be taken
    if (type === 'Human'){
        console.log('Got a live one!');
        let subjectList = handleHumans(frame);

        var takePicture = determineSnap(subjectList);

        if (takePicture){
            console.log('Taking picture!!!!')
            camera.snap().then((response) => {
                assert(response.code === 'OK');

                // Get the picture from the camera
                camera.getLastImage().then((items) => {
                    let img = items[0].image;
                    console.log('Got image OK!')
                })

                .catch((error) => {
                    console.error('Cannot get picture: ' + error);
                })

            })
            .catch((error) => {
                console.error('Cannot take picture: ' + error);
            });
        }
    }

    else{
        console.log('No humans here..');
    }
}

function handleHumans(frame){
    var subjects = frame.detection.subjects;
    var len = frame.detection.subjects.length;
    let subjectList = [];

    for (let i = 0; i < len; i++){
        // Get image metadata
        let subject = {
            width: frame.width,
            height: frame.height,
            horizontal: frame.angle.horizontal,
            tilt: frame.angle.tilt,
            type: frame.detection.type,
            img: frame.image,
        };

        // Get subject data
        subject.id = subjects[i].subjectID;
        subject.cenX = subjects[i].centerX;
        subject.cenY = subjects[i].centerY;
        subject.leftEyeX = subjects[i].leftEyeX;
        subject.leftEyeY = subjects[i].leftEyeY;
        subject.rightEyeX = subjects[i].rightEyeX;
        subject.rightEyeY = subjects[i].rightEyeY;

        subjectList.push(subject);
        console.log('Properly parsed Human: ' + subject.id);
    }

    return subjectList;
}

function determineSnap(subjectList){
    let takePicture = 0;
    let threshold = 10;

    let newSubject = newPerson(subjectList);

    if (newSubject){
        console.log('Got a new person!')
        takePicture += 10;
    }

    if (subjectList.length > 1){
        console.log('Got a group!')
        takePicture += 10;
    }

    return takePicture >= threshold;
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
