const { getTwilioVoice, handleTwilioVoice, handleTwilioVoiceInputs} = require('../controllers/TwilioVoice');
const TwilioVoiceRouter = require('express').Router()

TwilioVoiceRouter.get('/', getTwilioVoice)
TwilioVoiceRouter.post('/', handleTwilioVoice)
TwilioVoiceRouter.post('/ivr', handleTwilioVoiceInputs)


module.exports = TwilioVoiceRouter;