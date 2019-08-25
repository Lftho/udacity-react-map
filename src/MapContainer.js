import React, { Component } from 'react';
import Map from './Map'
import ListFilter from './ListFilter'


export default class MapContainer extends Component {

  render() {
    const { google, onChangeMarker, locationsGoogle } = this.props;

    return (
      <div className="map-container">
        <ListFilter locationsGoogle={locationsGoogle} />
        <main role="presentation"  aria-label="Map showing places" className="main-container">
          <Map 
            google={google}
            onChangeMarker={onChangeMarker} 
            />
        </main>
      </div>
    )
  }
}