import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PORT, SECRETKEY } from './config/config.js';
import router from './routes/index.js';
import db from './config/mongoose.js';
import session from 'express-session';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
  })
);

app.use(
  session({
    secret: SECRETKEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use('/', router);

app.listen(PORT, (error) => {
  if (error) {
    console.log(`Error connecting to port ${PORT}`);
  } else {
    console.log(`Successfully connected to port ${PORT}`);
  }
});
