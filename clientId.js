const crypto = require('crypto');

let id = null;

module.exports.generateId = () => {
    if (!id) {
        id = Buffer.alloc(20);
        Buffer.from('-AW0001-123456789876').copy(id, 0);
    }
    return id;
}