const { google } = require("googleapis");
const keys = require("../credentials.json");

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

const spreadsheetId = "16osS6lmrGozQiEAzJIu8XwlF4FAPUqIXnXtolWRMrvw";

module.exports = { sheets, spreadsheetId };