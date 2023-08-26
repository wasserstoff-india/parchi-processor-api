import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PORT, SECRETKEY } from './config/config.js';
import router from './routes/index.js';
import db from './config/mongoose.js';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
app.use(
  cors({
    origin: '*',
    
  })
);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname + '/static'));

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
