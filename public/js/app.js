'use strict';

import qrgen from 'qrgen';

export default class App {

  constructor(io){
    if(!io) return this.error('No socket io passed');

    this.config = {
      socketUrl: 'http://192.168.1.11:3033'
    };

    this.bindIoEvents(io);
  }

  bindIoEvents(io){
      var socket;
      this.socket = socket = io(this.config.socketUrl);

      socket.on('connect', this.onConnect);
      socket.on('news', data => console.log(data) );
      socket.on('show-dashboard', this.onShowDashboard);
      socket.on('disconnect', this.onDisconnect);
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
    console.log(route);
    var canvas = qrgen.canvas({
            data: location.href+'#client'
    });
    document.getElementsByTagName('qr-code')[0].appendChild(canvas);
  }

  onShowDashboard(data){

  }

  onDisconnect(){

  }

  error(message){
    console.log(message);
  }

}
