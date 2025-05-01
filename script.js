/* styles.css */

:root {
  --primary: #4CAF50;
  --secondary: #357a38;
  --text: #1a1a1a;
  --bg: #ecf3e7;
  --card-bg: #ffffff;
  --accent: #1b5e20;
  --gray: #666;
  --danger: #d32f2f;
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1100px;
  margin: auto;
  padding: 2rem 1rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

header h1 {
  font-size: 2.2rem;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

#place-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

select, button {
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

select {
  min-width: 200px;
  background-color: white;
}

button {
  background-color: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background-color: var(--secondary);
}

section {
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.weather-main {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.weather-main img {
  width: 100px;
  height: 100px;
}

.weather-info {
  flex: 1;
}

.weather-info h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item {
  background-color: #f9f9f9;
  padding: 0.8rem;
  border-radius: 8px;
  text-align: center;
}

.forecast-tabs {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.tab-button {
  background-color: #e0e0e0;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.tab-button.active {
  background-color: var(--primary);
  color: white;
}

.forecast-content {
  display: none;
  margin-top: 1rem;
}

.forecast-content.active {
  display: block;
}

.daily-forecast {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.forecast-card {
  background-color: #f7f7f7;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: var(--shadow);
  transition: transform 0.3s;
}

.forecast-card:hover {
  transform: translateY(-5px);
}

.hourly-items {
  display: flex;
  overflow-x: auto;
  padding-bottom: 1rem;
  gap: 1rem;
}

.hourly-item {
  min-width: 100px;
  text-align: center;
  background-color: #f2f2f2;
  border-radius: 6px;
  padding: 0.8rem;
  box-shadow: var(--shadow);
}

.hourly-icon, .forecast-icon {
  width: 40px;
  height: 40px;
  margin: 0.5rem auto;
}

.chart-container {
  height: 350px;
  margin-top: 2rem;
}

footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: var(--gray);
}

@media (max-width: 600px) {
  .weather-main {
    flex-direction: column;
    text-align: center;
  }
}