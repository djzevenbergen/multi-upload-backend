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

let time;
let userName;
let logBuffer;

AWS.config.update({ region: 'us-east-1' });

let s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var ResponseData = [];

app.post('/api/upload', multipleUpload, function (req, res) {
  let error = false;
  const file = req.files;
  let userName = req.headers['username'];
  let date = req.headers['timestamp'];
  const getThisFile = (data, callBack) => {
    let content;

    fs.writeFileSync('logFile.txt', data, function (err) {
      // Deal with possible error here.
    });

    content = fs.readFileSync('logFile.txt')

    console.log(content)
    return callBack(content);
  }

  const doTheUpload = (fileBuffer) => {
    let count = 0
    const logFileObject = {
      fieldname: 'file',
      originalname: 'log.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      buffer: fileBuffer,
      size: 246862
    }

    Object.keys(file).forEach((f) => {
      count++;
      console.log(f)
      console.log(file[f])
    })

    file[count] = logFileObject;

    file.map((item) => {
      console.log("mapping files")
      console.log(item)
      if (item['primary']) {
        primaryVar = "primary/"
      } else {
        primaryVar = ''
      }

      console.log(item.mimetype == "text/plain" ? "logs/" + userName + "_" + date + "_" + "log.txt" : userName + "/" + date + "/" + "preprocess" + "/" + primaryVar + item.originalname)

      var params = {
        Bucket: "filter-user-upload-bucket",
        Region: 'us-east-1',
        Key: item.mimetype == "text/plain" ? "logs/" + userName + "_" + date + "_" + "log.txt" : userName + "/" + date + "/" + "preprocess" + "/" + primaryVar + item.originalname,
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
  }

  let data = "timestamp," + time + ",username," + userName;
  logBuffer = getThisFile(data, doTheUpload)
}

)
module.exports = router;

app.get("/", (req, res) => {
  res.send("hello world!")
})

