const express = require('express');
const { dbConnect } = require('./utils/db');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(
  cors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://foodmart-o1ja.onrender.com',
      'https://foodmartuser.vercel.app/',
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/productRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));
app.use('/api/home', require('./routes/home/homeRoutes'));
app.use('/api', require('./routes/home/cardRoutes'));
app.get('/', (req, res) => res.send('Hello World!'));
const port = process.env.PORT;
dbConnect();
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
