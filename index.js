// Entry Point
exports.handler = function( event, context ) {
  "use strict";

  var path = require('path'),
      fs = require('fs'),
      http = require('http'),
      phantomDownloadPath = "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64-symbols.tar.bz2",
      childProcess = require('child_process'),
      env = require('node-env-file'),
      request = require('request'),
      Promise = require("bluebird"),
      aws = require('aws-sdk'),
      mailcomposer = require('mailcomposer');


  env(__dirname + '/.env', {overwrite: true});

  var constParams = {
    SERVICE_NAME: process.env.SERVICE_NAME,
    TARGET_URL: process.env.TARGET_URL,
    CAPTURE_FILE: process.env.CAPTURE_FILE,
    SES_FROM: process.env.SES_FROM,
    SES_TO: process.env.SES_TO,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,

    CHATWORK_TO_1: process.env.CHATWORK_TO_1,
    CHATWORK_TO_2: process.env.CHATWORK_TO_2,
    CHATWORK_ROOMID: process.env.CHATWORK_ROOMID,
    CHATWORK_TOKEN: process.env.CHATWORK_TOKEN
  };

  var ses = new aws.SES({
    apiVersion: '2010-12-01',
    accessKeyId: constParams.AWS_ACCESS_KEY_ID,
    secretAccessKey: constParams.AWS_SECRET_ACCESS_KEY,
    region: constParams.AWS_REGION,
    sslEnabled: true
  });

  var mailOptions = {
     from: constParams.SES_FROM,
     to: constParams.SES_TO,
     subject: 'Watch Service Notification(' + constParams.SERVICE_NAME + ')',
     text: 'Your service is down..?',
     attachments: [
       {
          filename: 'capture.png',
          path: constParams.CAPTURE_FILE
       }
     ]
  };

  function sendMail() {
    console.log("sendMail----------");
    return new Promise(function(resolve) {
      var mail = mailcomposer(mailOptions);
      mail.build(function(err, message){

        var rawMsg = {RawMessage: {Data: message}};
        ses.sendRawEmail(rawMsg, function(err, data) {
          if(err) {
            console.log(err, err.stack);
          } else {
            console.log(data);
          }

          fs.unlink(constParams.CAPTURE_FILE, function(err) {
            if (err) {
              console.log(err, err,stack);
            }
            resolve();
          });

        });

      });

    });
  }


  function chatworkNotification() {
    console.log("chatworkNotification----------");
    return new Promise(function(resolve) {
      if (constParams.CHATWORK_TOKEN.length === 0) {
        resolve();
      }

      var msg = constParams.CHATWORK_TO_1 + "\n";

      if (constParams.CHATWORK_TO_2.length != 0) {
        msg += constParams.CHATWORK_TO_2 + "\n";
      }

      msg += constParams.SERVICE_NAME + " is down..?";

      var options = {
        url: 'https://api.chatwork.com/v1/rooms/' + constParams.CHATWORK_ROOMID +'/messages',
        headers: {
          'X-ChatWorkToken': constParams.CHATWORK_TOKEN
        },
        form : {body : msg},
        useQuerystring: true
      };

      request.post(options, function (err, res, body) {
        if (!err && res.statusCode == 200) {
          console.log(body);
        }else{
          console.log(err, err);
        }
        resolve();
      });

    });
  }


  // Get the path to the phantomjs application
  function getPhantomFileName(callback) {
    // var nodeModulesPath = path.join(__dirname, 'node_modules');
    var nodeModulesPath = path.join(__dirname, 'node_modules', 'phantomjs');
    fs.exists(nodeModulesPath, function(exists) {
      if (exists) {
        callback(path.join(__dirname, 'node_modules','phantomjs', 'bin', 'phantomjs'));
      }
      else {
        callback(path.join(__dirname, 'phantomjs'));
      }
    });
  }

  // Call the phantomjs script
  function callPhantom(callback) {
    getPhantomFileName(function(phantomJsPath) {

      var childArgs = [
        path.join(__dirname, 'phantomjs-script.js'),
        constParams.TARGET_URL,
        constParams.CAPTURE_FILE
      ];

      console.log('Calling phantom: ', phantomJsPath, childArgs);
      var ls = childProcess.execFile(phantomJsPath, childArgs);

      ls.stdout.on('data', function (data) {    // register one or more handlers
        console.log('phantom data  ---:> ' + data);
      });

      ls.stderr.on('data', function (data) {
        console.log('phantom error  ---:> ' + data);
      });

      ls.on('exit', function (code) {
        console.log('child process exited with code ' + code);

        fs.exists(constParams.CAPTURE_FILE, function(exists) {
          if (exists) {
            console.log('file exists!!');

            sendMail()
              .then(chatworkNotification())
              .then(function() {
                console.log("exit----------");
                callback();
              });

          } else {
            console.log('file unexists.....');
            callback();
          }

        });

      });

    });
  }

  // Execute the phantom call and exit
  callPhantom(function() {
    context.done();
  });
}
