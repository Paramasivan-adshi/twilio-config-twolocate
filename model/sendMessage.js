const axios = require("axios");
const MESSAGER_ENDPOINT = process.env.MESSAGER_ENDPOINT;
function sendMessage({ to, message }) {
  return new Promise(async resolve => {
    try {
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: MESSAGER_ENDPOINT,
        headers: {
          'Content-Type': 'application/json'
        },
        data: { to, message }
      };
      let response = await axios.request(config)
      resolve([null, response.data]);
    } catch (error) {
      resolve([error, null]);
    }
  })
}

module.exports = sendMessage;