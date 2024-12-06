require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Database connection

mongoose
  .connect(process.env.REACT_APP_MONGO_URL)
  .then(() => console.log('Database connected'))
  .catch((err) => console.log('Database not connected', err));

// Middleware
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({  extended: false })); // For parsing application/x-www-form-urlencoded

// Routers
app.use('/', require('./routers/orderRouter'));
app.use('/stripe', require('./routers/stripeRouter'))

const port = 4004;

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});