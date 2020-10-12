var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
var app = express();
var port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }))

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



const okHosts = ['http://localhost:3000', 'https://optml-image.web.app', 'https://optml-image.web.app/upload']
const corsOptions = {
  origin: function (origin, callback) {
    if (okHosts.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}
app.use(cors(corsOptions));
// Start the server
app.listen(port, function (err) {
  if (err) {

  } else {

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

var ResponseData;


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


    return callBack(content);
  }

  const doTheUpload = (fileBuffer) => {
    ResponseData = []
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
    })

    file[count] = logFileObject;

    file.map((item) => {
      // console.log(item)

      if (item['primary']) {
        primaryVar = "primary/"
      } else {
        primaryVar = ''
      }

      var params = {
        Bucket: "filter-user-upload-bucket",
        Region: 'us-east-1',
        Key: item.mimetype == "text/plain" ? "logs/" + userName + "_" + date + "_" + "log.txt" : userName + "/" + date + "/" + "preprocess" + "/" + primaryVar + item.originalname,
        Body: item.buffer
      };
      s3.upload(params, function (err, data) {
        if (err) {
          error = true;
          console.log(err)
          res.json({ "error": true, "Message": err });

        } else {
          ResponseData.push(data);
          console.log(data)
          console.log(ResponseData.length + " should equal " + file.length)
          if (ResponseData.length == file.length) {
            console.log(ResponseData)
            res.json({ "error": false, "Message": "File Uploaded Successfully", Data: ResponseData });

          } else {
            console.log("hmm")
          }
        }
      });
    });
  }

  let data = "timestamp," + date + ",username," + userName;
  logBuffer = getThisFile(data, doTheUpload)
}

)
module.exports = router;

app.get("/", (req, res) => {
  res.send("hello world!")
})

