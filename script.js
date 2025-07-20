const apiKey ="7bd06d89119343deee25862164b7e7b9"; // Replace with your actual API key
const weatherContainer = document.getElementById('weather-container');
const locationElement = document.getElementById('location');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('weather-description');
const iconElement = document.getElementById('weather-icon');
const windSpeedElement = document.getElementById('wind-speed');
const humidityElement = document.getElementById('humidity');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const forecastContainer = document.getElementById('forecast-container');
const button = document.getElementById('get-weather');

button.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeather);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function getWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
            sendNotification(data);
            updateBackground(data.weather[0].main); // Change background based on weather
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
        });
}

function displayWeather(data) {
    locationElement.textContent = `Location: ${data.name}, ${data.sys.country}`;
    temperatureElement.textContent = `Temperature: ${data.main.temp} °C`;
    descriptionElement.textContent = `Weather: ${data.weather[0].description}`;
    windSpeedElement.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
    sunriseElement.textContent = `Sunrise: ${convertUnixTime(data.sys.sunrise)}`;
    sunsetElement.textContent = `Sunset: ${convertUnixTime(data.sys.sunset)}`;
    iconElement.innerHTML = `<img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">`;
}

function displayForecast(data) {
    forecastContainer.innerHTML = ''; // Clear previous forecast
    for (let i = 0; i < data.list.length; i += 8) { // 5-day forecast (3-hour intervals)
        const forecast = data.list[i];
        const forecastElement = document.createElement('div');
        forecastElement.innerHTML = `
            <p>${new Date(forecast.dt_txt).toLocaleDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon">
            <p>${forecast.main.temp} °C</p>
        `;
        forecastContainer.appendChild(forecastElement);
    }
}

function convertUnixTime(unixTime) {
    const date = new Date(unixTime * 1000);
    return date.toLocaleTimeString();
}

function sendNotification(data) {
    if (Notification.permission === 'granted') {
        new Notification('Weather Update', {
            body: `It's ${data.main.temp} °C in ${data.name} with ${data.weather[0].description}.`
        });
    } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Weather Update', {
                    body: `It's ${data.main.temp} °C in ${data.name} with ${data.weather[0].description}.`
                });
            }
        });
    }
}

function updateBackground(weatherCondition) {
    const backgrounds = {
        Clear: '#87CEEB', // Clear sky: light blue
        Clouds: '#D3D3D3', // Cloudy: grey
        Rain: '#778899', // Rainy: slate grey
        Snow: '#ADD8E6', // Snow: light blue
        Thunderstorm: '#2F4F4F', // Thunderstorm: dark grey
        Drizzle: '#AFEEEE', // Drizzle: pale turquoise
        Mist: '#F5F5F5', // Mist: white smoke
    };

    document.body.style.backgroundColor = backgrounds[weatherCondition] || '#f0f8ff'; // Default: light blue
}

// Automatically update every 30 minutes (optional)
setInterval(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeather);
    }
}, 1800000); // 30 minutes in milliseconds
