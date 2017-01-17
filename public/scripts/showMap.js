// var createMap = require('./createMap');
// var insertPointsOnMap = require ('./insertPointsOnMap');

function showMap(){
  let data = JSON.parse(window.data);
  let mapData = data.mapData;
  let pointsData = data.pointsData;

  var map = drawMap(data);
  return map;
}

function drawMap (data) {
  let mapData = data.mapData;
  let pointsData = data.pointsData;

  var mapOptions = {
    center: new google.maps.LatLng(mapData.centre_x, mapData.centre_y),
    zoom: mapData.zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#523735"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#c9b2a6"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#dcd2be"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#ae9e90"
          }
        ]
      },
      {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#93817c"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#a5b076"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#447530"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f5f1e6"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#fdfcf8"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f8c967"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#e9bc62"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e98d58"
          }
        ]
      },
      {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#db8555"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#806b63"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#8f7d77"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#ebe3cd"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#dfd2ae"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#b9d3c2"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#92998d"
          }
        ]
      }
    ]
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  pointsData.forEach((point) => {
    insertPointsOnMap (map, point);
  });

  return map;
}


function insertPointsOnMap (myMap, point) {
    var markerOptions = {
      position: new google.maps.LatLng(point.lat, point.lng),
      draggable: true,
      id: point.id
    };

    var infoWindowOptions = {
      content: markerOptions.id
    }

    function markerClicked(event) {
      $(function(){
        let infoBox = $("#point-info-div");
        infoBox.css({'display': 'none'});
        infoBox.find('h4').text(thisMarker.infoBox.title);
        infoBox.find('p').text(thisMarker.infoBox.description);
        infoBox.find('img').attr('src', thisMarker.infoBox.url);
        infoBox.slideDown(150);
      });
    }


    var thisMarker = new google.maps.Marker(markerOptions);
    thisMarker.setMap(myMap);
    thisMarker.infoBox = {
      title: point.name,
      description: point.description,
      url: point.img_url
    };

    google.maps.event.addListener(thisMarker, 'click', markerClicked);


    return thisMarker;
}
