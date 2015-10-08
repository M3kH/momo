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
      'get:ip': (data, socket) => self.getIpAdress(data, socket),
      'reboot': (data, socket) => (data, socket) => { child_process.exec('sudo reboot', () => {
                                        console.log(arguments);
                                      }
                                    );
                                  } (data, socket)
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

  onStartEmulstation(cb) {
    console.log('Emulstation start');

    if(this.debug) return false;
    this.spawn('emulationstation', cb);

    try{
      this.spawnVirtualController();
      console.log('Virtual Controller :)');
    }catch(e){
      console.log('No virtual controller :`(');
    }
  }

  onStopEmulstation(cb) {
    console.log('Emulstation stop');
    if(this.debug) return cb ? cb() : false;
    this.kill();
    console.log('Virtual controller close');
    this.killVirtualController();
    if (cb) cb();
  }

  onStartMediacenter(cb){
    console.log('Mediacenter start');
    if(this.debug) return false;
    this.spawnFromPi('kodi', cb);
  }

  onStopMediacenter(cb){
    console.log('Mediacenter stop');
    if(this.debug) return cb ? cb() : false;
    this.kill(cb);
  }

  onStartAirReplay(cb){
    console.log('Airplay start');
    if(this.debug) return false;
    this.spawn('shairport-sync', cb);
  }

  onStopAirReplay(cb){
    console.log('Airplay stop');
    if(this.debug) return cb ? cb() : false;
    this.kill(cb);
  }
  // Modes events ---- STOP


  // Spawn actions ---- START
  spawnChromeStart() {
    // su - pi -c 'startx' &
    if(this.debug) return false;
    this.spawnFromPi('startx');
  }

  spawnChromeStop(cb) {
    if(this.debug) return cb ? cb() : false;
    this.runScriptUtil(
      'utils/stopx.sh',
      false,
      false,
      cb ? close => cb(close) : false
    );
  }

  spawnVirtualController(out, err, close) {
    this.vcontroller = spawn('sudo', ['node', 'main.js'], {
      cwd: __dirname + '/../../virtual-gamepads/'
    });

    this.vcontroller.stdout.on('data', console.log( out.toString('utf8') ) );
    this.vcontroller.stderr.on('data', console.log( err.toString('utf8') ) );
    this.vcontroller.on('close', console.log( err.toString('utf8') ) );
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

    chrome.stdout.on('data', out ?
                             _out => out(_out.toString('utf8')) :
                             _out => console.log(_out.toString('utf8')) );

    chrome.stderr.on('data', err ?
                            _err => err(_err.toString('utf8')) :
                            _err => console.log(_err.toString('utf8')) );

    chrome.on('close', close ?
                            _close => close(_close) :
                            _close => console.log(_close) );
  }

  startService(service, cb){
    this.spawnFromPi(`/etc/init.d/${service} start`, cb);
  }

  stopService(service, cb){
    this.spawnFromPi(`/etc/init.d/${service} stop`, cb);
  }

  spawn(command, cb){
    this.active_process = spawn(command, {
      cwd: __dirname+'/../'
    });

    var _close_cb = (close) => {
      this.active_process = false;
      return cb ? cb(close) : console.log(close);
    };

    this.active_process.stdout.on('data', out => console.log(out.toString('utf8')) );
    this.active_process.stderr.on('data', err => console.log(err.toString('utf8')) );
    this.active_process.on('close', _close_cb );
  }

  kill(cb){
    if(this.active_process){
      try{
        process.kill(-this.active_process.pid);
        if(cb) cb();
        this.active_process = false;
      }catch(e){
        if(cb) cb(e);
      }
    }
  }

  spawnFromPi(command, cb){
    var _process = spawn('su', ['-', 'pi', '-c', `\'${command}\'`], {
      cwd: __dirname+'/../'
    }),
    _close_cb = (close) => {
      this.active_process = false;
      return cb ? cb(close) : console.log(close);
    };

    _process.stdout.on('data', out => console.log(out.toString('utf8')) );
    _process.stderr.on('data', err => console.log(err.toString('utf8')) );
    _process.on('close', _close_cb );

    this.active_process = _process;
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
