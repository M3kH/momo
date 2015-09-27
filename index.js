#!/usr/bin/env node
var spawn = require('child_process').spawn,
    chrome  = spawn('chromium', ['--app=http://google.com']);

chrome.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

chrome.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

chrome.on('close', function (code) {
  console.log('child process exited with code ' + code);
});
