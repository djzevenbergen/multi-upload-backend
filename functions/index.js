const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
var app = express();
var port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

// Start the server
app.listen(port, function (err) {
  if (err) {
    console.log(" DB Error: ", err);
  } else {
    console.log('Port connected', port);
  }
});

const profile = require('./model/s3Upload');
app.use('/api', profile);


app.get("/", (req, res) => {
  res.send("hello world!")
})

