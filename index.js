#!/usr/bin/env node
var io = require('socket.io')(),
    user = 0;

// Here connection is created
io.on('connection', function( socket ){
  user++;

  // Just emit a message
  io.sockets.emit('client-connected', {totalClients: user});

  socket.on('disconnect', function(){
    user--;
    io.sockets.emit('client-disconnect', {totalClients: user});
  });

  // Just listen to some other events.
  socket.on('mediacenter', function(data){
      var spawn = require('child_process').spawn,
          // matchbox-window-manager -use_titlebar no -use_cursor no &
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

io.listen(3033);
