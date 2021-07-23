const express = require("express");
const https = require("https");
const ejs = require("ejs");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT ?? 3000;

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
  let city = req.body.cityName.trim() + ",";
  let country = req.body.countryName.trim();
  let state = req.body.stateName.trim();
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

    //Success
    if (httpResponse.statusCode === 200) {
      httpResponse.on("data", function (data) {
        const weatherData = JSON.parse(data);
        const letter = units === "Metric" ? "C" : "F";
        let printState = enteredState ? state + " " : "";
        success(weatherData, printState, letter, res);
      });
    } else {
      res.render("notfound");
    }
  });
}

function success(weatherData, state, letter, res) {
  const temp = Math.round(weatherData.main.temp);
  const realFeel = Math.round(weatherData.main.feels_like);
  const weatherMain = weatherData.weather[0].main;
  const weatherDesc = weatherData.weather[0].description;
  const minTemp = Math.round(weatherData.main.temp_min);
  const maxTemp = Math.round(weatherData.main.temp_max);

  city = weatherData.name + ", ";
  country = weatherData.sys.country;

  const degSymbol = "\xB0" + letter;
  const realFeelLine = "Real Feel: " + realFeel + degSymbol;
  const minTempLine = "Min: " + minTemp + degSymbol;
  const maxTempLine = "Max: " + maxTemp + degSymbol;

  const weatherIconUrl =
    "http://openweathermap.org/img/wn/" +
    weatherData.weather[0].icon +
    "@2x.png";

  const weatherDescLine =
    "The weather is currently: " + weatherMain + " - " + weatherDesc;
  const place = city + " " + state + country;
  const mainTempLine =
    "The temperature in " + place + " is " + temp + degSymbol;

  const moreTempLine = realFeelLine + ", " + minTempLine + ", " + maxTempLine;
  const ejsobj = {
    weatherDescLine: weatherDescLine,
    mainTempLine: mainTempLine,
    moreTempLine: moreTempLine,
    weatherIconUrl: weatherIconUrl,
  };

  res.render("weather", ejsobj);
}

app.listen(PORT, function () {
  console.log("Server is running on port 3000");
});
