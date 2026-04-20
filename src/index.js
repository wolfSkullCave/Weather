import "./styles.css";
import { initWeatherWidget, getWeatherData, getWeather } from "./weather-api";

const key = "WHNN7SGBSX9BJL6W9RJ9AGVEV";
let location = "Cape Town, South Africa";
const celciusSymbol = "°C";

// This tells Webpack to include ALL svgs from that folder in the build
const iconContext = require.context("./assets/icons", false, /\.svg$/);

async function main(key, location) {
  // get data from API and/or local storage
  let weatherData = JSON.parse(localStorage.getItem("weatherData"));
  const now = Date.now();
  const oneHour = 3600000; // 1 hour in milliseconds

  // Check if data exists and is less than 1 hour old
  const isDataFresh =
    weatherData &&
    now - weatherData.currentConditions.datetimeEpoch * 1000 < oneHour;

  if (!isDataFresh) {
    weatherData = await getWeatherData(key, location);
    localStorage.setItem("weatherData", JSON.stringify(weatherData));
  }

  // render weather data for this week
  const forcast_week = getWeeklyForecast(weatherData);
  // console.log("Upcoming week:", forcast_week);

  renderWeatherForecast(forcast_week);
}

document
  .getElementById("location-btn")
  .addEventListener("click", async (event) => {
    // renders weather detailed view based on search results
    event.preventDefault();
    const location = document.getElementById("location-input").value;

    document.querySelector(".locationTitle").textContent = location;
    await main(key, location);
  });

document
  .getElementById("location-input")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const location = document.getElementById("location-input").value;

      document.querySelector(".locationTitle").textContent = location;
      await main(key, location);
    }
  });

function renderForecast(week) {
  const div = document.querySelector(".weather-details");
  const grid = createGridDiv(div);

  for (let i = 0; i < 8; i++) {
    createPara(formatDate(week.days[i].datetime), grid);

    const temp = `${week.days[i].temp}°C`;
    createPara(temp, grid);

    const icon = document.createElement("i");
    const iconClass = "wi icon wi-forecast-io-" + week.days[i].icon;
    icon.classList.add(...iconClass.trim().split(/\s+/));
    grid.appendChild(icon);

    // hours
    const morning = week.days[i].hours[8].icon;
    const afternoon = week.days[i].hours[12].icon;
    const evening = week.days[i].hours[18].icon;
    const night = week.days[i].hours[20].icon;

    createPara(week.days[i].description, grid);
  }
}

function createPara(value, parent) {
  // creates a p tag for use in dom
  const p = document.createElement("p");
  p.textContent = value;

  // renders the p tag to dom
  parent.appendChild(p);
  return p;
}

function formatDate(datetimeEpoch) {
  // formats an ISO date string (e.g., "2024-06-09") to "Weekday, DD Mon"
  // (e.g., "Sunday, 09 Jun")
  const date = new Date(datetimeEpoch * 1000);
  const localeDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return localeDate;
}

// Creates and appends a div with class "days-grid" to the given parent element, returning the new div.
function createGridDiv(parent) {
  const grid = document.createElement("div");
  grid.classList.add("days-grid");
  parent.appendChild(grid);

  return grid;
}

async function renderWeatherForecast(weeklyForecast) {
  // console.log("weelky forecast:", weeklyForecast);

  const grid = document.getElementById("weatherWeek");
  const template = document.getElementById("weekDetails");

  grid.innerHTML = "";

  weeklyForecast.forEach((day) => {
    // Clone template content
    const clone = template.content.cloneNode(true);

    // Update clone's elements
    clone.querySelector(".weather-details__date").textContent = day.date;
    clone.querySelector(".weather-details__temp").textContent =
      `Highest: ${day.temperature.highest}${celciusSymbol} / Lowest: ${day.temperature.lowest}${celciusSymbol}`;
    clone.querySelector(".weather-details__phases").textContent =
      `Morning: ${day.phases.morning}${celciusSymbol} / Afternoon: ${day.phases.afternoon}${celciusSymbol} / Evening: ${day.phases.evening}${celciusSymbol} / Night: ${day.phases.night}${celciusSymbol}`;
    clone.querySelector(".weather-details__rain").textContent =
      `Chance of rain: ${day.rain}`;
    clone.querySelector(".weather-details__icon").src =
      `assets/icons/${day.icon}.svg`;

    grid.appendChild(clone);
  });
}

function getWeeklyForecast(data) {
  const forecastedDays = []; // array containing the forcast for the upcoming week
  for (let i = 0; i < 8; i++) {
    const currentDay = data.days[i];
    const dayDetails = {
      date: formatDate(currentDay.datetimeEpoch),
      temperature: {
        highest: currentDay.tempmax,
        lowest: currentDay.tempmin,
        current: currentDay.temp,
      },
      phases: {
        morning: currentDay.hours[7].temp,
        afternoon: currentDay.hours[12].temp,
        evening: currentDay.hours[18].temp,
        night: currentDay.hours[22].temp,
      },
      icon: currentDay.icon,
      rain: currentDay.precipprob,
    };
    forecastedDays.push(dayDetails);
  }
  // console.log("forcast days", forecastedDays);
  return forecastedDays;
}
