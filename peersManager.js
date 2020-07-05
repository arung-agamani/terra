const Peer = require('./peer').Peer;

class PeersManager {
    constructor(peers, torrent) {
        this.peers = [];
        this.torrent = torrent;
        for (const peer of peers) {
            this.peers.push(new Peer(peer.ip, peer.port, torrent))
        }
    }

    addPeer(ip, port, torr) {
        if (!this.isPeerExist(ip, port)) {
            const peer = new Peer(ip, port, this.torrent);
            peer.download();
            this.peers.push(peer);
        }
            
    }

    isPeerExist(ip, port) {
        return this.peers.find(peer => peer.ip === ip && peer.port === port) !== undefined ? true : false
    }

    printPeerList() {
        for (const peer of this.peers) {
            console.log(peer.ip, peer.port);
        }
    }

    startDownload() {
        this.peers.forEach(peer => {
            peer.download();
        });
    }
}

module.exports.PeersManager = PeersManager;