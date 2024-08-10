const VoiceResponse = require("twilio").twiml.VoiceResponse; 
const getIvrSettings = require("../model/IvrSettings");
const { SaveCdrReport, UpdateCdrReport } = require("../model/cdrReport");
const sendMessage = require("../model/sendMessage");

const DEFAULT_FORWARD_INTERVAL_TIME_SEC = 1800;
const IVR_INPUT_HANDLER_ENDPOINT = "/api/v1/twilio/voice/ivr";
const IVR_HANDLER_ENDPOINT = "/api/v1/twilio/voice";
const callerLastAction = {};
const originalCallerNumbers = {}; // Store original caller numbers

async function handleTwilioVoice(req, res) {
  const callerNumber = req.body.From;
  const callertoNumber = req.body.To;
  const company_id = req.query.company_id;
  const callId = req.body.CallSid; 

  if (!originalCallerNumbers[callId]) {
    originalCallerNumbers[callId] = callerNumber;
  }

  const actionKey = `${callerNumber}_${callertoNumber}`;
  if (company_id) {
    req.body.CompanyId = company_id;
  }
  
  const currentTime = Date.now();
  const calledNumber = req.body.Called;
  const lastAction = callerLastAction[actionKey] || {};
  const twiml = new VoiceResponse(); 

  let [ivrConfigError, ivrConfig] = await getIvrSettings({ phoneNumber: calledNumber });

  if (!ivrConfig) {
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  let forwardConfig = ivrConfig["forward"];
  let lastIvrOptions = forwardConfig?.["last_ivr_options"] || [];

   // Bypass forwarding logic for the specific number +14155490811
   if (callertoNumber !== "+14155490811") {
    // Construct a key based on caller number and called number
const actionKey = `${callerNumber}_${callertoNumber}`;
// Initialize lastAction for this key if not already set
if (!callerLastAction[actionKey]) {
  callerLastAction[actionKey] = {};
}

const lastAction = callerLastAction[actionKey];

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

// Check if conditions are met and forward if necessary
if (callertoNumber !== "+14155490811" && (conditionsone || conditionstwo)) {
  console.log(ivrConfig, "ivrcheck");
  // If conditions are met, play the forward message and dial the forward number
  let { voice: voiceFile, promptContent } = ivrConfig["ivr_forward"];
  if (voiceFile) {
    twiml.play(voiceFile);
  } else if (promptContent) {
    gather.say({ voice: "woman" }, promptContent);
  }
  twiml.dial({ callerId: calledNumber }, ivrConfig["forward_number"][0]);
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
  return;
}
  }

  const { promptContent, voice: welcomeMessageUrlsquare } = ivrConfig["ivr_prompt"];
  let { thankyouMessage, ivr_thankyou } = ivrConfig;
  thankyouMessage ||= ivr_thankyou;

  const gatherActionUrlsquare = IVR_INPUT_HANDLER_ENDPOINT;
  const gather = twiml.gather({ numDigits: 1, action: gatherActionUrlsquare });

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
  let reportStatus = await SaveCdrReport(req.body);
  return;
}

async function handleTwilioVoiceInputs(req, res) {
  const userInput = req.body.Digits;
  const calledNumber = req.body.Called;
  const twiml = new VoiceResponse(); 
  const callerNumber = req.body.From;
  const callId = req.body.CallSid; 
  const originalCallerNumber = originalCallerNumbers[callId]; 

  const actionKey = `${callerNumber}_${calledNumber}`;
  if (!callerLastAction[actionKey]) {
    callerLastAction[actionKey] = {};
  }

  callerLastAction[actionKey] = { action: userInput, timestamp: Date.now() };
  let [ivrConfigError, ivrConfig] = await getIvrSettings({ phoneNumber: calledNumber });

  if (!ivrConfig) {
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  if (!userInput) {
    twiml.say({ voice: 'woman' }, "You didn't press any key. Goodbye!");
    twiml.gather({ numDigits: 1, action: IVR_INPUT_HANDLER_ENDPOINT });
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }
  
  let currentIVRKey = `ivr_${userInput}`;
  if (currentIVRKey === "ivr_0") {
    const { promptContent, voice: welcomeMessageUrlsquare } = ivrConfig["ivr_prompt"];
    const gather = twiml.gather({ numDigits: 1 });
    if (welcomeMessageUrlsquare) {
      gather.play(welcomeMessageUrlsquare);
    } else if (promptContent) {
      gather.say({ voice: 'woman' }, promptContent);
    } else {
      twiml.say({ voice: 'woman' }, "Welcome! Please press a key to continue.");
    }
    twiml.redirect(IVR_INPUT_HANDLER_ENDPOINT);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

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
      const gather = twiml.gather({ numDigits: 1, action: gatherActionUrlsquare });
      gather.play(invalid.voice);
    } else if (invalid && invalid.promptContent) {
      twiml.say({ voice: 'woman' }, invalid.promptContent);
    }
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  let currentIVRoptions = ivrConfig["ivr_options"][currentIVRKey];

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
    forward1,
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
    twiml.redirect(IVR_INPUT_HANDLER_ENDPOINT);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    return;
  }

  if (message) {
    if (type === "call") {
      type = "sms";
    }
    let messageStatus = await sendMessage({ to: originalCallerNumber, message });
    console.log("originalnumberdis",originalCallerNumber)
  }

  if (forward) {
    if (voice) {
      twiml.play(voice);
    } else if (promptContent) {
      twiml.say({ voice: 'woman' }, promptContent);
    }
    if (ivrConfig["forward_number"].length > 1) {
      const dialWithTimeout = twiml.dial({ callerId: originalCallerNumber, timeout: 6 });
      dialWithTimeout.number(ivrConfig["forward_number"][0]);
      const dialAfterTimeout = twiml.dial({ callerId: originalCallerNumber });
      dialAfterTimeout.number({ url: IVR_HANDLER_ENDPOINT }, ivrConfig["forward_number"][1]);
    } else {
      const dial = twiml.dial({ callerId: originalCallerNumber });
      dial.number(ivrConfig["forward_number"][0]);
    }
    callerLastAction[actionKey] = {
      action: "forward",
      timestamp: Date.now(),
    };
  } else if (forward1) {
    if (ivrConfig["forward_number1"].length > 1) {
      const dialWithTimeout = twiml.dial({ callerId: originalCallerNumber, timeout: 6 });
      dialWithTimeout.number(ivrConfig["forward_number1"][0]);
      const dialAfterTimeout = twiml.dial({ callerId: originalCallerNumber });
      dialAfterTimeout.number({ url: IVR_HANDLER_ENDPOINT }, ivrConfig["forward_number1"][1]);
    } else {
      const dial = twiml.dial({ callerId: originalCallerNumber });
      dial.number(ivrConfig["forward_number1"][0]);
    }
    callerLastAction[actionKey] = {
      action: "forward1",
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
