const router  = require('express').Router()
const TwilioVoiceRouter = require("./TwilioVoice");
router.use('/twilio/voice', TwilioVoiceRouter)

module.exports = router