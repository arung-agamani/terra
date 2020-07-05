const Socket = require('net').Socket;
const Messages = require('./messages');
const BitWire = require('bittorrent-protocol');
const clientId = require('./clientId');
class Peer {
    constructor(ip, port, torr) {
        this.ip = ip;
        this.port = port;
        this.torrent = torr;
        this.state = {
            me : {
                choking : true,
                interested : false
            },
            peer : {
                choking : true,
                interested : false
            }
        }
        this.infoHash = this.torrent.infoHash;
        this.peerId = clientId.generateId();
        this.socket = null;
        this.handshakeTimeout = null;
        // this.wireConnection = new BitWire();
        // console.log("Peer created with IP :", this.ip, "and port:", this.port);
    }

    startHandshakeTimeout() {
        clearTimeout(this.handshakeTimeout);
        this.handshakeTimeout = setTimeout(() => {

        })
    }

    download() {
        if (this.socket === null) {
            this.socket = new Socket();
            console.log('New socket created at ',this.ip, this.port)
        }
        const handshake = Messages.Handshake(this.torrent.infoHash);
        // console.log(handshake);
        const ih = this.infoHash.toString('hex');
        const pi = this.peerId.toString('hex');
        this.socket.connect(this.port, this.ip);
        // this.socket.pipe(this.wireConnection).pipe(this.socket);
        // this.wireConnection.handshake(this.infoHash, this.peerId);
        // this.wireConnection.on('handshake', (ih, pi) => {
        //     console.log('Handshake!');
        // });
        
        // this.socket.connect(this.port, this.ip);
        this.socket.on('connect', () => {            
            console.log("Connect attempt to : ", this.ip, this.port);
            console.log("Handshake buffer:",handshake);
            this.socket.write(handshake);
        })
        this.socket.on('error', err => {
            console.error(err.message);
            this.socket.destroy();
        });
        let savedBuf = Buffer.alloc(0);
        let isHandshake = true;
        this.socket.on('data', receivedBuf => {
            console.log("Data received:", receivedBuf);
            const messageLength = () => {
                return isHandshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readUInt32BE(0) + 4;
            }
            while (savedBuf.length >= 4 && savedBuf.length > messageLength()) {
                this.messageHandler(savedBuf.slice(0, messageLength()));
                savedBuf = savedBuf.slice(messageLength());
                isHandshake = false;
            }
        })
    }
    messageHandler(message) {
        if (this.isHandshake(message)) {
            this.socket.write(Messages.Interested());
        }
    }

    isHandshake(message) {
        return message.length === message.readUInt8(0) + 49 && message.toString('utf8', 1) === 'BitTorrent protocol';
    }
}

module.exports.Peer = Peer;