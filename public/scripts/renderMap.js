
function renderMap(){

  var map;
  var marker;

  map = createMap(49.2812,-123.1105, 14);
  marker = insertPointsOnMap(map, 49.2812,-123.1105);

  google.maps.event.addListener(marker, 'click', getCoordinatesOnEvent);

  google.maps.event.addListener(marker, 'dragend', getCoordinatesOnEvent);

  map.addListener('click', function(e) {
          placeMarkerAndPanTo(e.latLng, map);
         });

}