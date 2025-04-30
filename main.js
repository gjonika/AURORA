// main.js

const API_BASE_URL = 'https://api.meteo.lt/v1';

const placeSelect = document.getElementById('place-select');
const getWeatherBtn = document.getElementById('get-weather-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const weatherContent = document.getElementById('weather-content');
const tabButtons = document.querySelectorAll('.tab-button');
const forecastContent = document.querySelectorAll('.forecast-content');

let temperatureChart = null;

const conditionIcons = {
  'clear': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/clear-day.svg',
  'isolated-clouds': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/partly-cloudy-day.svg',
  'scattered-clouds': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/cloudy.svg',
  'overcast': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/overcast.svg',
  'light-rain': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/rain.svg',
  'moderate-rain': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/rain.svg',
  'heavy-rain': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/thunderstorms-rain.svg',
  'sleet': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/sleet.svg',
  'light-snow': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/snow.svg',
  'moderate-snow': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/snow.svg',
  'heavy-snow': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/snow.svg',
  'fog': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/fog.svg',
  'na': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/not-available.svg'
};

const conditionDescriptions = {
  'clear': 'Clear Sky',
  'isolated-clouds': 'Isolated Clouds',
  'scattered-clouds': 'Scattered Clouds',
  'overcast': 'Overcast',
  'light-rain': 'Light Rain',
  'moderate-rain': 'Moderate Rain',
  'heavy-rain': 'Heavy Rain',
  'sleet': 'Sleet',
  'light-snow': 'Light Snow',
  'moderate-snow': 'Moderate Snow',
  'heavy-snow': 'Heavy Snow',
  'fog': 'Fog',
  'na': 'Not Available'
};

document.addEventListener('DOMContentLoaded', () => {
  fetchPlaces();
  getWeatherBtn.addEventListener('click', getWeather);
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      forecastContent.forEach(tab => tab.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
    });
  });
});

function fetchPlaces() {
  const cities = ['vilnius', 'kaunas', 'klaipeda', 'siauliai', 'panevezys'];
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    placeSelect.appendChild(option);
  });
}

async function getWeather() {
  const city = placeSelect.value;
  if (!city) return alert('Select a city');

  loadingIndicator.style.display = 'block';
  weatherContent.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE_URL}/places/${city}/forecasts/long-term`);
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    alert('Failed to fetch weather');
    console.error(err);
  }

  loadingIndicator.style.display = 'none';
  weatherContent.style.display = 'block';
}

function displayWeather(data) {
  const now = data.forecastTimestamps[0];
  document.getElementById('location-name').textContent = data.place.name;
  document.getElementById('current-date').textContent = new Date(now.forecastTimeUtc).toDateString();
  document.getElementById('current-temp').textContent = `${Math.round(now.airTemperature)}°C`;
  document.getElementById('current-condition-icon').src = conditionIcons[now.conditionCode] || conditionIcons['na'];
  document.getElementById('current-condition').textContent = conditionDescriptions[now.conditionCode] || 'Unknown';
  document.getElementById('feels-like').textContent = `${Math.round(now.feelsLikeTemperature)}°C`;
  document.getElementById('wind-speed').textContent = `${now.windSpeed} m/s`;
  document.getElementById('humidity').textContent = `${now.relativeHumidity}%`;
  document.getElementById('precipitation').textContent = `${now.totalPrecipitation} mm`;
  
  displayHourlyForecast(data.forecastTimestamps.slice(0, 24));
  displayDailyForecast(data.forecastTimestamps);
  createTemperatureChart(data.forecastTimestamps.slice(0, 24));
}

function displayHourlyForecast(hours) {
  const container = document.getElementById('hourly-forecast-container');
  container.innerHTML = '';
  hours.forEach(hour => {
    const el = document.createElement('div');
    el.className = 'hourly-item';
    el.innerHTML = `
      <div class="hourly-time">${new Date(hour.forecastTimeUtc).getHours()}:00</div>
      <img src="${conditionIcons[hour.conditionCode]}" class="hourly-icon" alt="">
      <div class="hourly-temp">${Math.round(hour.airTemperature)}°C</div>
    `;
    container.appendChild(el);
  });
}

function displayDailyForecast(hours) {
  const grouped = {};
  hours.forEach(h => {
    const day = h.forecastTimeUtc.split('T')[0];
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(h);
  });

  const container = document.getElementById('daily-forecast-container');
  container.innerHTML = '';
  Object.keys(grouped).slice(0, 7).forEach(day => {
    const forecasts = grouped[day];
    const temps = forecasts.map(f => f.airTemperature);
    const condition = forecasts[0].conditionCode;
    const el = document.createElement('div');
    el.className = 'forecast-card';
    el.innerHTML = `
      <h3 class="forecast-day">${new Date(day).toLocaleDateString(undefined, { weekday: 'short' })}</h3>
      <p class="forecast-date">${new Date(day).toLocaleDateString()}</p>
      <img src="${conditionIcons[condition]}" class="forecast-icon" alt="">
      <p>${conditionDescriptions[condition]}</p>
      <div class="temp-high-low">
        <div class="temp-high"><span>High</span><p>${Math.max(...temps)}°C</p></div>
        <div class="temp-low"><span>Low</span><p>${Math.min(...temps)}°C</p></div>
      </div>
    `;
    container.appendChild(el);
  });
}

function createTemperatureChart(hours) {
  const ctx = document.getElementById('temperature-chart').getContext('2d');
  if (temperatureChart) temperatureChart.destroy();
  temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours.map(h => `${new Date(h.forecastTimeUtc).getHours()}:00`),
      datasets: [
        {
          label: 'Temperature',
          data: hours.map(h => h.airTemperature),
          borderColor: '#2ecc71',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Feels Like',
          data: hours.map(h => h.feelsLikeTemperature),
          borderColor: '#27ae60',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}
