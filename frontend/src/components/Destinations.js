import React, { useState, useEffect } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import vaccineData from '../data/vaccinations.json';
import countriesCoordinates from '../data/country-codes-lat-long-alpha3.json';
import getCountryISO3 from 'country-iso-2-to-3';
import getCountryISO2 from 'country-iso-3-to-2';
import Map from './Map';
import LocationSearch from './LocationSearch';
import axios from 'axios';
import '../styles/Destinations.css';
import hoteljpg from '../hotel.jpg';
import { sha256 } from 'js-sha256';
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import Slider from "react-slick";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Destinations() {

    const [selected, setSelected] = useState('');
    const [currentCountry, setCurrentCountry] = useState('');
    const [currentCountryData, setCurrentCountryData] = useState({});
    const [selectedCoordinates, setSelectedCoordinates] = useState({lat: '', lng: ''});
    const [lastKnownDate, setLastKnownDate] = useState('');
    const [hotelLocation, setHotelLocation] = useState('');
    const [destination, setDestination] = useState({});
    const [origin, setOrigin] = useState({});
    const [weather, setWeather] = useState({});
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState(2);
    const [adults, setAdults] = useState(2);
    const [radius, setRadius] = useState(10);
    const [rating, setRating] = useState('2 STARS');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + ( 3600 * 1000 * 24)));
    const [flights, setFlights] = useState({});
    const [isDestination, setIsDestination] = useState(false);
    

    const handleChange = (code) => {
        const ISOAlpha3Code = getCountryISO3(code);
        const selectedCoordinatesItem = countriesCoordinates.ref_country_codes.filter((item) => item.alpha3 === ISOAlpha3Code)[0];
        setSelectedCoordinates({lat: selectedCoordinatesItem.latitude, lng: selectedCoordinatesItem.longitude});
        const selectedCountry = vaccineData.filter((item) => item.iso_code === ISOAlpha3Code);
        const seletedCountryData = selectedCountry[0];
        let rawDate = {};
        if(!seletedCountryData) {
            setCurrentCountry(selectedCountry);
            rawDate = {};
            setLastKnownDate(new Date());
            setCurrentCountryData({});
        } else {
            setCurrentCountry(seletedCountryData);
            rawDate = seletedCountryData.data;
            setLastKnownDate(new Date(rawDate[rawDate.length-1].date));
            setCurrentCountryData(rawDate[rawDate.length-1]);
        }
        setSelected(code);
    }

    const setCity = (location) => {
        const selectedCountry = vaccineData.filter((item) => item.iso_code === location.address.countryCode);
        const seletedCountryData = selectedCountry[0];
        let rawDate = {};
        if(!seletedCountryData) {
            setCurrentCountry(selectedCountry);
            
            rawDate = {};
            setLastKnownDate(new Date());
            setCurrentCountryData({});
        } else {
            setCurrentCountry(seletedCountryData);
            rawDate = seletedCountryData.data;
            setLastKnownDate(new Date(rawDate[rawDate.length-1].date));
            setCurrentCountryData(rawDate[rawDate.length-1]);
        }
        setIsDestination(true);
        setHotelLocation(location);
        getWeatherData(location);
    }
    
    const searchStreet = (location) => {
        const coordinates = location.lat+','+location.lng;
        axios.get('https://discover.search.hereapi.com/v1/discover?at='+coordinates+'&q=place&apiKey=RBNPTbuQHcT8_8mZk57uhsl9jB0SN3F6KcwV3YR5Am8').then((res)=> {
            getFlightPlaces(res.data.items[0], "origin");
        })
        
    }

    const searchHotels = (location, startDate, endDate, rooms, adults, radius) => {
        setLoading(true);
        var text = '73023bb2140b4a6c430453542eea0589'+'9ba224321f'+Math.floor(Date.now() / 1000);
        var hash = sha256.hex(text);
        const options = {
            method: 'POST',
            url: 'https://thawing-tor-87368.herokuapp.com/https://api.test.hotelbeds.com/hotel-api/1.0/hotels',
            headers: {
              'Api-key': '73023bb2140b4a6c430453542eea0589',
              'X-Signature': hash
            },
            data: {
                stay: {
                    checkIn: startDate,
                    checkOut: endDate
                },
                occupancies: [
                    {
                        rooms: rooms,
                        adults: adults,
                        children: 0
                    }
                ],
                geolocation: {
                    latitude: location.position.lat,
                    longitude: location.position.lng,
                    radius: radius,
                    unit: "km"
                }
              }
          };
          
          axios.request(options).then(function (response) {
              const hotels = response.data.hotels.hotels;
              const hotel = hotels.filter(item => item.categoryName === rating);
              if(hotel.length > 10) {
                setHotels(hotel.slice(0, 10));
              } else {

                setHotels(hotels);
              }
              setLoading(false);
          }).catch(function (error) {
              console.error(error);
          });
        
    }

    const getWeatherData = (location) => {
        axios.get('https://api.openweathermap.org/data/2.5/find?lat='+location.position.lat+'&lon='+location.position.lng+'&cnt=10&units=metric&appid=05e17c6be6a95c8b50e97feb674430c0').then((res)=> {
            setWeather(res.data.list[0]);
        })
        
    }

    const getFlightData = (origin, origin_code, destination) => {
        const options = {
            method: 'GET',
            url: 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/'+origin_code+'/USD/en-US/'+origin.CountryId+'/'+destination.CityId+'/'+startDate.toISOString().split('T')[0],
            params: {inboundpartialdate: endDate.toISOString().split('T')[0]},
            headers: {
              'x-rapidapi-key': '933cf1088dmshacd0ad5f4f31ab7p1f541fjsn7f229e7b6064',
              'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com'
            }
          };
          
          axios.request(options).then(function (response) {
            setFlights(response.data);
          }).catch(function (error) {
              console.error(error);
          });
    }

    const getFlightPlaces = (place, type) => {
        const code = getCountryISO2(place.address.countryCode);
        const options = {
            method: 'GET',
            url: 'https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/'+code+'/USD/en-GB/',
            params: {query: place.address.city},
            headers: {
              'x-rapidapi-key': '933cf1088dmshacd0ad5f4f31ab7p1f541fjsn7f229e7b6064',
              'x-rapidapi-host': 'skyscanner-skyscanner-flight-search-v1.p.rapidapi.com'
            }
          };
          
          axios.request(options).then(function (response) {
              if(type==="destination"){
                setDestination({place: response.data.Places[0], countrycode: code});
                getFlightData(origin.place, origin.countrycode ,response.data.Places[0]);
              } else {
                setOrigin({place: response.data.Places[0], countrycode: code});
              }
          }).catch(function (error) {
              console.error(error);
          });
    }

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
    }

    const showPosition = (position) => {
        var latlon = {lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        searchStreet(latlon);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        getFlightPlaces(hotelLocation, "destination");
        searchHotels(hotelLocation, startDate, endDate, rooms, adults, radius);
    }

    const handleStartDate = (date) => {
        setStartDate(date);
    }

    const handleEndDate = (date) => {
        setEndDate(date);
    }


    const getName = (flight, carr) => {
        if(flight)
        return carr.filter(item => item.CarrierId === flight.OutboundLeg.CarrierIds[0])[0].Name
    }

    const getCityFlight = (flight, places) => {
        if(flight)
        return places.filter(item => item.PlaceId === flight.OutboundLeg.OriginId)[0].Name
    }

    const getDestinationFlight = (flight, places) => {
        if(flight)
        return places.filter(item => item.PlaceId === flight.OutboundLeg.DestinationId)[0].Name
    }

    useEffect(() => {
        getUserLocation();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1
      };

    return (
        <div className="wrapper">
            <h1>Search a location</h1>
            <LocationSearch setCity={setCity} />
            {/* <h2>or choose a country</h2>
            <ReactFlagsSelect className="flag-select"
            selected={selected}
            onSelect={code => handleChange(code)}
            searchable
        /> */}
        {isDestination ?
        <div className="inner-wrapper">
            <div className="info-wrapper">
            <div className="country-coivd-info">
                <h2>{currentCountry.country}</h2>
                <p>Total vaccinations to date: {currentCountryData.total_vaccinations ? currentCountryData.total_vaccinations : 'unknown'}</p>
                <p>Daily vactinations: {currentCountryData.daily_vaccinations ? currentCountryData.daily_vaccinations : 'unknown'}</p>
                <p>Total vaccinations per hundred: {currentCountryData.total_vaccinations_per_hundred ? currentCountryData.total_vaccinations_per_hundred : 'unknown'}</p>
                <p>Last update: {lastKnownDate.toString()}</p>
            </div>
            
            <div className="weather-info">
                    <p>Temperature: <span>{weather.main ? weather.main.temp + " C" : ''}</span></p>
                    <p>Condition: <span>{weather.weather ? weather.weather[0].main : ''}</span></p>
                    <p>Description: <span>{weather.weather ? weather.weather[0].description : ''}</span></p>
                    <p>Wind: <span>{weather.wind ? weather.wind.speed + " km/h" : ''}</span></p>
            </div>
        </div>
            <div className="booking-form">
                <form onSubmit={handleSubmit}>
                    <div className="inner-form-wrapper">
                        <div className="left">
                            <label>Departure Date</label>
                            <DatePicker selected={startDate} onChange={date => handleStartDate(date)} />
                            <label>Returning Date</label>
                            <DatePicker selected={endDate} onChange={date => handleEndDate(date)} />
                            <label>No. of rooms</label>
                            <input type="number" name="rooms"  min="1" max="5" value={rooms} onChange={(e) => setRooms(e.target.value)}/>
                        </div>
                        <div className="right">
                            <label>No. of people</label>
                            <input type="number" name="adults"  min="1" max="10" value={adults} onChange={(e) => setAdults(e.target.value)}/>
                            <label>Search radius</label>
                            <input type="number" name="radius" value={radius} min="1" max="50" onChange={(e) => setRadius(e.target.value)}/>
                            <label>Min rating</label>
                            <select onChange={(e) => setRating(e.target.value)} value={rating}>
                                <option value="1 STAR">1 star</option>
                                <option value="2 STARS">2 stars</option>
                                <option value="3 STARS">3 stars</option>
                                <option value="4 STARS">4 stars</option>
                                <option value="5 STARS">5 stars</option>
                            </select>
                        </div>
                    </div>                   
                    <button type="submit">Show</button>
                </form>
            </div>
        </div>
         : ''}
        <ClipLoader loading={loading} size={150} />
        {loading ? '' :
        <Slider {...settings}>
        {hotels.length ? hotels.map((hotel)=> {
            return <div key={hotel.code}><div className="slid-wrapper"><img src={hoteljpg} /><div className="details"><h3>{hotel.name}</h3><p>{hotel.categoryName}</p><p>From: {hotel.minRate} {hotel.currency}</p><p>To: {hotel.maxRate} {hotel.currency}</p></div></div></div>;
        }) : ''}
        </Slider>}
        {flights.Quotes ? flights.Quotes.map(offer => {
            return <div key={offer.QuoteId} className="flight" ><span className="pret">{offer.MinPrice}{offer.Currencies ? offer.Currencies[0].Symbol : ''}</span>
            <span className="flight-type">Type: {offer.Direct ? "direcrt" : "indirect"}</span>
            <span className="carrier">By: {getName(offer, flights.Carriers)}</span>
            <div className="fligth-dest">
                <div className="left">From: {getCityFlight(offer, flights.Places)}</div>
                <div className="right">To: {getDestinationFlight(offer, flights.Places)}</div>
            </div>
            </div>
        }) : ''}
        
        <Map selectedCoordinates = {selectedCoordinates} />
        
        
        </div>
    );
}

export default Destinations;