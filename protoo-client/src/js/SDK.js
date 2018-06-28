const protooClient = require('protoo-client');

export default class {
  constructor(option) {
    let ChromeVersion = this.getChromeVersion();
    if(ChromeVersion<55){
        alert("只支持Chrome 55 及以上版本");
    }

    const url = `ws://${option.server}:${option.port}/?peerName=${option.peerName}&roomId=${option.roomId}`;
    let transport = new protooClient.WebSocketTransport(url);
    this.status = 'close';
    this._peer = new protooClient.Peer(transport);
    this._peer.on('open', () => {
      this.status = 'open';
      this._sendMessage();
    });

    this._peer.on('disconnected', () => {
      this.status = 'close'
    });

    this._peer.on('close', () => {
      this.status = 'close'
    });

    this._msgQueue = [];

  }

  send(message) {
    this._msgQueue.push(message);
    this._sendMessage()
  }

  _sendMessage() {
    if (this.status === 'open' && this._msgQueue.length > 0) {
      this._msgQueue.forEach((msg, index) => {
        console.log('message ： %o',msg)
        this._peer.send(msg.method, msg.data)
          .then((data) => {
            console.log('success response received %o', data);
          })
          .catch((error) => {
            console.error('error response %o', error);
          });
      });
      this._msgQueue = [];
    }
  }


  getChromeVersion () {
    var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return raw ? parseInt(raw[2], 10) : false;
  }


}