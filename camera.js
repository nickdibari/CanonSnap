'use strict';

const Camera = require('howielib').MMCamera;
const logger = require('howielib').Logger;
const assert = require('assert');
const fs = require('fs');

logger.setLevel('info');

let HUMAN_IDS = [];

let camera = new Camera();

camera.ipConnect(onConnect);

function onConnect (responseCode) {
    // Callback function to ipConnect
    // Logs error if received, else starts stream
    if (responseCode !== 'OK'){
        console.error('Problem connecting to camera: ' + responseCode);
        return;
    }

    else{
        console.log('Connected OK!');
        camera.startStream(onFrame);
    }
}

function onFrame (frame) {
    // Callback function to startStream
    // Takes in a frame object and determines if the image should be saved
    // If it should, writes to a JPG file
    let type = frame.detection.type;

    // Find Human Subjects in frame
    // Determine if Snap should be taken
    if (type === 'Human'){
        console.log('Got a live one!');
        let subjectList = handleHumans(frame);

        var takePicture = determineSnap(subjectList);

        if (takePicture){
            // Get image from frame
            let img = frame.image;
            console.log('Got picture OK');
            fs.writeFile('tmp.jpg', img, function (err) {
                if (err){
                    console.error('Error writing image to file: ' + err)
                }
            });
        }
    }

    else{
        console.log('No humans here..');
    }
}

function handleHumans(frame){
    // Pull image on humans in a frame
    // Takes in a frame object and returns a list of objects corresponding to
    // each human in the frame
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
            shake: frame.shake,
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
    // Determine if the frame image should be saved
    // Set to take a picture if there is a new human in the frame
    // or there is a group of people in the frame
    let takePicture = 0;
    let threshold = 10;

    let newSubject = newPerson(subjectList);

    if (newSubject){
        console.log('Got a new person!');
        takePicture += 10;
    }

    if (subjectList.length > 1){
        console.log('Got a group!');
        takePicture += 5;
    }

    // Check if picture is blurred
    if (subjectList[0].shake !== 'SmallVibration'){
        takePicture -= 2;
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
