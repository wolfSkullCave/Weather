export async function getWeatherData(key, location) {
  let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=metric&key=${key}&contentType=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    // console.log(`Current weather in ${location}:`, data.currentConditions);
    return data;
  } catch (e) {
    console.error("Error fetching weather data:", e);
  }
}

export function initWeatherWidget(key, location) {
  window.weatherWidgetConfig = window.weatherWidgetConfig || [];
  window.weatherWidgetConfig.push({
    selector: ".weatherWidget",
    apiKey: key, //Sign up for your personal key
    location: location, //Enter an address
    unitGroup: "metric", //"us" or "metric"
    forecastDays: 5, //how many days forecast to show
    title: location, //optional title to show in the
    showTitle: true,
    showConditions: true,
  });

  (function () {
    // render weather widget
    var d = document,
      s = d.createElement("script");
    s.src =
      "https://www.visualcrossing.com/widgets/forecast-simple/weather-forecast-widget-simple.js";
    s.setAttribute("data-timestamp", +new Date());
    (d.head || d.body).appendChild(s);
  })();
}
