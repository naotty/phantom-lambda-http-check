var TARGET_URL = "https://google.com";
var CAPTURE_FILE = '/tmp/error.png';

var isError = false;

var page = require('webpage').create();

page.viewportSize = { width: 1920, height: 1080 };
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';

page.onResourceReceived = function(response) {
  if (response.url === TARGET_URL && response.stage === "start") {
    if (response.status !== 200) {
        isError = true;
    }
  }
};

page.open(TARGET_URL, function(status) {

    if (status !== "success") {
        isError = true;
    }

    if (isError === true) {
        page.render(CAPTURE_FILE);
    }

    phantom.exit();

});
