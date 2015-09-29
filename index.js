// Entry Point
exports.handler = function( event, context ) {
  "use strict";

  var SERVICE_NAME = "google";

  var CAPTURE_FILE = '/tmp/error.png';
  var SES_FROM = "hoge@example.com";
  var SES_TO = "hoge@example.com";

  var path = require('path'),
      fs = require('fs'),
      http = require('http'),
      phantomDownloadPath = "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64-symbols.tar.bz2",
      childProcess = require('child_process');


  var dotenv = require('dotenv').load();
  var aws = require('aws-sdk');
  var mailcomposer = require('mailcomposer');

  // dotenv is undefined at production.
  // so need to set ses policy to iam-role.
  var ses = new aws.SES({
    apiVersion: '2010-12-01',
    accessKeyId: dotenv.AWS_ACCESS_KEY_ID,
    secretAccessKey: dotenv.AWS_SECRET_ACCESS_KEY,
    region: dotenv.AWS_REGION,
    sslEnabled: true
  });


  // Get the path to the phantomjs application
  function getPhantomFileName(callback) {
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
        path.join(__dirname, 'phantomjs-script.js')
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

        fs.exists(CAPTURE_FILE, function(exists) {
          if (exists) {
            console.log('file exists!!');

            var mailOptions = {
               from: SES_FROM,
               to: SES_TO,
               subject: 'Watch Service Notification(' + SERVICE_NAME + ')',
               text: 'Your service is down..',
               attachments: [
                 {
                    filename: 'error.png',
                    path: CAPTURE_FILE
                 }
               ]
            };
            var mail = mailcomposer(mailOptions);
            mail.build(function(err, message){

              ses.sendRawEmail({RawMessage: {Data: message}}, function(err, data) {
                if(err) {
                  // error handling
                  console.log(err, err.stack);
                } else {
                   //  context.done(null, data);
                    console.log(data);
                }

                fs.unlink(CAPTURE_FILE, function(err) {
                  if (err) {
                    console.log(err, err,stack);
                  }
                  callback();
                });

              });

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
