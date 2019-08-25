import React, { Component } from 'react';
import './App.css';
import { GoogleApiWrapper } from 'google-maps-react' 
import myLocations from './MyLocations'
import MapContainer from './MapContainer'
import NavSearch from './Search'

// Handling when Google's API have any Problem on the request
document.addEventListener("DOMContentLoaded", function(e) {
  let scriptTag = document.getElementsByTagName('SCRIPT').item(1);
  scriptTag.onerror = function(e) {
    console.log('Oops! Something Went Wrong. Unable to access Google Maps API! Try again in a few moments.')
    let mapContainerElemt = document.querySelector('#root');
    let erroElement = document.createElement('div');
    erroElement.innerHTML = '<div class="error-msg">Oops! Something Went Wrong. Unable to access Google Maps API! Try again in a few moments.</div>'
    mapContainerElemt.appendChild(erroElement)
  }
})

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locationsGoogle: []
    }
    this.markersGoogle = [];
    this.onChangeMarker = this.onChangeMarker.bind(this);
    this.handleQuery = this.handleQuery.bind(this);
  }

  onChangeMarker(marker) {
    this.markersGoogle.push(marker);

    if(this.markersGoogle.length === myLocations.length) {
      this.setState({locationsGoogle: this.markersGoogle})
    }
  }

  handleQuery(query) {
    let result = this.state.locationsGoogle.map( location => {
      let matched = location.props.title.toLowerCase().indexOf(query) >= 0;
      if (location.marker) {
        location.marker.setVisible(matched);
      }
      return location;
    })

    this.setState({ locationsGoogle: result });   
  }

  render() {    
    return (
      <div className="App">
        <NavSearch handleQuery={this.handleQuery} />

        <MapContainer 
          google={this.props.google}
          onChangeMarker={this.onChangeMarker}
          locationsGoogle={this.state.locationsGoogle} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCIAtjMbfpPYaRq0OJsZTBHrtSwJNkI6d0',
})(App)
