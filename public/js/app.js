'use strict';

import qrgen from 'qrgen';

export default class App {

  constructor(io){
    if(!io) return this.error('No socket io passed');

    this.config = {
      socketUrl: 'http://'+window.location.host+':3033',
      dashboard: false
    };

    this.actions = {
      'connect': data => this.onConnect(data),
      'client-connected': data => this.onClientConnect(data),
      'client-disconnect': data => this.onClientDisconnect(data),
      'show-dashboard': data => this.onShowDashboard(data),
      'disconnect': data => this.onDisconnect(data)
    };

    this.routes = {
      'dashboard': data => this.onShowDashboard(data),
      'controller': data => this.onShowController(data)
    };

    this.bindIo(io);
  }

  bindIoEvent(event, action){
    this.socket.on(event, action);
  }

  bindIo(io){
      this.socket = io(this.config.socketUrl);
      for(let event in this.actions ){
        this.bindIoEvent(event, this.actions[event]);
      }
  }

  router (newRoute, oldRoute){
    newRoute = newRoute || 'dashboard';
    this.onShow(newRoute);
  }

  onConnect(){
    console.log('is connected!');
  }

  onResetMain(){

  }

  onShow( route ){
    this.onResetMain();
    this.routes[route]();
  }

  onShowDashboard(data){
    var canvas = qrgen.canvas({
      data: window.location.host+window.location.pathname+'#client'
    });
    document.getElementsByTagName('qr-code')[0].appendChild(canvas);
  }

  onDisconnect(){

  }

  error(message){
    console.log(message);
  }

}
