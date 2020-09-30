var express = require('express');
var router = express.Router();
var multer = require('multer');
var AWS = require('aws-sdk');
var storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  }
});
var multipleUpload = multer({ storage: storage }).array('file');
var upload = multer({ storage: storage }).single('file');

router.post('/upload', multipleUpload, function (req, res) {
  let error = false;
  const file = req.files;

  Object.values(file).forEach((f) => {
    console.log(f)
  })

  AWS.config.update({ region: 'us-east-1' });

  AWS.config.loadFromPath('./config.json');

  let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

  var ResponseData = [];

  let userName = req.headers['username'];
  let date = req.headers['timestamp'];
  let primaryVar;
  file.map((item) => {
    console.log("mapping files")
    console.log(item)
    if (item['primary']) {
      primaryVar = "primary/"
    } else {
      primaryVar = ''
    }
    var params = {
      Bucket: "filter-user-upload-bucket",
      Region: 'us-east-1',
      Key: userName + "/" + date + "/" + "preprocess" + "/" + primaryVar + item.originalname,
      Body: item.buffer
    };
    s3.upload(params, function (err, data) {
      if (err) {
        error = true;
        res.json({ "error": true, "Message": err });
        console.log(err)
      } else {
        ResponseData.push(data);
        if (ResponseData.length == file.length) {
          res.json({ "error": false, "Message": "File Uploaded Successfully", Data: ResponseData });
        }
      }
    });
  });


});
module.exports = router;