var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
var app = express();
var port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
var fs = require("fs")
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

// Start the server
app.listen(port, function (err) {
  if (err) {
    console.log(" DB Error: ", err);
  } else {
    console.log('Port connected', port);
  }
});

// const profile = require('./model/s3Upload');
app.post('/api/upload', multipleUpload, function (req, res) {
  let error = false;
  const file = req.files;

  Object.values(file).forEach((f) => {
    console.log(f)
  })

  AWS.config.update({ region: 'us-east-1' });

  let s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

  var ResponseData = [];


  /// can get rid of this

  // fs.writeFile('logFile.txt', req.headers['timestamp'], "utf8", function (err) {
  //   if (err) return console.log(err);

  // });

  // to here


  let userName = req.headers['username'];
  let date = req.headers['timestamp'];
  let primaryVar;
  console.log(typeof (file))
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

  /// can get rid of this
  // let d;
  // fs.readFile('logFile.txt', (err, data) => {
  //   if (err) throw err;
  //   console.log(data);
  //   d = data;
  // });

  // var params = {
  //   Bucket: "filter-user-upload-bucket",
  //   Region: 'us-east-1',
  //   Key: userName + "/" + date + "/" + "preprocess" + "/log.txt",
  //   Body: d
  // };



  // s3.upload(params, function (err, data) {
  //   if (err) {
  //     error = true;
  //     res.json({ "error": true, "Message": err });
  //     console.log(err)
  //   }

  // }
  // );

  // to here

});
module.exports = router;

app.get("/", (req, res) => {
  res.send("hello world!")
})

