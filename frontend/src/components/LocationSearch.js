import React, {useState} from "react";
import axios from 'axios';


function LocationSearch(props) {

    const [query, setQuery] = useState('');
    const [locations, setLocations] = useState([]);

    const searchCity = (query) => {
        axios.get('https://geocode.search.hereapi.com/v1/geocode?q='+query+'&apiKey=RBNPTbuQHcT8_8mZk57uhsl9jB0SN3F6KcwV3YR5Am8').then((res)=> {
            setLocations(res.data.items);
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        searchCity(query);
    }

    const handleChange = (e) => {
        let val = e.target.value;
        setQuery(val);
        if(val) {
            searchCity(val);
        }
    }

    const handleClick = (location) => {
        setLocations([]);
        setQuery('');
        props.setCity(location);
    }

  return (
        <div className="input-wrapper">
            <div className="input">
                <form onSubmit={handleSubmit}>
                    <input type="text" value={query} onChange={handleChange}/>
                    <button type="submit">Search</button>
                </form>
            </div>
            <div className="results">
                {query.length <= 0 ? '' : (locations.length > 0 ? locations.map((location) => {
                    return <div onClick={() => handleClick(location)} key={location.id} classsName="result-location">{location.address.label}</div>;
                }) : 'No results')}
            </div>
        </div>
  );
}

export default LocationSearch;