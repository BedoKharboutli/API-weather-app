import React, { useState, useEffect } from "react";
import axios from "axios";
import icon01d from './assets/sun.png';
import icon02d from './assets/cloudy.png';
import icon03d from './assets/rain.png';

function App() {
  const [data, setData] = useState({});
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [unit, setUnit] = useState('metric');
  const [showForecast, setShowForecast] = useState(false);

  const iconMap = {
    '01d': icon01d, '01n': icon01d,
    '02d': icon02d, '02n': icon02d,
    '03d': icon02d, '03n': icon02d,
    '04d': icon02d, '04n': icon02d,
    '09d': icon03d, '09n': icon03d,
    '10d': icon03d, '10n': icon03d,
    '11d': icon03d, '11n': icon03d,
    '13d': icon03d, '13n': icon03d,
    '50d': icon02d, '50n': icon02d,
  };

  const API_KEY = 'cc5d468c483e9f339029b99c080785ad';

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    getCurrentLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
      
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);
      
      setData(weatherResponse.data);
      processForecastData(forecastResponse.data);
    } catch (error) {
      setError('Unable to fetch weather data for your location');
    } finally {
      setLoading(false);
    }
  };

  const processForecastData = (forecastData) => {
    const dailyForecasts = [];
    const processedDates = new Set();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!processedDates.has(date) && dailyForecasts.length < 5) {
        dailyForecasts.push({
          date: date,
          temp: Math.round(item.main.temp),
          icon: item.weather[0].icon,
          description: item.weather[0].description
        });
        processedDates.add(date);
      }
    });
    
    setForecast(dailyForecasts);
  };

  const search = async (event) => {
    if (event.key === 'Enter' && location.trim()) {
      setLoading(true);
      setError('');
      
      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${API_KEY}`;
        
        const [weatherResponse, forecastResponse] = await Promise.all([
          axios.get(weatherUrl),
          axios.get(forecastUrl)
        ]);
        
        setData(weatherResponse.data);
        processForecastData(forecastResponse.data);
        
        // Add to recent searches
        const newSearch = weatherResponse.data.name;
        const updatedSearches = [newSearch, ...recentSearches.filter(s => s !== newSearch)].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        
      } catch (error) {
        setError('City not found. Please check the spelling and try again.');
      } finally {
        setLoading(false);
        setLocation('');
      }
    }
  };

  const selectRecentSearch = (city) => {
    setLocation(city);
    const event = { key: 'Enter' };
    search(event);
  };

  const toggleUnit = () => {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(newUnit);
    if (data.name) {
      setLocation(data.name);
      setTimeout(() => {
        const event = { key: 'Enter' };
        search(event);
      }, 100);
    }
  };

  const getWeatherBackground = () => {
    if (!data.weather) return 'default';
    const condition = data.weather[0].main.toLowerCase();
    switch (condition) {
      case 'clear': return 'sunny';
      case 'clouds': return 'cloudy';
      case 'rain': return 'rainy';
      case 'snow': return 'snowy';
      case 'thunderstorm': return 'stormy';
      default: return 'default';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`app ${getWeatherBackground()}`}>
      {/* Header with controls */}
      <div className="header">
        <h1 className="app-title">Weather App</h1>
        <div className="controls">
          <button className="unit-toggle" onClick={toggleUnit}>
            °{unit === 'metric' ? 'C' : 'F'}
          </button>
          <button className="location-btn" onClick={getCurrentLocation} title="Use current location">
            📍
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <input 
            className="search-input"
            value={location}
            onChange={event => setLocation(event.target.value)}
            onKeyPress={search}
            placeholder="Search for a city..."
            type="text"
          />
          <div className="search-icon">🔍</div>
        </div>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <p className="recent-title">Recent searches:</p>
            <div className="recent-chips">
              {recentSearches.map((city, index) => (
                <button 
                  key={index} 
                  className="recent-chip"
                  onClick={() => selectRecentSearch(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Main Weather Display */}
      {data.main && !loading && (
        <div className="weather-container">
          {/* Current Weather */}
          <div className="current-weather">
            <div className="location-info">
              <h2 className="city-name">{data.name}</h2>
              <p className="country">{data.sys?.country}</p>
              <p className="date-time">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>

            <div className="main-weather-info">
              <div className="temperature-section">
                <div className="temp-display">
                  <span className="temperature">{Math.round(data.main.temp)}</span>
                  <span className="temp-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
                </div>
                <div className="weather-icon">
                  <img
                    src={iconMap[data.weather[0].icon]}
                    alt={data.weather[0].description}
                    className="weather-image"
                  />
                </div>
              </div>
              
              <div className="weather-description">
                <p className="condition">{data.weather[0].main}</p>
                <p className="description">{data.weather[0].description}</p>
                <p className="feels-like">Feels like {Math.round(data.main.feels_like)}°</p>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="weather-details">
            <div className="detail-card">
              <div className="detail-icon">💧</div>
              <div className="detail-info">
                <p className="detail-value">{data.main.humidity}%</p>
                <p className="detail-label">Humidity</p>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">💨</div>
              <div className="detail-info">
                <p className="detail-value">{data.wind.speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
                <p className="detail-label">Wind Speed</p>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">🌡️</div>
              <div className="detail-info">
                <p className="detail-value">{data.main.pressure} hPa</p>
                <p className="detail-label">Pressure</p>
              </div>
            </div>
            
            <div className="detail-card">
              <div className="detail-icon">👁️</div>
              <div className="detail-info">
                <p className="detail-value">{data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</p>
                <p className="detail-label">Visibility</p>
              </div>
            </div>

            {data.sys && (
              <>
                <div className="detail-card">
                  <div className="detail-icon">🌅</div>
                  <div className="detail-info">
                    <p className="detail-value">{formatTime(data.sys.sunrise)}</p>
                    <p className="detail-label">Sunrise</p>
                  </div>
                </div>
                
                <div className="detail-card">
                  <div className="detail-icon">🌇</div>
                  <div className="detail-info">
                    <p className="detail-value">{formatTime(data.sys.sunset)}</p>
                    <p className="detail-label">Sunset</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 5-Day Forecast */}
          {forecast.length > 0 && (
            <div className="forecast-section">
              <div className="forecast-header">
                <h3>5-Day Forecast</h3>
                <button 
                  className="forecast-toggle"
                  onClick={() => setShowForecast(!showForecast)}
                >
                  {showForecast ? '▲' : '▼'}
                </button>
              </div>
              
              {showForecast && (
                <div className="forecast-container">
                  {forecast.map((day, index) => (
                    <div key={index} className="forecast-card">
                      <p className="forecast-day">
                        {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <img
                        src={iconMap[day.icon]}
                        alt={day.description}
                        className="forecast-icon"
                      />
                      <p className="forecast-temp">{day.temp}°</p>
                      <p className="forecast-desc">{day.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Welcome message when no data */}
      {!data.main && !loading && !error && (
        <div className="welcome">
          <div className="welcome-content">
            <h2>Welcome to Weather App</h2>
            <p>Search for a city to get started, or use your current location</p>
            <div className="welcome-icon">🌤️</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
