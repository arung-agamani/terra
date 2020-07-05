const urlParser = require('url').parse;
const datagram = require('dgram');
const Buffer = require('buffer').Buffer;
const crypto = require('crypto');
const clientId = require('./clientId');
const torrentParser = require('./torrentParser');

class Tracker {
    constructor(torrent, url) {
        this.torrent = torrent;
        this.url = url;
        this.peers = [];
        console.log("Tracker constructed pointing at", url);
    }

    getPeers(callback) {
        const udpSocket = datagram.createSocket('udp4');
        const url = this.url;
        const parsedUrl = urlParser(url);
        const connectionReq = connectionRequest()
        udpSocket.on('message', res => {
            if (responseType(res) === 'connect') {
                const connectionResponse = parseConnectionResponse(res);
                const announceRequest = createAnnounceRequest(connectionResponse.connectionId, this.torrent);
                udpSocket.send(announceRequest, 0, announceRequest.length, parsedUrl.port, parsedUrl.hostname, (err, num) => {
                    if (err) { console.log(err.message); }
                })
            } else if (responseType(res) === 'announce') {
                const announceResponse = parseAnnounceResponse(res);
                console.log("=======ANNOUNCE RESPONSE==========")
                console.log(announceResponse);
                console.log(announceResponse.transactionId);
                console.log("==================================")
                callback(announceResponse.peers);
            }
        })
        udpSocket.send(connectionReq, 0, 16, parsedUrl.port, parsedUrl.hostname, (err, num) => {
            if (err) {
                console.log(err);
            }
        })
    }

    HTTP_getPeers() {
        const params = {
            info_hash : this.torrent.infoHash,
        }
    }

    toString() {
        let out = '' + this.url;
        return out;
    }
}

const getPeers = (torrent, callback) => {
    const udpSocket = datagram.createSocket('udp4');
    const url = torrent.announce.toString();
    const parsedUrl = urlParser(url);
    const connectionReq = connectionRequest()
    udpSocket.on('message', res => {
        if (responseType(res) === 'connect') {
            const connectionResponse = parseConnectionResponse(res);
            const announceRequest = createAnnounceRequest(connectionResponse.connectionId, torrent);
            udpSocket.send(announceRequest, 0, announceRequest.length, parsedUrl.port, parsedUrl.hostname, (err, num) => {
                if (err) { console.log(err.message); }
            })
        } else if (responseType(res) === 'announce') {
            const announceResponse = parseAnnounceResponse(res);
            
            callback(announceResponse);
        }
    })
    udpSocket.send(connectionReq, 0, 16, parsedUrl.port, parsedUrl.hostname, (err, num) => {
        if (err) {
            console.log(err);
        }
    })
}

const getPeersFromAnnounceList = (torrent, callback) => {
    const udpSocket = datagram.createSocket('udp4');
    for (const announce of torrent.announceListArray) {
        const url = announce.toString();
        console.log(url);
        const dummy = '';
        if (url.startsWith('udp')) {
            const parsedUrl = urlParser(url);
            const connectionReq = connectionRequest()
            udpSocket.send(connectionReq, 0, 16, parsedUrl.port, parsedUrl.hostname, (err, num) => {
                if (err) {
                    console.log(err);
                }
            })
        }
    }    
    udpSocket.on('message', res => {
        if (responseType(res) === 'connect') {
            const connectionResponse = parseConnectionResponse(res);
            const announceRequest = createAnnounceRequest(connectionResponse.connectionId, torrent);
            udpSocket.send(announceRequest, 0, announceRequest.length, parsedUrl.port, parsedUrl.hostname, (err, num) => {
                if (err) { console.log(err.message); }
            })
        } else if (responseType(res) === 'announce') {
            const announceResponse = parseAnnounceResponse(res);
            callback(announceResponse.peers);
        }
    })
}

const connectionRequest = () => {
    const buf = Buffer.alloc(16);
    const connId = BigInt(0x41727101980)
    buf.writeUInt32BE(0x417, 0);
    buf.writeUInt32BE(0x27101980, 4);
    buf.writeUInt32BE(0, 8);
    crypto.randomBytes(4).copy(buf, 12);
    return buf;
}

const responseType = (res) => {
    const action = res.readUInt32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
}

const parseConnectionResponse = (res) => {
    const obj = {
        action : res.readUInt32BE(0),
        transactionId: res.readUInt32BE(4),
        connectionId: res.slice(8)
    }
    return obj;
}

const createAnnounceRequest = (connectionId, torrent, port=6881) => {
    const buf = Buffer.alloc(98);
    connectionId.copy(buf, 0);
    buf.writeUInt32BE(0x1, 8);
    crypto.randomBytes(4).copy(buf, 12);
    torrentParser.infoHash(torrent).copy(buf, 16);
    clientId.generateId().copy(buf, 36);
    Buffer.alloc(8).copy(buf, 56);
    torrent.size.copy(buf, 64);
    Buffer.alloc(8).copy(buf, 72);
    buf.writeUInt32BE(0, 80);
    buf.writeUInt32BE(0, 84);
    crypto.randomBytes(4).copy(buf, 88);
    buf.writeInt32BE(-1, 92);
    buf.writeUInt16BE(port, 96);
    // console.log("Announce request", buf);
    return buf;
}

const parseAnnounceResponse = (res) => {
    const group = (iterable, groupSize) => {
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) {
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }

    return {
        action : res.readUInt32BE(0),
        transactionId: res.readUInt32BE(4),
        leechers : res.readUInt32BE(8),
        seeders : res.readUInt32BE(12),
        peers : group(res.slice(20), 6).map(addr => {
            return {
                ip: addr.slice(0,4).join('.'),
                port: addr.readUInt16BE(4)
            }
        })
    }
}

module.exports = {
    getPeers, getPeersFromAnnounceList, Tracker
}