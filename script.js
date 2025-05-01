const API_BASE_URL = 'https://api.meteo.lt/v1';

const cities = [
  { code: 'vilnius', name: 'Vilnius' },
  { code: 'mazeikiai', name: 'Mažeikiai' },
  { code: 'klaipeda', name: 'Klaipėda' },
  { code: 'kaunas', name: 'Kaunas' },
  { code: 'siauliai', name: 'Šiauliai' }
];

const iconMap = {
  'clear': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/clear-day.svg',
  'partly-cloudy': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/partly-cloudy-day.svg',
  'cloudy': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/cloudy.svg',
  'cloudy-with-sunny-intervals': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/cloudy.svg',
  'light-rain': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/rain.svg',
  'rain': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/rain.svg',
  'heavy-rain': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/thunderstorms-rain.svg',
  'thunder': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/thunderstorms.svg',
  'snow': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/snow.svg',
  'fog': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/fog.svg',
  'na': 'https://raw.githubusercontent.com/basmilius/weather-icons/master/production/fill/all/not-available.svg'
};

const conditionMap = {
  'clear': 'Giedra',
  'partly-cloudy': 'Mažai debesuota',
  'cloudy': 'Debesuota',
  'cloudy-with-sunny-intervals': 'Debesuota su pragiedruliais',
  'light-rain': 'Nedidelis lietus',
  'rain': 'Lietus',
  'heavy-rain': 'Smarkus lietus',
  'thunder': 'Perkūnija',
  'snow': 'Sniegas',
  'fog': 'Rūkas',
  'na': 'Nėra duomenų'
};

function populateCityDropdown() {
  const citySelect = document.getElementById('place-select');
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.code;
    option.textContent = city.name;
    citySelect.appendChild(option);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('lt-LT', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatHour(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
}

function getDay(dateStr) {
  return new Date(dateStr).toLocaleDateString('lt-LT', { weekday: 'short' });
}

async function fetchForecast(cityCode) {
  const response = await fetch(`${API_BASE_URL}/places/${cityCode}/forecasts/long-term`);
  if (!response.ok) throw new Error('API klaida');
  return response.json();
}

function updateCurrentWeather(data) {
  const now = data.forecastTimestamps[0];
  document.getElementById('city-name').textContent = data.place.name;
  document.getElementById('current-date').textContent = formatDate(now.forecastTimeUtc);
  document.getElementById('temperature').textContent = `${Math.round(now.airTemperature)}°C`;
  document.getElementById('feels-like').textContent = `${Math.round(now.feelsLikeTemperature)}°C`;
  document.getElementById('wind-speed').textContent = `${now.windSpeed} m/s`;
  document.getElementById('condition-icon').src = iconMap[now.conditionCode] || iconMap['na'];
  document.getElementById('condition-icon').alt = conditionMap[now.conditionCode] || 'Oro sąlygos';
  document.getElementById('condition-text').textContent = conditionMap[now.conditionCode] || 'Nežinoma';

  // Optional fields – currently placeholder values as meteo.lt long-term may not provide them
  document.getElementById('humidity').textContent = '--%';
  document.getElementById('precipitation').textContent = '-- mm';
  document.getElementById('sunrise').textContent = '--';
  document.getElementById('sunset').textContent = '--';
}

function updateHourlyForecast(forecastTimestamps) {
  const hourlyDiv = document.getElementById('hourly-forecast');
  hourlyDiv.innerHTML = '';
  forecastTimestamps.slice(0, 24).forEach(hour => {
    const div = document.createElement('div');
    div.className = 'hour-card';
    div.innerHTML = `
      <div>${formatHour(hour.forecastTimeUtc)}</div>
      <img src="${iconMap[hour.conditionCode] || iconMap['na']}" alt="">
      <div>${Math.round(hour.airTemperature)}°C</div>
    `;
    hourlyDiv.appendChild(div);
  });
}

function updateDailyForecast(forecastTimestamps) {
  const daysMap = {};
  forecastTimestamps.forEach(f => {
    const date = f.forecastTimeUtc.split('T')[0];
    if (!daysMap[date]) daysMap[date] = [];
    daysMap[date].push(f);
  });

  const dailyDiv = document.getElementById('daily-forecast');
  dailyDiv.innerHTML = '';

  Object.keys(daysMap).slice(0, 7).forEach(date => {
    const entries = daysMap[date];
    const temps = entries.map(e => e.airTemperature);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const common = entries.reduce((acc, e) => {
      acc[e.conditionCode] = (acc[e.conditionCode] || 0) + 1;
      return acc;
    }, {});
    const topCondition = Object.keys(common).sort((a, b) => common[b] - common[a])[0];

    const div = document.createElement('div');
    div.className = 'day-card';
    div.innerHTML = `
      <div>${getDay(date)}</div>
      <img src="${iconMap[topCondition] || iconMap['na']}" alt="">
      <div>${conditionMap[topCondition] || '---'}</div>
      <div><strong>${Math.round(max)}°</strong> / ${Math.round(min)}°</div>
    `;
    dailyDiv.appendChild(div);
  });
}

function updateChart(forecastTimestamps) {
  const ctx = document.getElementById('chart').getContext('2d');
  const times = forecastTimestamps.slice(0, 24).map(f => formatHour(f.forecastTimeUtc));
  const temps = forecastTimestamps.slice(0, 24).map(f => f.airTemperature);
  const feels = forecastTimestamps.slice(0, 24).map(f => f.feelsLikeTemperature);

  if (window.tempChart) window.tempChart.destroy();

  window.tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Temperatūra',
          data: temps,
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          fill: true
        },
        {
          label: 'Juntama temperatūra',
          data: feels,
          borderColor: '#81c784',
          backgroundColor: 'rgba(129, 199, 132, 0.2)',
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

function toggleTabs() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.forecast-content').forEach(c => c.classList.remove('active'));
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      document.getElementById(tab).classList.add('active');
      btn.classList.add('active');
    });
  });
}

async function getWeather() {
  const city = document.getElementById('place-select').value;
  if (!city) return alert('Pasirinkite miestą.');

  document.getElementById('loading-indicator').style.display = 'block';

  try {
    const data = await fetchForecast(city);
    updateCurrentWeather(data);
    updateHourlyForecast(data.forecastTimestamps);
    updateDailyForecast(data.forecastTimestamps);
    updateChart(data.forecastTimestamps);
  } catch (err) {
    console.error(err);
    alert('Nepavyko gauti orų duomenų.');
  } finally {
    document.getElementById('loading-indicator').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateCityDropdown();
  toggleTabs();
  document.getElementById('place-select').value = 'vilnius';
  getWeather();
});

document.getElementById('get-weather-btn').addEventListener('click', getWeather);
