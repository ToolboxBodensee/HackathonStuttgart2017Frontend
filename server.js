const express = require('express');
const path = require('path');
const app = express();

//********************************************************************************
// EXPRESS MIDDLEWARE
//********************************************************************************
const publicPath = path.join(__dirname, 'dist');
app.use('/', express.static(publicPath));

//********************************************************************************
// INIT SERVER
//********************************************************************************
const port = process.env.PORT || 9000;
app.listen(port, function () {
  console.log('listening on *:' + port);
});