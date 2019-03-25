#!/usr/bin/env node

'use strict';

const args = require('minimist')(process.argv.slice(2))
if (!args['host']){ 
  console.log('Please specify --host=http://foo.bar:31001');
  process.exit(1);
}

const io = require('socket.io-client');
const socket = io(args['host']);

const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();

function getSpeed(a, b) {
  var speed = Math.round((b*20) - (a*20));
  if ( speed < -100 ){ speed=-100; }
  if ( speed > 100  ){ speed=100;  }
  return speed;
}

poweredUP.scan(); // Start scanning for trains

poweredUP.on("discover", async (hub) => { // Wait to discover a train

    let moving = true;

    await hub.connect(); // Connect to train
    console.log(`Zug Verbunden: ${hub.name}!`);
    console.log(`Battery Level: ${hub.batteryLevel}`);

    // connect to socket
    socket.on('connect', () => {
      console.log('Connected to socket: ' + socket.connected); // true
    });

    // get data from socket
    var data;
    socket.on('scores', (json) => {
      data = JSON.parse(json);
      var a = parseInt(data.a || 0);
      var b = parseInt(data.b || 0);

      var speed = getSpeed(a, b);
      hub.setMotorSpeed('A', speed);
      console.log(speed);

    });
});
