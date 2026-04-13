import "./styles.css";
import { addWidget, fetchWeatherData, getWeather } from "./weather-api";

const key = "WHNN7SGBSX9BJL6W9RJ9AGVEV";
let location = "Cape Town, South Africa";

// Test function
fetchWeatherData(key, location).then((data) => {
  console.log("test: ", data);

  addWidget(key, location);
  renderForecast(data);
});

function renderForecast(data) {
  const div = document.querySelector(".days");
  const grid = daysGrid(div);

  for (let i = 1; i < 8; i++) {
    createPara(formatDate(data.days[i].datetime), grid);

    const temp = `${data.days[i].temp}°C`;
    createPara(temp, grid);

    const icon = document.createElement("i");
    const iconClass = "wi icon wi-forecast-io-" + data.days[i].icon;
    icon.classList.add(...iconClass.trim().split(/\s+/));
    grid.appendChild(icon);

    // hours
    const morning = data.days[i].hours[8].icon;
    const afternoon = data.days[i].hours[12].icon;
    const evening = data.days[i].hours[18].icon;
    const night = data.days[i].hours[20].icon;

    createPara(data.days[i].description, grid);
  }
}

document.getElementById("location-btn").addEventListener("click", (event) => {
  event.preventDefault();
  const location = document.getElementById("location-input").value;
  addWidget(key, location);
  fetchWeatherData(key, location).then((data) => {
    renderForecast(data);
  });
});

function createPara(value, parent) {
  const p = document.createElement("p");
  p.textContent = value;
  parent.appendChild(p);
  return p;
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

function daysGrid(parent) {
  const grid = document.createElement("div");
  grid.classList.add("days-grid");
  parent.appendChild(grid);

  return grid;
}
