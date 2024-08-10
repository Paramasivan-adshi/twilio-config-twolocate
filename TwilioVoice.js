const VoiceResponse = require("twilio").twiml.VoiceResponse; // Importing Twilio's VoiceResponse class
const getIvrSettings = require("../model/IvrSettings");
const { SaveCdrReport, UpdateCdrReport } = require("../model/cdrReport"); // Importing functions for saving and updating call detail records
const sendMessage = require("../model/sendMessage"); // Importing function for sending messages

const http = require('http');
const WebSocket = require('ws');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config(); // Load environment variables from .env file


const DEFAULT_FORWARD_INTERVAL_TIME_SEC = 1800; // Default interval time for forwarding calls in seconds
const IVR_INPUT_HANDLER_ENDPOINT = "/api/v1/twilio/voice/ivr"; // Endpoint for handling IVR inputs
const IVR_HANDLER_ENDPOINT = "/api/v1/twilio/voice"; // Endpoint for general IVR handling
const callerLastAction = {}; // Object to store the last action performed by the caller

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Validate GOOGLE_APPLICATION_CREDENTIALS environment variable
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
  process.exit(1);
}

// Ensure the credentials file is readable
fs.access(credentialsPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error(`Cannot read file at ${credentialsPath}:`, err);
    process.exit(1);
  } else {
    console.log(`File at ${credentialsPath} is readable.`);
  }
});

// Initialize Google Cloud Speech client
const client = new SpeechClient({ keyFilename: credentialsPath });

