import * as dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const MONDODB_URL = process.env.MONDODB_URL;
export const SUMMARY_URL = process.env.SUMMARY_URL;
export const VISION_API = process.env.VISION_API;
export const AUTHRIZATION  = process.env.AUTHORIZATION;