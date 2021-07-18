const express = require("express");
const https = require("https");
const ejs = require("ejs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", function (req, res) {
  console.log("Someone just opened the root directory! :)");
  res.render("search");
});

app.get("/retry", function (req, res) {
  res.redirect("/");
});

app.post("/", function (req, res) {
  console.log("Post request received");
  displayWeather(req, res);
});

function displayWeather(req, res) {
  let city = req.body.cityName + ",";
  let country = req.body.countryName;
  let state = req.body.stateName;
  const apiKey = process.env.API_Key;
  const units = req.body.units;
  let url = "https://api.openweathermap.org/data/2.5/weather?q=" + city;
  let enteredState;
  if (country.toUpperCase().includes("US") && state.toUpperCase() != "") {
    state += ",";
    state = state.toUpperCase();
    url += state;
    enteredState = true;
  }
  url += country + "&appid=" + apiKey + "&units=" + units;
  https.get(url, function (httpResponse) {
    console.log(httpResponse.statusCode);
    console.log(url);

    //Success
    if (httpResponse.statusCode === 200) {
      httpResponse.on("data", function (data) {
        const weatherData = JSON.parse(data);
        const temp = Math.round(weatherData.main.temp);
        const realFeel = Math.round(weatherData.main.feels_like);
        const weatherMain = weatherData.weather[0].main;
        const weatherDesc = weatherData.weather[0].description;
        const letter = units === "Metric" ? "C" : "F";
        const minTemp = Math.round(weatherData.main.temp_min);
        const maxTemp = Math.round(weatherData.main.temp_max);
        const placeTimeinUTCSecs = weatherData.timezone;

        city = weatherData.name + ", ";
        country = weatherData.sys.country;

        const realFeelLine = "Real Feel: " + realFeel + " &#176;" + letter;
        const minTempLine = "Min: " + minTemp + " &#176;" + letter;
        const maxTempLine = "Max: " + maxTemp + " &#176;" + letter;

        const weatherIconUrl =
          "http://openweathermap.org/img/wn/" +
          weatherData.weather[0].icon +
          "@2x.png";

        const weatherDescLine =
          "The weather is currently: " + weatherMain + " - " + weatherDesc;
        const mainTempLine =
          "The temperature in " +
          city +
          " " +
          (enteredState ? state + " " : "") +
          country +
          " is " +
          temp +
          " &#176;" +
          letter;
        const moreTempLine =
          realFeelLine + ", " + minTempLine + ", " + maxTempLine;
        const ejsobj = {
          weatherDescLine: weatherDescLine,
          mainTempLine: mainTempLine,
          moreTempLine: moreTempLine,
          weatherIconUrl: weatherIconUrl,
        };

        res.render("weather", ejsobj);
      });
    } else {
      res.render("notfound");
    }
  });
}

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