async function handleTwilioVoice(req, res) {
  // Extracting necessary information from the request
  const callerNumber = req.body.From;
  const company_id = req.query.company_id;
  if (company_id) {
    req.body.CompanyId = company_id;
  }
  const currentTime = Date.now();
  const calledNumber = req.body.Called;
  // Create a separate object to store last action for each caller number and called number combination
  if (!callerLastAction[callerNumber]) {
    callerLastAction[callerNumber] = {};
  }
  const lastAction = callerLastAction[callerNumber];
  const twiml = new VoiceResponse(); // Creating a new Twilio VoiceResponse object
  let [ivrConfigError, ivrConfig] = await getIvrSettings({
    phoneNumber: calledNumber,
  }); // Retrieving IVR configuration based on the called number
  console.log(ivrConfig);
  // Handling the case when there's no IVR configuration for the called number
  if (!ivrConfig) {
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  // Retrieving forward configuration from the IVR configuration
  let forwardConfig = ivrConfig["forward"];
  let lastIvrOptions = forwardConfig?.["last_ivr_options"] || [];
  console.log(lastAction);
  console.log(currentTime);
  console.log(lastAction?.timestamp);
  console.log(lastIvrOptions);
  console.log(lastAction?.action);

  const conditionsone =
    lastAction &&
    currentTime - lastAction.timestamp <
      (forwardConfig?.["forward_interval_time_sec"] ||
        DEFAULT_FORWARD_INTERVAL_TIME_SEC) *
        1000 &&
    lastIvrOptions.includes(lastAction.action && `ivr_${lastAction.action}`);
  const conditionstwo =
    lastAction &&
    currentTime - lastAction.timestamp <
      (forwardConfig?.["forward_interval_time_sec"] ||
        DEFAULT_FORWARD_INTERVAL_TIME_SEC) *
        1000 &&
    lastAction.action === "forward";

  // Checking if the caller has recently selected an IVR option and whether to forward the call
  if (conditionsone || conditionstwo) {

    console.log( ivrConfig,"ivrcheck");
    // If conditions are met, play the forward message and dial the forward number
    let { voice: voiceFile, promptContent } = ivrConfig["ivr_forward"];
    if (voiceFile) {
      twiml.play(voiceFile);
    } else if (promptContent) {
      gather.say({ voice: 'woman' }, promptContent);
    }
    twiml.dial({ callerId: calledNumber }, ivrConfig["forward_number"][0]);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  // If no forward action is required, proceed with the welcome message
  const { promptContent, voice: welcomeMessageUrlsquare } =
    ivrConfig["ivr_prompt"];
  let { thankyouMessage, ivr_thankyou } = ivrConfig;
  thankyouMessage ||= ivr_thankyou;

  const gatherActionUrlsquare = IVR_INPUT_HANDLER_ENDPOINT;
  const gather = twiml.gather({
    numDigits: 1,
    action: gatherActionUrlsquare,
  });
  
  if (welcomeMessageUrlsquare) {
    gather.play(welcomeMessageUrlsquare);
  } else if (promptContent) {
    gather.say({ voice: 'woman' }, promptContent);
  } else {
    twiml.say({ voice: 'woman' }, "Sorry, something went wrong!");
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }
  if (thankyouMessage && thankyouMessage.voice) {
    twiml.play(thankyouMessage.voice);
  } else if (thankyouMessage && thankyouMessage.promptContent) {
    twiml.say({ voice: 'woman' }, thankyouMessage.promptContent);
  }
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
  let reportStatus = await SaveCdrReport(req.body); // Saving call detail records
  console.log("Reportstatus:",reportStatus);
  return;
}


// WebSocket server to receive media stream
wss.on('connection', (ws) => {
  console.log('WebSocket connected');

  let audioChunks = [];

  // Handle incoming messages (media stream) from Twilio
  ws.on('message', async (message) => {
    const msg = JSON.parse(message);
    switch (msg.event) {
      case 'connected':
        console.log('A new call connected');
        break;
      case 'start':
        console.log('Receiving audio..');
        break;
      case 'stop':
        console.log('Call ended');
        
        // Save audio chunks to a file
        const audioBuffer = Buffer.concat(audioChunks);
        fs.writeFileSync('audio.raw', audioBuffer);
        console.log('Saved audio to audio.raw');

        // Transcribe audio using Google Cloud Speech-to-Text
        try {
          const audioBytes = audioBuffer.toString('base64');
          const audio = { content: audioBytes };
          const config = {
            encoding: 'MULAW',
            sampleRateHertz: 8000,
            languageCode: 'en-US',
          };
          const request = { audio, config };

          const [response] = await client.recognize(request);
          const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

          console.log('Transcription:', transcription);
        } catch (error) {
          console.error('Error during transcription:', error);
        }
        
        // Clear audioChunks for the next call
        audioChunks = [];
        break;
      default:
        if (msg.media && msg.media.payload) {
          const audioPayload = Buffer.from(msg.media.payload, 'base64');
          audioChunks.push(audioPayload);
          console.log('Received audio payload');
        }
        break;
    }
  });

  // Handle WebSocket connection closing
  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
});


/* Function for handling user inputs during the Twilio voice call */
async function handleTwilioVoiceInputs(req, res) {
  // Extracting necessary information from the request
  const userInput = req.body.Digits;
  const calledNumber = req.body.Called;
  const twiml = new VoiceResponse(); // Creating a new Twilio VoiceResponse object
  const callerNumber = req.body.From;
  callerLastAction[callerNumber] = { action: userInput, timestamp: Date.now() };
  let [ivrConfigError, ivrConfig] = await getIvrSettings({
    phoneNumber: calledNumber,
  }); // Retrieving IVR configuration based on the called number

  // Handling the case when there's no IVR configuration for the called number
  if (!ivrConfig) {
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  // Handling the case when the user doesn't input any digit
  if (!userInput) {
    twiml.say({ voice: 'woman' }, "You didn't press any key. Goodbye!");
    twiml.gather({ numDigits: 1, action: IVR_INPUT_HANDLER_ENDPOINT });
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }
  let currentIVRKey = `ivr_${userInput}`;
  if (currentIVRKey == "ivr_0") {
    // Accessing welcome message URL from IVR configuration
    const { promptContent, voice: welcomeMessageUrlsquare } = ivrConfig["ivr_prompt"];
const gather = twiml.gather({ numDigits: 1 });
if (welcomeMessageUrlsquare) {
    gather.play(welcomeMessageUrlsquare);
} else if (promptContent) {
    gather.say({ voice: 'woman' }, promptContent);
} else {
    twiml.say({ voice: 'woman' }, "Welcome! Please press a key to continue.");
}
// Redirect to the input handler endpoint
twiml.redirect(IVR_INPUT_HANDLER_ENDPOINT);
res.writeHead(200, { "Content-Type": "text/xml" });
res.end(twiml.toString());
return;
}
  // if(currentIVRKey == "ivr_0"){
  //   if (welcomeMessageUrlsquare) {
  //     gather.play(welcomeMessageUrlsquare);
  //   } else if (promptContent) {
  //     gather.say({ voice: 'woman' }, promptContent);
  //   } else {
  //     twiml.say({ voice: 'woman' }, "Sorry, something went wrong!");
  //     res.writeHead(200, { "Content-Type": "text/xml" });
  //     res.end(twiml.toString());
  //     return;
  //   }
  // }
  console.log(`currentIVRKey ${currentIVRKey}`);
  let {
    available_ivr_options,
    invalid,
    ivr_invalid,
    thankyouMessage,
    ivr_thankyou,
  } = ivrConfig;
  invalid ||= ivr_invalid;
  thankyouMessage ||= ivr_thankyou;
  let isValidIVR = available_ivr_options.includes(currentIVRKey);
  if (!isValidIVR) {
    if (invalid && invalid.voice) {
      const gatherActionUrlsquare = IVR_INPUT_HANDLER_ENDPOINT;
      const gather = twiml.gather({
        numDigits: 1,
        action: gatherActionUrlsquare,
      });
      gather.play(invalid.voice);
    } else if (invalid && invalid.promptContent) {
      gather.say({ voice: 'woman' }, promptContent);
    }
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }
  let currentIVRoptions = ivrConfig["ivr_options"][currentIVRKey];

  // Handling the case when there's no configuration for the selected IVR option
  if (!currentIVRoptions) {
    twiml.say({ voice: 'woman' }, "Sorry, something went wrong!");
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }
  let {
    voice,
    promptContent,
    message,
    type = "call",
    forward,
    mainMenu,
  } = currentIVRoptions;
  if (voice && !mainMenu && !forward) {
    twiml.play(voice);
  }
  if (mainMenu) {
    const gather = twiml.gather({ numDigits: 1 });
    if (voice) {
      gather.play(voice);
    }
    // twiml.gather({
    //   numDigits: 1,
    //   action: IVR_INPUT_HANDLER_ENDPOINT,
    // });
    twiml.redirect(IVR_INPUT_HANDLER_ENDPOINT);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }
  if (message) {
    if (type === "call") {
      type = "sms";
    }
    let messageStatus = await sendMessage({ to: callerNumber, message });
    console.log(messageStatus);
  }
  if (forward) {
    if (voice) {
      twiml.play(voice);
    } else if (promptContent) {
      twiml.say({ voice: 'woman' }, promptContent);
    }
    // Check if there is a second number available
    if (ivrConfig["forward_number"].length > 1) {
      // If there is a second number, dial the first number with a timeout of 3 seconds
      const dialWithTimeout = twiml.dial({
        callerId: calledNumber,
        timeout: 6,
      });
      dialWithTimeout.number(ivrConfig["forward_number"][0]);
      // Dial the second number if the first one times out
      const dialAfterTimeout = twiml.dial({ callerId: calledNumber });
      dialAfterTimeout.number(
        {
          url: IVR_HANDLER_ENDPOINT,
        },
        ivrConfig["forward_number"][1]
      );
    } else {
      // If there's only one number, dial it without a timeout
      const dial = twiml.dial({ callerId: calledNumber });
      dial.number(ivrConfig["forward_number"][0]);
      console.log(ivrConfig["forward_number"][0]);
    }
    callerLastAction[callerNumber] = {
      action: "forward",
      timestamp: Date.now(),
    };
  } else if (thankyouMessage && thankyouMessage.voice) {
    twiml.play(thankyouMessage.voice);
  } else if (thankyouMessage && thankyouMessage.promptContent) {
    twiml.say({ voice: 'woman' }, thankyouMessage.promptContent);
  }
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
  req.body.CallType = type;
  let reportStatus = await UpdateCdrReport(req.body);
  console.log(reportStatus);
  return;
}

function getTwilioVoice(req, res) {
  res.json({ status: "success", message: "Hi! from server." });
}

module.exports = {
  getTwilioVoice,
  handleTwilioVoice,
  handleTwilioVoiceInputs,
};