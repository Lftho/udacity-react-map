import { Component } from 'react';
import PropTypes from 'prop-types'

class Marker extends Component {

  componentDidUpdate(prevProps) {
    if (  (this.props.map !== prevProps.map) ||
          (this.props.position !== prevProps.position)  ) {
      this.renderMarker();
    }
  }

  renderMarker() {
    if (this.marker) {
      this.marker.setMap(null);
    }

    let { map, google, position, bounds, largeInfowindow, onChangeMarker } = this.props;
    let defaultIcon = this.makeMarkerIcon('fbc11b');
    let highlightedIcon = this.makeMarkerIcon('cc092f');
    
    let pos = position;
    position = new google.maps.LatLng(pos.lat, pos.lng);

    const pref = {
      map: map,
      position: position,
      lat: pos.lat,
      lng: pos.lng,
      icon: defaultIcon,
      animation: google.maps.Animation.DROP,
    };
    this.marker = new google.maps.Marker(pref);
    const marker = this.marker;

    let self = this;

    // onclick event open infowindow
    marker.addListener('click', function() {
      self.populateInfoWindow(this, largeInfowindow);
    });

    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
      self.toggleBounce(this);
    });

    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

    onChangeMarker(this);

    bounds.extend(marker.position);
    map.fitBounds(bounds);
  }

  toggleBounce(marker) {
    let { google } = this.props;

    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    }
    else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null)
        }, 600);
    }
  }   

  populateInfoWindow(marker, infowindow) {
    // Check if the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
      let { map, bounds, title } = this.props;

      infowindow.setContent('Loading...');
      // Request related TIPs and Photos by Foursquare API
      let venueId = null;
      let tipsList = null;
      let description = null;

      // Store specific query parameters and change it as needed
      let query = `&limit=1&ll=${marker.lat},${marker.lng}&radius=250&intent=browse&query=${title}`;

      fetch(`https://api.foursquare.com/v2/venues/search?client_id=E4YK5XGCMCTWT5L41BSHFALQASYFS3SEFKFFE4SPCFCJZP22&client_secret=ZYEYFRDVEKR1I2DC0ZMO4SKNYTPTXREPDO2XZV2KFEJYWGVQ&v=20190425${query}`)
      .then(response => response.json())
      .then(data => {
        venueId = data.response.venues[0].id;
        return fetch(`https://api.foursquare.com/v2/venues/${venueId}?client_id=E4YK5XGCMCTWT5L41BSHFALQASYFS3SEFKFFE4SPCFCJZP22&client_secret=ZYEYFRDVEKR1I2DC0ZMO4SKNYTPTXREPDO2XZV2KFEJYWGVQ&v=20190425`)
      })
      .then(response => response.json())
      .then(dataVenue => { 
        description = dataVenue.response.venue.description;
        query = `&sort=recent&limit=4`; // Parameters for Tips (As it is a free account we only get 1 tip, besides of the limit=4)
        return fetch(`https://api.foursquare.com/v2/venues/${venueId}/tips?client_id=E4YK5XGCMCTWT5L41BSHFALQASYFS3SEFKFFE4SPCFCJZP22&client_secret=ZYEYFRDVEKR1I2DC0ZMO4SKNYTPTXREPDO2XZV2KFEJYWGVQ&v=20190425${query}`)
      })
      .then(response => response.json())
      .then(dataTips => {
        tipsList = dataTips;
        query = `&group=venue&limit=2`; // Parameters for Tips (As it is a free account we only get 1 photo, besdes of the limit=2)
        return fetch(`https://api.foursquare.com/v2/venues/${venueId}/photos?client_id=E4YK5XGCMCTWT5L41BSHFALQASYFS3SEFKFFE4SPCFCJZP22&client_secret=ZYEYFRDVEKR1I2DC0ZMO4SKNYTPTXREPDO2XZV2KFEJYWGVQ&v=20190425${query}`)
      })
      .then(response => response.json())
      .then(dataPhotos => addVenuesInfos(tipsList, dataPhotos, description))
      .catch(err => requestError(err, 'Foursquare API'));

      // Request Successfull
      function addVenuesInfos(tipsList, dataPhotos, description) {
        let htmlResult = '';
        
        if (tipsList && tipsList.response.tips.items) {
          const tipsData = tipsList.response.tips.items;
          const photosData = dataPhotos.response.photos.items;
          htmlResult = `<div class="infowindow-content"><h4>${title}</h4>`;

          if (description) {
            htmlResult += `<p class="content-description">${description}</p>`;
          }
          
          // Photos - Although we get only one photo back, the code is ready to get more (limit=2)
          if (photosData.length > 0) {
            htmlResult += '<h6>Photos</h6><div id="photos-places">';
            for(let i = 0; i < photosData.length; i++) {
              const photo = photosData[i];
              htmlResult += `<img alt="${title}, photo ${i + 1} by a visitor" style="width: 30%; margin-right: 5px;" src="${photo.prefix}150x150${photo.suffix}" />`;
            }
            htmlResult += '</div>';
          }

          // Tips - Although we get only one tip back, the code is ready to get more (limit=4)
          if (tipsData.length > 0) {
            htmlResult += '<h6>Tips</h6><ul id="tips-places">';
            tipsData.forEach( tip => {
              htmlResult += '<li>' + tip.text + ' - ♥ ' + tip.likes.count + '</li>';
            })
          }
          htmlResult += '</ul><p style="float: right; padding-right: 10px;"><i><small>provided by Foursquare</small></i></p> </div>';
        }
        else {
          htmlResult = '<p class="network-warning">Unfortunately, no information was returned for your search.</p>';
        }
        infowindow.setContent(htmlResult);
      }

      // Request Error
      function requestError(err, part) {
        console.log(err);
        infowindow.setContent(`<p class="network-warning">Oops! There was an error making a request for the ${part}.</p>`);
      }            
      infowindow.marker = marker;
  
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
  
      infowindow.open(map, marker);
      map.fitBounds(bounds);
      map.panTo(marker.getPosition());
    }
  }

  makeMarkerIcon(markerColor) {
    var markerImage = new this.props.google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor + '|40|_|%E2%80%A2',
      new this.props.google.maps.Size(21, 34),
      new this.props.google.maps.Point(0, 0),
      new this.props.google.maps.Point(10, 34),
      new this.props.google.maps.Size(21,34));
    return markerImage;
  }

  render() {
    return null;
  }
}

export default Marker;

Marker.propTypes = {
  map: PropTypes.object
}