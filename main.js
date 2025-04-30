const endpoints = {
  weather: (city) => `https://api.meteo.lt/v1/places/${city}/forecasts/long-term`,
  nasa: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
  quote: "https://api.quotable.io/random",
};

// Utility functions
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

async function getNasaImage() {
  const res = await fetch(endpoints.nasa);
  const data = await res.json();
  document.getElementById("nasaTitle").textContent = data.title;
  document.getElementById("nasaImage").src = data.url;
}

async function getQuote() {
  const res = await fetch(endpoints.quote);
  const data = await res.json();
  document.getElementById("quote").textContent = `"${data.content}"`;
  document.getElementById("author").textContent = `– ${data.author}`;
}

async function updateDashboard() {
  const city = document.getElementById("cityInput").value.trim().toLowerCase();
  if (!city) return;

  try {
    // Get weather data
    const res = await fetch(endpoints.weather(city));
    const data = await res.json();
    const forecasts = data.forecastTimestamps.slice(0, 24); // 24-hour forecast
    const now = forecasts[0];

    // Set current weather
    document.getElementById("currentTemp").textContent = `${now.airTemperature}°C`;
    document.getElementById("weatherCondition").textContent = formatCondition(now.conditionCode);
    document.getElementById("weatherLocation").textContent = data.place.name;
    document.getElementById("windSpeed").textContent = now.windSpeed;
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

    // Get other content
    await Promise.all([getNasaImage(), getQuote()]);
  } catch (err) {
    console.error("Error in updateDashboard():", err);
    alert("Something went wrong fetching data. Check console for details.");
  }
}

// Auto-fetch quote/NASA on load
window.onload = () => {
  getNasaImage();
  getQuote();
};
