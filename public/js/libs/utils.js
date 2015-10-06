"use strict"

import qrgen from 'qrgen';

export default class Utils {

  getQrCode(data){
    var canvas = qrgen.canvas({
      data: data
    });
    return canvas;
  }

  storeIpAddress(ice, cb){
     this.ips = this.ips || [];
     //listen for candidate events
     if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
     var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
     if(this.ips.indexOf(myIP) === -1) this.ips.push(myIP);
     if(this.timeout) clearTimeout(this.timeout);
     this.timeout = setTimeout( data => cb(this.ips[this.ips.length-1]), 200);
  }

  getLocalIp(cb){
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
    pc.createDataChannel("");    //create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
    pc.onicecandidate = ice => this.storeIpAddress(ice, cb);
  }

}
