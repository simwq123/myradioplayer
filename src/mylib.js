function getMp3FileName() {
	var fs = require("fs");
  var fileArr = fs.readdirSync("./audio/");
  var mp3Arr = [];
  for (var i in fileArr) {
    if(/.mp3$/.test(fileArr[i]))
      mp3Arr.push(fileArr[i]);
  }
  return mp3Arr;
}
exports.getMp3FileName = getMp3FileName;
