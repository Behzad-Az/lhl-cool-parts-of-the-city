// actions for when different buttons are clicked.

$(function () {

  // jQuery the buttons
  let changeMapDataBtn = $('.mapDataChangeBtn');
  let mapTitleInput = $('#mapTitleInput');
  let editThisMapBtn = $('#editThisMapBtn');
  let deleteMapBtn = $('#deleteMapBtn');

  // Take this action when either save new map and save map changes is clicked
  changeMapDataBtn.on('click', function (event) {
    event.preventDefault();
    let requestMarkers = conditionMapData(markerArr).outArr;
    let goodData = conditionMapData(markerArr).outBool;
    let $message = $('.map-save-success');

    if (mapTitleInput.val() !== "" && action === 'editMap' && markerArr.length > 0) {
      templateVars = {
        mapTitle: mapTitleInput.val(),
        mapCentreLat: map.getCenter().lat(),
        mapCentreLng: map.getCenter().lng(),
        mapZoom: map.getZoom(),
        mapPoints: requestMarkers
      }

      $message.css({"display": "none"});
      $message.fadeIn(400).delay(2000).fadeOut(400);

      $.ajax({
        type: 'POST',
        url: postRoute,
        data: templateVars
      });

    } else if (mapTitleInput.val() !== "" && action === 'newMap' && markerArr.length > 0 && goodData) {
      templateVars = {
        mapTitle: mapTitleInput.val(),
        mapCentreLat: map.getCenter().lat(),
        mapCentreLng: map.getCenter().lng(),
        mapZoom: map.getZoom(),
        mapPoints: requestMarkers
      }

      $message.css({"display": "none"});
      $message.fadeIn(400).delay(2000).fadeOut(400);

      $.ajax({
        type: 'POST',
        url: postRoute,
        data: templateVars
      });
    } else alert ("Please fill in the map title and info-box info for each point");
  });


  // Action when submit button is clicked on any google map marker window.
  $('body').on('click', '.submitInfoBox', function(event) {
    event.preventDefault();
    let $form = $(this).parent();
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

  // Action when edit this map is clicked.
  editThisMapBtn.on('click', function (event) {
    event.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/editCurrentMap',
        success: function (response) {
          if (response.redirect) {window.location.href = response.redirect;}
        }
      });
  });

  // Action when delete map is clicked
  deleteMapBtn.on('click', function (event) {
    event.preventDefault();
    $.ajax({
        type: 'POST',
        url: '/deleteMap',
        success: function (response) {
          if (response.redirect) {window.location.href = response.redirect;}
        }
      });
  });

});

// check and condition the marker array data to send a usable request to
// the server that is free of unwanted data.
function conditionMapData (markerArr) {
  let requestMarkers = [];
  let outBool = true;
  markerArr.forEach((marker, index) => {
    requestMarkers.push({
      lat: marker.getPosition().lat(),
      lng: marker.getPosition().lng(),
    });

    if (!marker.infoBox) {
      outBool = false;
    } else if (marker.infoBox.title === "" || marker.infoBox.description === "" || marker.infoBox.url === "") {
      outBool = false;
    } else { requestMarkers[index].infoBox = marker.infoBox; }
  });
  return {outBool: outBool, outArr: requestMarkers}
}