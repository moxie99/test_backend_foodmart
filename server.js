const express = require('express');
const { dbConnect } = require('./utils/db');
const app = express();
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const socket = require('socket.io');

const server = http.createServer(app);


const io = socket(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://foodmartdashboard.onrender.com',
      'https://foodmartuser.vercel.app',
      'https://foodmartdashboard.vercel.app',
    ],
    credentials: true,
  })
);
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/dashboard/categoryRoutes'));
app.use('/api', require('./routes/dashboard/productRoutes'));
app.use('/api', require('./routes/dashboard/sellerRoutes'));
app.use('/api/home', require('./routes/home/homeRoutes'));
app.use('/api', require('./routes/home/cardRoutes'));

app.use('/api', require('./routes/dashboard/dashboardIndexRoutes'));

app.get('/', (req, res) => res.send('Hello World!'));
const port = process.env.PORT;
dbConnect();
server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
