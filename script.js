const apiKey = "eecf51dba30e071534eb97d7f82670a5";

document
  .getElementById("cityInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      getWeather();
    }
  });

function getWeatherIcon(condition) {
  condition = condition.toLowerCase();

  if (condition.includes("clear")) return "☀️";
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("snow")) return "❄️";
  if (condition.includes("thunder")) return "⛈️";
  if (condition.includes("mist") || condition.includes("fog")) return "🌫️";

  return "🌤️";
}
function formatLocalTime(timezoneOffsetSeconds) {
  const utcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
  const localTime = new Date(utcTime + timezoneOffsetSeconds * 1000);

  return localTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function displayWeather(data, locationLabel = data.name) {
  const result = document.getElementById("result");
  const icon = getWeatherIcon(data.weather[0].main);
  const localTime = formatLocalTime(data.timezone);

  const condition = data.weather[0].main.toLowerCase();

  let bg = "radial-gradient(circle at top, #4f46e5, #111827 55%, #020617)";

  if (condition.includes("clear")) {
    bg = "linear-gradient(135deg, #facc15, #f97316)";
  } else if (condition.includes("rain")) {
    bg = "linear-gradient(135deg, #0ea5e9, #1e3a8a)";
  } else if (condition.includes("cloud")) {
    bg = "linear-gradient(135deg, #64748b, #1e293b)";
  } else if (condition.includes("snow")) {
    bg = "linear-gradient(135deg, #e0f2fe, #64748b)";
  } else if (condition.includes("thunder")) {
    bg = "linear-gradient(135deg, #312e81, #020617)";
  }

  document.body.style.background = bg;

  result.classList.remove("hidden");

  result.innerHTML = `
        <div class="main-weather">
            <div class="weather-icon">${icon}</div>
            <h2>${locationLabel}</h2>
            <p class="local-time">Local time: ${localTime}</p>
            <div class="temp">${Math.round(data.main.temp)}°C</div>
            <p>${data.weather[0].description}</p>
        </div>

        <div class="details">
            <div class="detail-box">
                🌡️ <strong>${Math.round(data.main.feels_like)}°C</strong>
                <br>Feels Like
            </div>
            <div class="detail-box">
                💧 <strong>${data.main.humidity}%</strong>
                <br>Humidity
            </div>
            <div class="detail-box">
                🌬️ <strong>${data.wind.speed} m/s</strong>
                <br>Wind
            </div>
            <div class="detail-box">
                ⚡ <strong>Live</strong>
                <br>API Data
            </div>
        </div>
    <div id="forecast"></div>
        `;
}

function displayForecast(forecastData) {
  const forecastContainer = document.getElementById("forecast");

  const dailyForecasts = forecastData.list
    .filter(function (item) {
      return item.dt_txt.includes("12:00:00");
    })
    .slice(0, 5);

  forecastContainer.innerHTML = `
        <h3>5-Day Forecast</h3>
        <div class="forecast-row">
            ${dailyForecasts
              .map(function (day) {
                const date = new Date(day.dt_txt);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const icon = getWeatherIcon(day.weather[0].main);

                return `
                    <div class="forecast-card">
                        <p>${dayName}</p>
                        <div>${icon}</div>
                        <strong>${Math.round(day.main.temp)}°C</strong>
                    </div>
                `;
              })
              .join("")}
        </div>
    `;
}

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const result = document.getElementById("result");

  if (!city) {
    result.classList.remove("hidden");
    result.innerHTML = "Enter a city first bro 😭";
    return;
  }

  result.classList.remove("hidden");
  result.innerHTML = "Loading...";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.cod !== 200) {
    result.innerHTML = "Error: " + data.message;
    return;
  }

  displayWeather(data);
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const forecastResponse = await fetch(forecastUrl);
  const forecastData = await forecastResponse.json();

  if (forecastData.cod === "200") {
    displayForecast(forecastData);
  }
}

function useMyLocation() {
  const result = document.getElementById("result");

  if (!navigator.geolocation) {
    result.classList.remove("hidden");
    result.innerHTML = "Your browser does not support location.";
    return;
  }

  result.classList.remove("hidden");
  result.innerHTML = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.cod !== 200) {
        result.innerHTML = "Error: " + data.message;
        return;
      }

      document.getElementById("cityInput").value = data.name;
      displayWeather(data);
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const forecastResponse = await fetch(forecastUrl);
      const forecastData = await forecastResponse.json();

      if (forecastData.cod === "200") {
        displayForecast(forecastData);
      }
    },
    function () {
      result.innerHTML = "Location permission denied.";
    },
  );
}
