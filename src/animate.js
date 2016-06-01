"use strict";

var animate = require("jibo").animate;
var animationArr = ["dance", "excited", "greeting"];
var basePath = "animations/";
var gBuilder = {};
var isComplete = false;
var isPause = false;

for (var i = 0; i < animationArr.length; i++) {
    createBuilder(animationArr[i]);
}
function setComplete() {
    isComplete = true;
}
function resetComplete() {
    isComplete = false;
}
function setPause() {
    isPause = true;
}
function resetPause() {
    isPause = false;
}
function chooseTypeToPlay() {
    var type = (1 + Math.floor(Math.random() * 3)) % 3;
    gBuilder[animationArr[type]].play();
}
function createBuilder(animation) {
  var animPath = basePath + animation + ".keys";
    animate.createAnimationBuilderFromKeysPath(animPath, basePath, (builder) =>{
    builder.on(animate.AnimationEventType.STOPPED, (eventType, instance, payload) =>{
        //console.log("Animation stopped; was interrupted = " + animation + payload.interrupted);
        console.log("isComplete:" + isComplete + "   isPause:" + isPause);
        if ((!isComplete) && (!isPause)) {
          chooseTypeToPlay();
        }
    });
    gBuilder[animation] = builder;
    console.log("create " + animation + " OK");
  })
}


exports.setPause = setPause;
exports.resetPause = resetPause;
exports.setComplete = setComplete;
exports.resetComplete = resetComplete;
exports.chooseTypeToPlay = chooseTypeToPlay;
