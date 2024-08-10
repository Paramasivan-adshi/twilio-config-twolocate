require('dotenv').config({path: 'environments/server.env'})
const app = require("./app");
const port = process.env.PORT || 5000;

// // Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
