const fs = require('fs');
let path = require('path');
let AccountIVR = fs.readFileSync(path.join(__dirname, 'AccountIVR.json'));
AccountIVR = JSON.parse(AccountIVR);

module.exports = AccountIVR
