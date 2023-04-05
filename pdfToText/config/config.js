import * as dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const MONDODB_URL = process.env.MONDODB_URL;