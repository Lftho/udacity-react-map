import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import myLocations from './MyLocations';
import Marker from './Marker'

class Map extends Component {

    componentDidMount() { 
        this.loadMap();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.google !== this.props.google) {
          this.loadMap();
        }
    }
    
    loadMap() {
        if (this.props && this.props.google) {
            const {google} = this.props;
            const maps = google.maps;
            const mapRef = this.refs.map;
            const divMapElement = ReactDOM.findDOMNode(mapRef);

            const mapObj = Object.assign({}, {
                center: { lat: 43.6715089, lng: -79.3771715 },
                zoom: 15,
                mapTypeControl: false
            })
            
            this.map = new maps.Map(divMapElement, mapObj);
            this.bounds = new google.maps.LatLngBounds();
            this.largeInfowindow = new google.maps.InfoWindow();

            // Deals with map resizing
            checkSizeWindow(window);
            maps.event.addDomListener(window, 'resize', function(e) {
                checkSizeWindow(e.currentTarget)
            });

            function checkSizeWindow(objWindow){
                if(objWindow.innerWidth < 475) {
                    divMapElement.style.height = 'calc(100vh - 89px)';
                } else {
                    divMapElement.style.height = '91vh';
                }
            }

            this.forceUpdate();
        } else {
            console.log('Oops! Something Went Wrong. Unable to access Google Maps API! Try again in a few moments.')
            let mapContainerElemt = document.querySelector('.map-container');
            mapContainerElemt.innerHTML = '<div class="error-msg">Oops! Something Went Wrong. Unable to access Google Maps API! Try again in a few moments.</div>'
        }
    }

    render() {
        const style = {
            width: '100vw',
            height: '100vh'
        }

        const { onChangeMarker } = this.props;

        return (
            <div ref='map' style={style} className="map-container" >
                Loading map...
                { myLocations.map( (location, index) => (
                    <Marker
                        key={index} 
                        google={this.props.google}
                        map={this.map}
                        title={location.title}
                        position={location.location} 
                        bounds={this.bounds}
                        largeInfowindow={this.largeInfowindow}
                        onChangeMarker={onChangeMarker} 
                    />
                ))}
            </div>
        )
    }
}

export default Map;