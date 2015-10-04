#!/bin/node
// This script is for do some actions after the installations
// Useful now for manipulate some data around npm dependnecies.
var jsonfile = require('jsonfile')

// Change Virtual GamePad port
var file = 'node_modules/virtual-gamepads/config.json',
    obj = {port: 3034};
jsonfile.writeFileSync(file, obj, {spaces: 2});
console.log('Virtal Gamepad Config on port: '+obj.port+' [ OK ]');
