const axios = require("axios");
const REPORT_ENDPOINT = process.env.REPORT_ENDPOINT;
function SaveCdrReport(data) {
  return new Promise(async resolve => {
    try {
      if (!data){
        throw new Error(`data cannot be empty`);
      }
      let config = {
        method: 'post',
        url: REPORT_ENDPOINT + "/api/simmer/v1/accounts/callsystems/reports/calls",
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      let response = await axios.request(config)
      resolve([null, response.data]);
    } catch (error) {
      resolve([error, null]);
    }
  })
}

function UpdateCdrReport(data) {
  return new Promise(async resolve => {
    try {
      if (!data){
        throw new Error(`data cannot be empty`);
      }
      let config = {
        method: 'patch',
        url: REPORT_ENDPOINT + "/api/simmer/v1/accounts/callsystems/reports/calls",
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };
      let response = await axios.request(config)
      resolve([null, response.data]);
    } catch (error) {
      resolve([error, null]);
    }
  })
}

module.exports = {SaveCdrReport, UpdateCdrReport};