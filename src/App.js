import React, {useState} from "react";
import axios from "axios";
import icon01d from './assets/sun.png';
import icon02d from './assets/cloudy.png';
import icon03d from './assets/rain.png';

function App() {
  const [data, setData] = useState({})
  const [location, setLocation] = useState('')
  const iconMap = {
  '01d': icon01d,
  '03d': icon02d,
  '09d': icon03d,
  '01n': icon01d,
  '04d': icon02d,
  '10d': icon03d,
  '02d': icon02d,
};

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=cc5d468c483e9f339029b99c080785ad`

  const search = (event) => {
  if (event.key === 'Enter') {
    axios.get(url)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        alert("Invalid city name. Please try again.");
      });
    setLocation('');
  }
};
  
  return (
    <div className="app">

      <div className="search">
        <input className="input"
        value={location}
        onChange={event => setLocation(event.target.value)}
        onKeyPress = {search}
        placeholder= 'Enter City Name'
        type='text'/>
      </div>

      <div className="container">

        <div className="top">
          <div className="location">
            <p className="loc">{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}°</h1> : null}
          </div>

          <div className="icon">
            {data.weather ? (
              <img
                src={iconMap[data.weather[0].icon]}
                alt={data.weather[0].description}
                className="weather-image"
              />
            ) : null}
          </div>


          <div className="description">
            {data.weather ? <p className="descriptions">{data.weather[0].main}</p> : null}
          </div>
        </div>

        

        <div className="bottom">
          <div className="feels">
            {data.main ? <p>{data.main.feels_like}°</p> : null}
            <p>Feels like</p>
          </div>
          <div className="humedity">
            {data.main ? <p>{data.main.humidity}</p> : null}
            <p>humedity</p>
          </div>
          <div className="wind"> 
            {data.wind ? <p>{data.wind.speed}</p> : null}
            <p>wind</p> </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;
