const AccountIVR = require('../configurations'); // Importing the IVR configurations
const axios = require('axios');
const REPORT_ENDPOINT = process.env.REPORT_ENDPOINT;
function getIvrSettings({ phoneNumber }) {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: REPORT_ENDPOINT + `/api/simmer/v1/accounts/callsystems/phonenumbers/${phoneNumber}/ivr`,
    headers: {}
  };
  console.log(config)
  return new Promise((resolve) => {
    let ivrConfig = AccountIVR[phoneNumber];
    if (ivrConfig) {
      resolve([null, ivrConfig])
      return
    }
    axios.request(config)
      .then((response) => {
        response = response.data
        console.log(response)
        resolve([null, response?.data])
      })
      .catch((error) => {
        console.error(error)
        resolve([error, null])
      });
  })
}

module.exports = getIvrSettings