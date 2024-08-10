const express = require("express");
const bodyParser = require("body-parser");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const axios = require("axios");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;

// Store the last call action for each caller number
const callerLastAction = {};

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/voice", (req, res) => {
 
  const callerNumber = req.body.From;
  const currentTime = Date.now();
  const calledNumber = req.body.Called; // Accessing the called number from the request body
  const lastAction = callerLastAction[callerNumber];

  const twiml = new VoiceResponse();
  const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify(req.body);

const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("https://24c1-115-99-53-36.ngrok-free.app/api/simmer/v1/accounts/callsystems/reports/calls", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
  fs.writeFile('body.json', JSON.stringify(req.body), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Lyric saved!');
});
  // If the caller has called within the last 30 minutes and pressed '3', connect them directly
  if (calledNumber === "+14087676481") {
    /*squarepietracking number*/ if (
      lastAction &&
      currentTime - lastAction.timestamp < 30 * 60 * 1000 &&
      lastAction.action === "3"
    ) {
      twiml.play(
        "https://storage.googleapis.com/simmerpublic/Paramasivan/square-pie-soma-Forw.wav"
      );
      twiml.dial({ callerId: "+14087676481" }, "+14089445273"); // Replace with the actual number
    } else {
      const welcomeMessageUrlsquare =
        "https://storage.googleapis.com/simmerpublic/Paramasivan/SPG%20Simmer%20Audio.wav";
      const gatherActionUrlsquare = "/handle-keypresssquare";

      // Generate TwiML to play welcome message and gather input simultaneously
      const gather = twiml.gather({
        numDigits: 1,
        action: gatherActionUrlsquare,
      });
      gather.play(welcomeMessageUrlsquare);
    }
  } else if (calledNumber === "+14089445273") {
    /*JJ chicken tracking number*/ // If the caller has called within the last 30 minutes and pressed '2', connect them directly
    if (
      lastAction &&
      currentTime - lastAction.timestamp < 30 * 60 * 1000 &&
      lastAction.action === "2"
    ) {
      twiml.play(
        "https://storage.googleapis.com/simmerpublic/Paramasivan/Restaurantconnectedvoice.mp3"
      );
      twiml.dial({ callerId: "+14089445273" }, "+15105531212"); // Restaurant's test direction
    } else {
      const welcomeMessageUrljj =
        "https://storage.googleapis.com/simmerpublic/Paramasivan/femalevoiceoutput.mp3";
      const gatherActionUrljj = "/handle-keypress";

      // Generate TwiML to play welcome message and gather input simultaneously
      const gather = twiml.gather({ numDigits: 1, action: gatherActionUrljj });
      gather.play(welcomeMessageUrljj);
    }
  } else if (calledNumber === "+19259318387") {
    /*Peony restaurant tracking number*/ // If the caller has called within the last 30 minutes and pressed '2', connect them directly
    if (
      lastAction &&
      currentTime - lastAction.timestamp < 30 * 60 * 1000 &&
      lastAction.action === "5"
    ) {
      twiml.play(
        "https://storage.googleapis.com/simmerpublic/Paramasivan/PeonyrestaurantConnect.mp3"
      );
      twiml.dial({ callerId: "+19259318387" }, "+19259308088"); // Restaurant's test direction //if they didnt picthe call in 3 ring it need to redirect to backoffice
    } else {
      // Welcome message with instructions
      const welcomeMessageUrl =
        "https://storage.googleapis.com/simmerpublic/Paramasivan/Peonywelcome/Peonynewwelcome.mp3";
      const gatherActionUrl = "/handle-keypeony";

      // Generate TwiML to play welcome message and gather input simultaneously
      const gather = twiml.gather({ numDigits: 1, action: gatherActionUrl });
      gather.play(welcomeMessageUrl);
    }
  } else if (calledNumber === "+17079857607") {
    /*Mountain mike tracking number*/ // If the caller has called within the last 30 minutes and pressed '3', connect them directly
    if (
      lastAction &&
      currentTime - lastAction.timestamp < 30 * 60 * 1000 &&
      lastAction.action === "3"
    ) {
      twiml.play(
        "https://storage.googleapis.com/simmerpublic/Paramasivan/Mountaincallconnect.mp3"
      );
      twiml.dial({ callerId: "+17079857607" }, "+17079806696"); // Restaurant's test direction
    } else {
      const welcomeMessageUrlmike =
        "https://storage.googleapis.com/simmerpublic/Paramasivan/Mountainintro.mp3";
      const gatherActionUrlmike = "/handle-keymike";

      // Generate TwiML to play welcome message and gather input simultaneously
      const gather = twiml.gather({
        numDigits: 1,
        action: gatherActionUrlmike,
      });
      gather.play(welcomeMessageUrlmike);
    }
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

// Route to handle keypress actions
app.post("/handle-keymike", (req, res) => {
  fs.writeFile('handle.json', JSON.stringify(req.body), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Lyric saved!');
});
  const userInput = req.body.Digits;
  const twiml = new VoiceResponse();

  // Store the current action for the caller's number
  const callerNumber = req.body.From;
  callerLastAction[callerNumber] = { action: userInput, timestamp: Date.now() };

  if (userInput === "1") {
    // If the user presses 1, inform them that their order menu will be sent through SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Mountainpickupmenu.mp3"
    );

    // Send the SMS message with the order menu
    const postData = {
      to: callerNumber,
      message:
        "To place your order (pickup) with Mountain Mikes in Vallejo,\nplease visit\nhttps://order.mountainmikespizza.com/?id=59GB6&str=mountain-mike-s-pizza-delivery-vallejo&mid=284&_gl=1*ib0190*_ga*MTA1NTg4NzI3Ni4xNzEyMDI2ODQ1*_ga_7BBS9PC1JM*MTcxMjcwMTY4OC4zLjAuMTcxMjcwMTY4OC42MC4wLjA.*_fplc*V1d1RUxrVDZiSTQxN0tMQmJhandxUWU3dG45Y1Z2ZHI0THM4RiUyRlZvRWJQbWI5WVVUeWpza1pKNHBQUTk3Z2ZKUG1EckRTaSUyQnolMkJacU9aTmJtQm8lMkJjd3dWT2c0eUc3THlXQmdoVWFTWER6cUczQkNJa3g2TlZiQmRTNDFleXclM0QlM0Q ",
    };
    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Pickup menu sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "2") {
    // If the user presses 2, inform them that their order menu will be sent through SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Mountaindeliverymenu.mp3"
    );

    // Send the SMS message with the order menu
    const postData = {
      to: callerNumber,
      message:
        "To place your order (delivery) with Mountain Mikes in Vallejo,\nplease visit\nhttps://order.mountainmikespizza.com/?id=59GB6&str=mountain-mike-s-pizza-delivery-vallejo&mid=284&_gl=1*jn1vpp*_ga*MTA1NTg4NzI3Ni4xNzEyMDI2ODQ1*_ga_7BBS9PC1JM*MTcxMjcwMTY4OC4zLjEuMTcxMjcwMTY5MS41Ny4wLjA.*_fplc*V1d1RUxrVDZiSTQxN0tMQmJhandxUWU3dG45Y1Z2ZHI0THM4RiUyRlZvRWJQbWI5WVVUeWpza1pKNHBQUTk3Z2ZKUG1EckRTaSUyQnolMkJacU9aTmJtQm8lMkJjd3dWT2c0eUc3THlXQmdoVWFTWER6cUczQkNJa3g2TlZiQmRTNDFleXclM0QlM0Q",
    };
    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Delivery menu sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "3") {
    // If the user presses 2, initiate a call to the restaurant
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Mountaincallconnect.mp3"
    );
    twiml.dial({ callerId: "+17079857607" }, "+17079806696"); // Restaurant's test direction
  } else {
    const invalidMessageUrlformike =
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Mountaininvalidinput.mp3";
    const gatherActionUrlformike = "/handle-keymike";

    // Generate TwiML to play welcome message and gather input simultaneously
    const gathermike = twiml.gather({
      numDigits: 1,
      action: gatherActionUrlformike,
    });
    gathermike.play(invalidMessageUrlformike);
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.post("/handle-keypress", (req, res) => {
  fs.writeFile('handle.json', JSON.stringify(req.body), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Lyric saved!');
});
  const userInput = req.body.Digits;
  const twiml = new VoiceResponse();

  // Store the current action for the caller's number
  const callerNumber = req.body.From;
  callerLastAction[callerNumber] = { action: userInput, timestamp: Date.now() };

  if (userInput === "1") {
    // If the user presses 1, inform them that their order menu will be sent through SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/smssentvoice.mp3"
    );

    // Send the SMS message with the order menu
    const postData = {
      to: callerNumber,
      message:
        "To place your order with JJ Fish & Chicken,\nplease visit\nhttps://www.doordash.com/store/jj-fish-&-chicken-oakland-175368/ ",
    };
    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Order menu sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "2") {
    // If the user presses 2, initiate a call to the restaurant
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/JJcallconnectfirst.mp3"
    );

    twiml.dial({ callerId: "+14089445273" }, "+15105531212"); // Restaurant's number jj redirect
  } else {
    const invalidMessageUrlforjj =
      "https://storage.googleapis.com/simmerpublic/Paramasivan/JJinvalidinput.mp3";
    const gatherActionUrlforjj = "/handle-keypress";

    // Generate TwiML to play welcome message and gather input simultaneously
    const gatherjj = twiml.gather({
      numDigits: 1,
      action: gatherActionUrlforjj,
    });
    gatherjj.play(invalidMessageUrlforjj);
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.post("/handle-keypresssquare", (req, res) => {
  const userInput = req.body.Digits;
  const twiml = new VoiceResponse();
  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/json");
  
  const raw = JSON.stringify(req.body);
  
  const requestOptions = {
    method: "PATCH",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  
  fetch("https://24c1-115-99-53-36.ngrok-free.app/api/simmer/v1/accounts/callsystems/reports/calls", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));

  fs.writeFile('handle.json', JSON.stringify(req.body), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Lyric saved!');
});

  // Store the current action for the caller's number
  const callerNumber = req.body.From;
  callerLastAction[callerNumber] = { action: userInput, timestamp: Date.now() };

  if (!userInput) {
    // No input
    twiml.say("You didn't press any key. Goodbye!");
  } else if (userInput === "1") {
    // Option 1: Send detailed menu via SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/square-pie-soma-OrderVc.wav"
    );

    const postData = {
      to: callerNumber,
      message:
        "To place your order with Square Pie Guys (Oakland), please visit https://messages.phonedash.us/hpsBlABWRM ",
    };
    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Order menu sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "2") {
    // Option 2: Send support and other information via SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/square-thankyou-mail.wav"
    );

    const postData = {
      to: callerNumber,
      message:
        "Thank you for your call! Let us help you:\n\n" +
        "Support - https://messages.phonedash.us/JMp6xtfkaa\n" +
        "Allergy Information - https://messages.phonedash.us/lizLWJuijL\n" +
        "Catering Inquiry - https://messages.phonedash.us/eTzHg7Nocz\n\n" +
        "If you have an urgent issue with an order you've already placed, your best bet is to place a new order and then email Oakland@Squarepieguys.com to let us know. We'll make sure to provide any refund or adjustment on the original order within 48 hours. During peak service hours it's difficult to adjust orders once they've been placed. Thank you for your understanding.",
    };

    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Order detailed menu sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "3") {
    // Option 3: Connect to restaurant
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/square-pie-soma-Forw.wav"
    );
    twiml.dial({ callerId: "+14089445273" }, "+14087676481"); // Restaurant's test direction
  } else if (userInput === "4") {
    // Option 4: Send email address via SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/square-thankyou-mail.wav"
    );

    const postData = {
      to: callerNumber,
      message:
        "Thank you for the call. We kindly request you to send us an email at oakland@squarepieguys.com",
    };

    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Mail message sent successfully");
      })
      .catch((error) => {
        console.error("Error sending email message:", error);
      });
  } else {
    // Invalid input
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Squarepieinvalid.mp3"
    );
    twiml.hangup();
  }
  twiml.gather({ numDigits: 1, action: "/handle-keypresssquare" });

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.post("/handle-keypeony", (req, res) => {
  const userInput = req.body.Digits;
  const twiml = new VoiceResponse();

  // Store the current action for the caller's number
  const callerNumber = req.body.From;
  callerLastAction[callerNumber] = { action: userInput, timestamp: Date.now() };

  if (userInput === "1") {
    // Option 4: Send email address via SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Peonyordermenu.mp3"
    );

    const postData = {
      to: callerNumber,
      message:
        "To place your order with Peony Garden,\nplease visit\nhttps://m.chinesemenu.com/us/304817527",
    };

    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Order link sent successfully");
      })
      .catch((error) => {
        console.error("Error sending email message:", error);
      });
  } else if (userInput === "2") {
    // Option 2: Send support and other information via SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/PeonyReservationlink.mp3"
    );

    const postData = {
      to: callerNumber,
      message:
        "To place your order (reservation) with Peony Garden\nplease visit\nhttps://www.google.com/maps/reserve/v/dine/c/JWQCdu_xB8g?source=pa&opi=89978449&hl=en-US&gei=ADgQZoSNI7-D0PEPwfqIwAs&sourceurl=https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dpeony%2Bgarden%2Bwalnut%2Bcreek%2C%2Bca%26oq%3Dpeony%2Bgarden%2Bwalnut%2Bcreek%2C%2Bca%26gs_lcrp%3DEgZjaHJvbWUyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIGCAMQRRhAMg0IBBAAGIYDGIAEGIoFMg0IBRAAGIYDGIAEGIoFMg0IBhAAGIYDGIAEGIoFMgYIBxBFGDzSAQoxMTE2NGowajE1qAIIsAIB%26sourceid%3Dchrome%26ie%3DUTF-8&ihs=1",
    };

    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Reservation link sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "3") {
    // Option 3:
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Addressbotsayonlydirectionsms.mp3"
    );
    const postData = {
      to: callerNumber,
      message:
        "Please click on the link https://www.google.com/maps/dir//1448+S+Main+St,+Walnut+Creek,+CA+94596,+United+States/@37.8915157,-122.1400144,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x808561dcdab77345:0xbc14273aee81a8b9!2m2!1d-122.0577098!2d37.8915203?entry=ttu to get directions to the restaurant.",
    };

    const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    axios
      .post(messageEndpoint, postData)
      .then((response) => {
        console.log("Address detailed  sent successfully");
      })
      .catch((error) => {
        console.error("Error sending order menu:", error);
      });
  } else if (userInput === "4") {
    // Option 1: Send detailed menu via SMS
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Peonywelcome/Peonybusinessnewhours.mp3"
    );

    // const postData = {
    //   to: callerNumber,
    //   message:
    //     "Our business hours are as follows:\n\nSunday to Thursday: 11:00am-3:00pm, 4:30pm-9:00pm\nFriday and Saturday: 11:00am-3:00pm, 4:30pm-9:30pm",
    // };

    // const messageEndpoint = "https://pbx.phonedash.us/api/v1/message";
    // axios
    //   .post(messageEndpoint, postData)
    //   .then((response) => {
    //     console.log("Business hours sent successfully");
    //   })
    //   .catch((error) => {
    //     console.error("Error sending order menu:", error);
    //   });
  } else if (userInput === "5") {
    // Option 5: Connect to restaurant
    twiml.play(
      "https://storage.googleapis.com/simmerpublic/Paramasivan/PeonyrestaurantConnect.mp3"
    );
    const dial = twiml.dial({ callerId: "+19259318387", timeout: 6 });

    // First, try dialing the main number
    dial.number("+19259308088");

    const dialofficenumber = twiml.dial({ callerId: "+19259318387" });
    // If the call is not answered within 10 seconds, redirect to another number
    dialofficenumber.number(
      {
        url: "https://twilio.trysimmer.com/voice",
      },
      "+19259308089"
    );

    console.log(twiml.toString());
  } else if (userInput === "0") {
        // Option 0: repeat option
    const RepeatmessageUrl =
      "https://storage.googleapis.com/simmerpublic/Paramasivan/Peonywelcome/Peonyrepeatoption.mp3";
    const gatherActionUrlpeony = "/handle-keypeony";

    // Generate TwiML to play welcome message and gather input simultaneously
    const gather = twiml.gather({
      numDigits: 1,
      action: gatherActionUrlpeony,
    });
    gather.play(RepeatmessageUrl);

    // Add a pause of 1 second (1000 milliseconds)
    twiml.pause({ length: 1 });
  } else {
    if (!userInput) {
      // No input
      twiml.say("You didn't press any key. Goodbye!");
    } else {
      const invalidMessageUrl =
        "https://storage.googleapis.com/simmerpublic/Paramasivan/Peonyinvalidinput.mp3";
      const gatherActionUrl = "/handle-keypeony";

      // Generate TwiML to play welcome message and gather input simultaneously
      const gather = twiml.gather({ numDigits: 1, action: gatherActionUrl });
      gather.play(invalidMessageUrl);
    }
  }

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

// Default route for other requests
app.all("/", (req, res) => {
  res.send(
    "<Response><Say>Hii with old changes address and hours</Say></Response>"
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
