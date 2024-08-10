const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const morgan = require("morgan");
const app = express();
const corsOption = {
  origin: ['*'],
};
app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const router = require("./routes");
app.use(morgan('tiny'));
app.use('/api/v1', router)
module.exports = app
