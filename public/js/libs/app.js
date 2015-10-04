"use strict"

import Utils from './utils';
import $ from 'jQuery';
import io from "io";
import hasher from "hasher";

export default class App {

  constructor() {
    if (!io) return this.error('No socket io passed');

    this.utils = new Utils();

    this.options = {
      socketUrl: 'http://' + window.location.host + ':3033',
      dashboard: false,
      connected: false
    };

    this.actions = {
      'connect': data => this.onConnect(data),
      'client:connected': data => this.onClientConnect(data),
      'client:disconnect': data => this.onClientDisconnect(data),
      'show:dashboard': data => this.onShowDashboard(data),
      'server:ip': data => this.onGetServerIp(data),
      'disconnect': data => this.onDisconnect(data)
    };

    this.routes = {
      'dashboard': data => this.onShowDashboard(data),
      'controller': data => this.onShowController(data)
    };

    // this.ui_events = {
    //   'click .js-start-emulator': data => this.onStartEmulator(data),
    //   'click .js-start-emulator': data => this.onStartEmulator(data)
    // };

    this.init();
  }

  init(){
    this.setHasher();
    this.bindIo();
    this.setUi();
  }

  setUi(){
    var self = this;
    $('.js-start-dashboard').on('click', (e) => {
      e.preventDefault();
      console.log('Dashboard mode change');
      self.socket.emit('dashboard', {});
      return false;
    });
    $('.js-start-emulstation').on('click', (e) => {
      e.preventDefault();
      console.log('Emulstation mode change');
      self.socket.emit('emulstation', {});
      return false;
    });
  }

  setHasher() {
    // Asher would trigger our App.router
    hasher.changed.add(_new => this.router(_new));
    hasher.initialized.add(_new => this.router(_new));
    hasher.init();
  }

  router(newRoute, oldRoute) {
    newRoute = newRoute || 'dashboard';
    this.onShow(newRoute);
  }

  onShow(route) {
    this.onResetMain();
    if (this.routes[route]) {
      this.routes[route]();
    } {
      this.error('The view ' + route + ' doesn\'t exists');
    }
  }

  bindIoEvent(event, action) {
    this.socket.on(event, action);
  }

  bindIo() {
    this.socket = io(this.options.socketUrl);
    for (let event in this.actions) {
      this.bindIoEvent(event, this.actions[event]);
    }
  }

  onConnect() {
    console.log('is connected!');
    this.options.connected = true;
    $('.content').toggleClass('hide', false);
    $('.loading').toggleClass('hide', true);
  }

  onClientConnect(data) {
    console.log('Client is connected!');
    if( this.options.dashboard && data.totalClients > 1 ){
      $('#no-user').toggleClass('hide', true);
      $('#user-connected').toggleClass('hide', false);
    }
  }

  onClientDisconnect(data) {
    console.log('Client is disconnect!');
    if(this.options.dashboard && data.totalClients === 1){
      $('#no-user').toggleClass('hide', false);
      $('#user-connected').toggleClass('hide', true);
    }
  }


  onResetMain() {

  }

  addQrCode(url) {
    $('qr-code').html(this.utils.getQrCode(url)).append(`<p>or go to this url:<br/> ${url}</p>`);
  }

  onShowDashboard(data) {
    this.options.dashboard = true;
    try{
      this.utils.getLocalIp(ip => this.addQrCode('http://' + ip + window.location.pathname + '#controller'));
    }catch(e){
      this.socket.emit('get:ip');
      this.socket.on('server:ip', ip => this.addQrCode('http://' + ip + window.location.pathname + '#controller') )
    }
  }

  onGetServerIp(){

  }

  onShowController() {

  }

  onDisconnect() {
    this.options.connected = false;
    $('.content').toggleClass('hide', true);
    $('.loading').toggleClass('hide', false);
  }

  error(message) {
    console.log(message);
  }

}
