import "./styles.css";
import { addWidget, fetchWeatherData, getWeather } from "./weather-api";

const key = "WHNN7SGBSX9BJL6W9RJ9AGVEV";
let location = "Cape Town, South Africa";

fetchWeatherData(key, location).then((weatherData) => {
  console.log("Test:", weatherData);
});

document.getElementById("location-btn").addEventListener("click", (event) => {
  event.preventDefault();
  const location = document.getElementById("location-input").value;
  addWidget(key, location);
  fetchWeatherData(key, location).then((data) => {
    days(data);
  });
});

function days(data) {
  console.log("days:", data.days);
}
