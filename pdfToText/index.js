import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PORT } from "./config/config.js";
import router from "./routes/index.js";

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*'
}));

app.use("/", router);

app.listen(PORT, (error) => {
  if (error) {
    console.log(`Error connecting to port ${PORT}`);
  } else {
    console.log(`Successfully connected to port ${PORT}`);
  }
});