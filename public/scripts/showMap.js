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
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  pointsData.forEach((point) => {
    insertPointsOnMap (map, point);
  });

  return map;
}


function insertPointsOnMap (myMap, point) {
    console.log(point);
    var markerOptions = {
      position: new google.maps.LatLng(point.lat, point.lng),
      draggable: true,
      id: point.id
    };

    var infoWindowOptions = {
      content: markerOptions.id
    }

    var marker = new google.maps.Marker(markerOptions);
    marker.setMap(myMap);

    // var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

    // google.maps.event.addListener(marker,'click', function() {
    //   infoWindow.open(myMap, marker);
    // });

    return marker;
}