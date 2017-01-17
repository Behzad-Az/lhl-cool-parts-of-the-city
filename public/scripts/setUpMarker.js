let allMyGoddamnInfoWindows = [];

function closeAllGoddamnInfoWindows() {
  while (allMyGoddamnInfoWindows.length > 0) {
    allMyGoddamnInfoWindows[0].close();
    allMyGoddamnInfoWindows.shift();
  }
}

function marker(lat, lng, map, name, description, url) {
  const latLng = new google.maps.LatLng(lat, lng);
  const markerOptions = {
    position: latLng,
    map: map,
    draggable: true
  };

  const $form = document.importNode($('.new-poi-form')[0], true); // duplicate DOM node because googleMaps


  const thisMarker = new google.maps.Marker(markerOptions);
  let infoWindow;

  function createMarker() {
    closeAllGoddamnInfoWindows();
    thisMarker.setMap(map);
    map.panTo(latLng);
    const infoWindowOptions = { content: $form };
    infoWindow = new google.maps.InfoWindow(infoWindowOptions);
    allMyGoddamnInfoWindows.push(infoWindow);
    if (action === 'newMap') {infoWindow.open(map, thisMarker);}

    $form.querySelector('#info-window-form-name').value = name || "";
    $form.querySelector('#info-window-form-description').value = description || "";
    $form.querySelector('#info-window-form-url').value = url || "";
    $form.querySelector('#updateBoxBtn').value = 'Update';

    google.maps.event.addListener(thisMarker, 'click', markerClicked);

    $('.submitInfoBox', $form).on('click', function(e) {
      e.preventDefault();
      let $form = $(this).parent().parent();
      let formData = {
        title: $form.find('input[name="title"]').val(),
        description: $form.find('input[name="description"]').val(),
        url: $form.find('input[name="url"]').val()
      };

      indexInmarkerArr = searchForMarker(infoWindow.anchor);
      if (indexInmarkerArr > -1) {
        markerArr[indexInmarkerArr]['infoBox'] = formData;
      }
      closeAllGoddamnInfoWindows();
    });

    $('.deleteMarker', $form).on('click', function(e) {
      e.preventDefault();
      removeMarker(infoWindow.anchor);

      closeAllGoddamnInfoWindows();
    });

  }

  function markerClicked(event) {
    closeAllGoddamnInfoWindows();
    const infoWindowOptions = { content: $form };
    infoWindow = new google.maps.InfoWindow(infoWindowOptions);
    allMyGoddamnInfoWindows.push(infoWindow);
    infoWindow.open(map, thisMarker);
  }
  createMarker();
  return thisMarker;

};

function searchForMarker(marker) {
  var output = -1;
  markerArr.forEach((point, index) => {
    if (JSON.stringify(point.getPosition()) === JSON.stringify(marker.getPosition())) output = index;
  });
  return output;
}


function removeMarker(marker) {
  marker.setMap(null);
  let index = searchForMarker(marker);
  if (index > -1) {
    markerArr.splice(index, 1);
  }
}