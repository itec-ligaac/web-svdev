import React from "react";
import DisplayMap from '../helpers/displayMap';


function Map(props) {
  return (
    <DisplayMap center={props.selectedCoordinates} />
  );
}

export default Map;

