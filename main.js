// main.js

const endpoints = {
  weather: (city) => `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`,
  nasa: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
  quote: "https://api.quotable.io/random",
};

async function getWeather(city) {
  const response = await fetch(endpoints.weather(city));
  if (!response.ok) throw new Error("Weather API error");
  const data = await response.json();
  const current = data.forecastTimestamps[0];
  return {
    temp: current.airTemperature,
    feelsLike: current.feelsLikeTemperature,
    wind: current.windSpeed,
    condition: current.conditionCode,
  };
}

async function getNasaImage() {
  const res = await fetch(endpoints.nasa);
  if (!res.ok) throw new Error("NASA API error");
  const data = await res.json();
  return {
    title: data.title,
    url: data.url,
    description: data.explanation,
  };
}

async function getQuote() {
  const res = await fetch(endpoints.quote);
  if (!res.ok) throw new Error("Quote API error");
  const data = await res.json();
  return {
    content: data.content,
    author: data.author,
  };
}

async function updateDashboard(city) {
  try {
    document.getElementById("weatherInfo").textContent = "Loading...";
    document.getElementById("nasaImage").textContent = "";
    document.getElementById("dailyQuote").textContent = "";

    const [weather, nasa, quote] = await Promise.all([
      getWeather(city),
      getNasaImage(),
      getQuote(),
    ]);

    document.getElementById("weatherInfo").innerHTML = `
      <h3>🌤️ Weather in ${city}</h3>
      <p>🌡️ Temp: ${weather.temp}°C (feels like ${weather.feelsLike}°C)</p>
      <p>💨 Wind: ${weather.wind} m/s</p>
   <p>🌥️ Condition: ${formatCondition(weather.condition)} ${getWeatherIcon(weather.condition)}</p>
    `;

    document.getElementById("nasaImage").innerHTML = `
      <h3>📸 NASA APOD</h3>
      <img src="${nasa.url}" alt="NASA Image of the Day" style="max-width: 100%" />
      <p><strong>${nasa.title}</strong></p>
      <p>${nasa.description}</p>
    `;

    document.getElementById("dailyQuote").innerHTML = `
      <h3>💬 Quote of the Day</h3>
      <blockquote>"${quote.content}"</blockquote>
      <footer>— ${quote.author}</footer>
    `;
  } catch (err) {
    console.error(err);
    alert("Something went wrong fetching data. Check console for details.");
  }
}

document.getElementById("fetchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim().toLowerCase();
  if (city) updateDashboard(city);



function formatCondition(code) {
  return code.replace(/-/g, ' ');
}

function getWeatherIcon(code) {
  const iconMap = {
    clear: '☀️',
    partly_cloudy: '⛅',
    cloudy: '☁️',
    rain: '🌧️',
    light_rain: '🌦️',
    heavy_rain: '🌧️',
    thunder: '⛈️',
    snow: '❄️',
    fog: '🌫️',
    sleet: '🌨️'
  };

  return iconMap[code.replace(/-/g, '_')] || '🌡️';
}

  function formatHourLabel(iso) {
  const date = new Date(iso);
  return `${date.getHours().toString().padStart(2, '0')}:00`;
}

function getIconFromCondition(code) {
  const map = {
    clear: "☀️",
    "partly-cloudy": "⛅",
    cloudy: "☁️",
    rain: "🌧️",
    "light-rain": "🌦️",
    thunder: "⛈️",
    snow: "❄️",
    fog: "🌫️",
  };
  return map[code] || "❔";
}

async function updateDashboard(city) {
  try {
    const res = await fetch(`https://api.meteo.lt/v1/places/${city}/forecasts/long-term`);
    const data = await res.json();
    const forecasts = data.forecastTimestamps.slice(0, 24); // first 24 values

    // Current weather
    const now = forecasts[0];
    document.getElementById("currentTemp").textContent = `${now.airTemperature}°C`;
    document.getElementById("weatherCondition").textContent = now.conditionCode.replace(/-/g, ' ');
    document.getElementById("weatherLocation").textContent = data.place.name;
    document.getElementById("windSpeed").textContent = now.windSpeed;
    document.getElementById("weatherIcon").src = ""; // You can add local icons later
    document.getElementById("weatherIcon").alt = now.conditionCode;

    // Hourly forecast
    const hourlyDiv = document.getElementById("hourlyForecast");
    hourlyDiv.innerHTML = "";

    forecasts.forEach(f => {
      const hourBlock = document.createElement("div");
      hourBlock.className = "hour";

      hourBlock.innerHTML = `
        <div>${formatHourLabel(f.forecastTimeUtc)}</div>
        <div style="font-size: 1.2em;">${getIconFromCondition(f.conditionCode)}</div>
        <div><strong>${f.airTemperature}°C</strong></div>
      `;

      hourlyDiv.appendChild(hourBlock);
    });
  } catch (err) {
    console.error("Weather error:", err);
    alert("Could not fetch weather data.");
  }
}

  
});
