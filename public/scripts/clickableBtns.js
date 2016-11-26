$(function () {
  // action for when compose is clicked
  let newMapBtn = $('.newMapBtn');

  newMapBtn.on('click', function (event) {

    templateVars = {
      mapCentreLat: map.getCenter().lat(),
      mapCentreLng: map.getCenter().lng(),
      mapZoom: map.getZoom(),
      mapPoints: points
    }
    console.log("BEFORE: ", templateVars);

    $.ajax({
      type: 'POST',
      url: '/users/:username/create',
      data: templateVars,
      success: function () {
        console.log('SUCCESS');
      }
    });

  });

});