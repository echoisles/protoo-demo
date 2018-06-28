#!/usr/bin/env node

'use strict';
const url = require('url');
const http = require('http');
const protooServer = require('protoo-server');
const httpServer = http.createServer((req, res) =>
{
  res.writeHead(404, 'Not Here');
  res.end();
});

httpServer.listen(3443, '0.0.0.0', () =>
{
  console.log('protoo WebSocket server running');
});



let options =
  {
    maxReceivedFrameSize     : 960000, // 960 KBytes.
    maxReceivedMessageSize   : 960000,
    fragmentOutgoingMessages : true,
    fragmentationThreshold   : 960000
  };
const webSocketServer = new protooServer.WebSocketServer(httpServer,options);
var roomsMap = new Map();
// var peersMap = new Map();

// Handle connections from clients.
webSocketServer.on('connectionrequest', (info, accept, reject) =>
{
  // The client indicates the roomId and peerId in the URL query.
  let urlForParse = info.request.url;
  if (urlForParse === '/')
  {
    urlForParse = info.origin;
  }
  const u = url.parse(urlForParse, true);

  const roomId = u.query['roomId'];
  const peerName = u.query['peerName'];

  if (roomId && peerName) {
    let protooRoom = null;
    if (!roomsMap.has(roomId)) {
      protooRoom = new protooServer.Room();
      roomsMap.set(roomId, protooRoom);
    }
    else {
      protooRoom = roomsMap.get(roomId);
    }

    let transport = accept();


    if (protooRoom.hasPeer(peerName)){
      console.log(
        'handleConnection() | there is already a peer with same peerName, ' +
        'closing the previous one [peerName:"%s"]',
        peerName
      )
      const protooPeer= protooRoom.getPeer(peerName);
      protooPeer.close();
    }

    var protooPeer = protooRoom.createPeer(peerName, transport);
    // The app chooses a `peerId` and creates a peer within a specific room.
    // let protooPeer = null;
    // if (!peersMap.has(peerName)) {
    //   protooPeer  = protooRoom.createPeer('bob', transport);
    //   peersMap.set(peerName, protooPeer)
    // } else {
    //   let oldProtooPeer = peersMap.get(peerName);
    //   oldProtooPeer.close();
    //   protooPeer = protooRoom.createPeer('bob', transport);
    //   peersMap.delete(peerName);
    //   peersMap.set(peerName, protooPeer);
    // }

    protooPeer.on('request', (request, accept, reject) => {
      var data = request.data;
      console.log('data: %o', data);
      accept({code:0});
    });
  }
  else
  {
    reject(403, 'Not Allowed');
  }

});
