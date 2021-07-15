const express = require("express");
const https = require("https");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  console.log("Someone just opened the root directory! :)");
  res.sendFile(__dirname + "/index.html");
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
    //Styling code
    res.write(
      "<style> body { background-color: teal; color: #fff; font-family: Verdana, sans-serif; padding: 5% } </style>"
    );

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

        res.write(
          "<h1> The weather is currently: " +
            weatherMain +
            " - " +
            weatherDesc +
            " </h1>"
        );
        //Only include state if they entered one
        res.write(
          "<h1>The temperature in " +
            city +
            " " +
            (enteredState ? state + " " : "") +
            country +
            " is " +
            temp +
            " &#176;" +
            letter +
            " </h1>"
        );
        const realFeelLine = "Real Feel: " + realFeel + " &#176;" + letter;
        const minTempLine = "Min: " + minTemp + " &#176;" + letter;
        const maxTempLine = "Max: " + maxTemp + " &#176;" + letter;

        res.write(
          "<h1>" +
            realFeelLine +
            ", " +
            minTempLine +
            ", " +
            maxTempLine +
            " </h1>"
        );

        const weatherIconUrl =
          "http://openweathermap.org/img/wn/" +
          weatherData.weather[0].icon +
          "@2x.png";
        res.write(
          "<img src=" +
            weatherIconUrl +
            " alt='weather-img' style='width: 25%' >"
        );

        //Search again button css
        res.write(
          "<style>button{height: 50px; width: max-content; border-radius: 50px; background-color: rgb(67, 67, 231); cursor: pointer; font-size: 1.5rem; border: 2px solid black; color: rgb(228, 233, 245); position: relative; bottom: 150px;left: 50px; padding: 10px;}button:hover{background-color: rgb(70, 33, 156);}form{width: max-content;display: inline-block;}</style>"
        );
      });
    } else {
      //Some problem
      res.write("<h1> Uh Oh :( </h1>");

      res.write("<h1>This place does not exist yet :) </h1>");

      //Seach again button css
      res.write(
        "<style>button{height: 50px; width: max-content; border-radius: 50px; background-color: rgb(67, 67, 231); cursor: pointer; font-size: 1.5rem; border: 2px solid black; color: rgb(228, 233, 245); padding: 10px;}button:hover{background-color: rgb(70, 33, 156);}form{width: max-content; display: inline-block;}</style>"
      );
    }
    //Search again button
    setTimeout(function () {
      res.write(
        "<form action='/retry' method='GET'><button type='submit'>SEARCH AGAIN</button></form>"
      );
    }, 700);
    //Footer
    setTimeout(function () {
      res.write(
        "<style> footer{font-size:.8rem;text-align:center;color:#e0e0e0}#my{text-decoration:none;color:#42e3e9}#my:hover{font-weight:700;color:#8ce7eb} </style>"
      );
      res.write(
        "<footer><script crossorigin=anonymous src=https://kit.fontawesome.com/68e357ed07.js></script><p class=last-line>Made with <i class='fa-heart fas'id=heart></i> by <a href=https://www.jainsavar.com id=my rel='noopener noreferrer'target=_blank>Savar Jain</a></footer>"
      );
      res.send();
    }, 750);
  });
}

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
