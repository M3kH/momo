import io from 'socket.io';
import child_process from 'child_process';
import os from 'os';

var spawn = child_process.spawn,
    ifaces = os.networkInterfaces();

export default class App {

  constructor() {
    var self = this;
    this.createIoServer();
    this.users = 0;

    this.debug = (process.platform === 'darwin');

    this.options = {
      defaultMode: 'dashboard'
    }

    this.modes = {
      dashboard: {
        start: data => this.onStartDashboard(data),
        stop: data => this.onStopDashboard(data)
      },
      mediacenter: {
        start: data => this.onStartMediacenter(data),
        stop: data => this.onStopMediacenter(data)
      },
      emulstation: {
        start: data => this.onStartEmulstation(data),
        stop: data => this.onStopEmulstation(data)
      },
      audiorepeater: {
        start: data => this.onStartAirReplay(data),
        stop: data => this.onStopAirReplay(data)
      }
    };

    // SocketIo Events
    this.actions = {
      'disconnect': data => this.onClientDisconnect(data),
      'dashboard': data => this.changeMode('dashboard'),
      'mediacenter': data => this.changeMode('mediacenter'),
      'emulstation': data => this.changeMode('emulstation'),
      'audiorepeater': data => this.changeMode('audiorepeater'),
      'get:ip': (data, socket) => self.getIpAdress(data, socket)
    };

    this.startMode();
  }

  createIoServer() {
    this.io = io();
    this.io.on('connection', socket => this.onClientConnect(socket));
    this.io.listen(3033);
  }

  onClientConnect(socket) {
    this.users++;
    this.bindSocketEvents(socket);
    this.io.sockets.emit('client:connected', {
      totalClients: this.users
    });
  }

  onClientDisconnect() {
    this.users--;
    this.io.sockets.emit('client:disconnect', {
      totalClients: this.users
    });
  }

  startMode(mode) {
    this.currentMode = mode = mode || this.options.defaultMode;
    if (this.modes[mode] && typeof this.modes[mode].start === 'function') {
      this.modes[mode].start();
    }
  }

  changeMode(mode) {
    var oldMode = this.currentMode || false;
    if (oldMode === mode) return false;
    if (oldMode && typeof this.modes[oldMode].stop === 'function') {
      this.modes[oldMode].stop(data => this.startMode(mode));
    } else {
      this.startMode(mode);
    }
  }

  // Modes events ---- START
  onStartDashboard() {
    console.log('Dashboard Start');
    this.spawnChromeStart();
  }

  onStopDashboard(cb) {
    console.log('Dashboard stop');
    this.spawnChromeStop(cb);
  }

  onStartEmulstation() {
    console.log('Emulstation start');

    if(this.debug) return false;
    this.spawnEmulstation(
      out => console.log(out),
      err => console.log(err),
      close => console.log('Emulstation close')
    );

    this.spawnVirtualController(
      out => console.log(out),
      err => console.log(err),
      close => console.log('Virtual controller close')
    );
  }

  onStopEmulstation(cb) {
    console.log('Emulstation stop');
    if(this.debug) return cb ? cb() : false;
    this.killEmulstation();
    console.log('Virtual controller close');
    this.killVirtualController();
    if (cb) cb();
  }

  onStartMediacenter(){
    console.log('Mediacenter start');
    if(this.debug) return false;
    this.spawnEmulstation(
      out => console.log(out),
      err => console.log(err),
      close => console.log('Emulstation start')
    );
  }

  onStopMediacenter(cb){
    console.log('Mediacenter stop');
    if(this.debug) return cb ? cb() : false;
    this.killKodi();
    if(cb) cb();
  }

  onStartAirReplay(){
    console.log('Airplay start');
    if(this.debug) return false;
    this.spawnShairport(
      out => console.log(out.toString('utf8')),
      err => console.log(err.toString('utf8')),
      close => console.log('Shairport start')
    );
  }

  onStopAirReplay(cb){
    console.log('Airplay stop');
    if(this.debug) return cb ? cb() : false;
    this.killShairport();
    if(cb) cb();
  }
  // Modes events ---- STOP


  // Spawn actions ---- START
  spawnChromeStart() {
    // su - pi -c 'startx' &
    if(this.debug) return false;
    var chrome = spawn('su', ['-', 'pi', '-c', '\'startx\''] );
    chrome.stdout.on('data', out => console.log(out));
    chrome.stderr.on('data', err => console.log(err));
    chrome.on('close', close => console.log('Chrome as been close'));
  }

  spawnChromeStop(cb) {
    if(this.debug) return cb ? cb() : false;
    this.runScriptUtil(
      'utils/stopx.sh',
      out => console.log(out),
      err => console.log(err),
      exit => () => {
        if (cb) cb();
      }(exit)
    );
  }

  spawnShairport(out, err, close) {
    this.airreplay = spawn('shairport-sync', {
      cwd: __dirname
    });

    if (out) this.airreplay.stdout.on('data', out);
    if (err) this.airreplay.stderr.on('data', err);
    if (close) this.airreplay.on('close', close);
  }

  killShairport(out, err, close) {
    if (this.airreplay) {
      this.airreplay.stdin.pause();
      this.airreplay.kill();
      this.airreplay = false;
    }
  }

  spawnKodi(out, err, close) {
    this.kodi = spawn('kodi', {
      cwd: __dirname
    });

    if (out) this.kodi.stdout.on('data', out);
    if (err) this.kodi.stderr.on('data', err);
    if (close) this.kodi.on('close', close);
  }

  killKodi() {
    if (this.kodi) {
      this.kodi.stdin.pause();
      this.kodi.kill();
      this.kodi = false;
    }
  }

  spawnEmulstation(out, err, close) {
    this.emulstation = spawn('emulationstation', {
      cwd: __dirname
    });

    if (out) this.emulstation.stdout.on('data', out);
    if (err) this.emulstation.stderr.on('data', err);
    if (close) this.emulstation.on('close', close);
  }

  killEmulstation() {
    if (this.kodi) {
      this.emulstation.stdin.pause();
      this.emulstation.kill();
      this.emulstation = false;
    }
  }

  spawnVirtualController(out, err, close) {
    this.vcontroller = spawn('sudo', ['node', 'main.js'], {
      cwd: __dirname + '/../../virtual-gamepads/'
    });

    if (out) this.vcontroller.stdout.on('data', out);
    if (err) this.vcontroller.stderr.on('data', err);
    if (close) this.vcontroller.on('close', close);
  }

  killVirtualController() {
    if (this.vcontroller) {
      this.vcontroller.stdin.pause();
      this.vcontroller.kill();
      this.vcontroller = false;
    }
  }

  runScriptUtil(script, out, err, close) {
    // su - pi -c "sh ~/momo/utils/chromium_start.sh"
    var chrome = spawn('bash', [`${__dirname}/../${script}`] );

    if (out) chrome.stdout.on('data', out);
    if (err) chrome.stderr.on('data', err);
    if (close) chrome.on('close', close);
  }

  bindSocketEvents(socket) {
    for (let event in this.actions) {
      socket.on(event, data => this.actions[event](data, socket));
    }
  }

  // Spawn actions ---- END
  getIpAdress(data, socket){
    Object.keys(ifaces).forEach((ifname) => {
      var alias = 0;

      ifaces[ifname].forEach((iface) => {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          socket.emit('server:ip', {serverIp: iface.address});
          console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 adress
          socket.emit('server:ip', {serverIp: iface.address});
          console.log(ifname, iface.address);
        }
      });
    });
  }

}
