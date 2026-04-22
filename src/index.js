import "./styles2.css";
// import "./styles3.css";
import { initWeatherWidget, getWeatherData, getWeather } from "./weather-api";

const key = "WHNN7SGBSX9BJL6W9RJ9AGVEV";

const celciusSymbol = "°C";

// This tells Webpack to include ALL svgs from that folder in the build
const iconContext = require.context("./assets/icons", false, /\.svg$/);

// testData();

async function testData() {
  let testData = localStorage.getItem("testData");

  if (!testData) {
    testData = await getWeatherData(key, "cape town");
    localStorage.setItem("testData", JSON.stringify(testData));
  }

  testData = JSON.parse(testData);
  const forcastWeek = getWeeklyForecast(testData);
  renderWeatherForecast(forcastWeek);
  document.querySelector(".locationTitle").textContent = "Cape Town";

  console.log(testData);
}

async function main(key, location) {
  // render weather data for this week
  const weatherData = await getWeatherData(key, location);
  // console.log(weatherData);

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

    // cleanup search input
    document.getElementById("location-input").value = "";
  });

document
  .getElementById("location-input")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const location = document.getElementById("location-input").value;

      document.querySelector(".locationTitle").textContent = location;
      await main(key, location);

      // cleanup search input
      document.getElementById("location-input").value = "";
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

    const currentTemp = clone.querySelector(".weather-deatails__current-temp");
    currentTemp.textContent = day.temperature.current + celciusSymbol;
    currentTemp.classList.add("temp-mild");
    if (day.temperature.current > 30) {
      currentTemp.classList.add("temp-hot");
    }

    if (day.temperature.current < 10) {
      currentTemp.classList.add("temp-cold");
    }

    clone.querySelector(".weather-details__temp").textContent =
      `Highest: ${day.temperature.highest}${celciusSymbol} / Lowest: ${day.temperature.lowest}${celciusSymbol}`;

    clone.querySelector(".morningImg").src =
      `assets/icons/${day.phases.morning}.svg`;
    clone.querySelector(".afternoonImg").src =
      `assets/icons/${day.phases.afternoon}.svg`;
    clone.querySelector(".eveningImg").src =
      `assets/icons/${day.phases.evening}.svg`;
    clone.querySelector(".nightImg").src =
      `assets/icons/${day.phases.night}.svg`;

    clone.querySelector(".weather-details__rain").textContent =
      `Chance of rain: ${day.rain}%`;

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
        morning: currentDay.hours[7].icon,
        afternoon: currentDay.hours[12].icon,
        evening: currentDay.hours[18].icon,
        night: currentDay.hours[22].icon,
      },
      icon: currentDay.icon,
      rain: currentDay.precipprob,
    };
    forecastedDays.push(dayDetails);
  }
  // console.log("forcast days", forecastedDays);
  return forecastedDays;
}
