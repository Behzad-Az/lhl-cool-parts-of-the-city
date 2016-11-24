// Takes a google map, a latitude and a longitude
// an inserts the corresponding point on the given map
function insertPointsOnMap (myMap, lat, lng) {
    var markerOptions = {
      position: new google.maps.LatLng(lat, lng)
    };
    var marker = new google.maps.Marker(markerOptions);
    marker.setMap(myMap);
}

// module.exports = insertPointsOnMap;