var currentMapId;

$(function () {

  // list the maps on the side bar.
  function listMaps() {
    let data = JSON.parse(window.data);
    let listOfMaps = data.list;
    let displayBox = $("#displayBox");

    displayBox.on('click', '.mapListButtons', function (event) {
      event.preventDefault();
      currentMapId = this.getAttribute('data-button');

      $.ajax({
        type: 'POST',
        url: '/listMaps',
        data: {mapId: this.getAttribute('data-button')},
        success: function (response) {
          if (response.redirect) {window.location.href = response.redirect;}
        }
      });

    });

    listOfMaps.forEach((item) => {
      let $button = $(`
        <a href="#" class="list-group-item mapListButtons" type="button" data-button=${item.id}>${item.title}</a>`);
      displayBox.append($button);
    });
  }
  listMaps();
});