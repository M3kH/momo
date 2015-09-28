#!/usr/bin/env node
var io = require('socket.io')(8080);

// Here connection is created
io.on('connection', function( socket ){
  // Just emit a message
  socket.emit('news', {hello: 'world!'});

  // Just listen to some other events.
  socket.on('mediacenter', function(data){
      var spawn = require('child_process').spawn,
        //matchbox-window-manager -use_titlebar no -use_cursor no &
        chrome = spawn('sh', ['./utils/chrome_start.sh'], {
          cwd: __dirname
        });

      chrome.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
      });

      chrome.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
      });

      chrome.on('close', function(code) {
        console.log('child process exited with code ' + code);
      });
  });
});
