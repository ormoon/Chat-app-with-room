const moment = require('moment');
const generateMsg = (text) => {
    return {
        text,
        createdAt: moment().calendar()
    }
}

module.exports = {
    generateMsg
}