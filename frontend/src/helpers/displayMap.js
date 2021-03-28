import * as React from 'react';

export default function DisplayMap (center) {
    let coordinates = { lat: 50, lng: 5 };
    if(center.center.lat){
        coordinates = center.center;
    }
  // Create a reference to the HTML element we want to put the map on
  const mapRef = React.useRef(null);
  /**
   * Create the map instance
   * While `useEffect` could also be used here, `useLayoutEffect` will render
   * the map sooner
   */
  React.useLayoutEffect(() => {
    // `mapRef.current` will be `undefined` when this hook first runs; edge case that
    if (!mapRef.current) return;
    const H = window.H;
    const platform = new H.service.Platform({
        apikey: "RBNPTbuQHcT8_8mZk57uhsl9jB0SN3F6KcwV3YR5Am8"
    });
    const defaultLayers = platform.createDefaultLayers();
    const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: coordinates,
      zoom: 8,
      pixelRatio: window.devicePixelRatio || 1
    });

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));

    const ui = H.ui.UI.createDefault(hMap, defaultLayers);

    // This will act as a cleanup to run once this hook runs again.
    // This includes when the component un-mounts
    return () => {
      hMap.dispose();
    };
  }, [mapRef]); // This will run this hook every time this ref is updated

  return <div className="map" ref={mapRef} style={{ height: "500px" }} />;
};