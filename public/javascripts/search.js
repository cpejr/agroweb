$(document).ready(() => {
  $("#product-name").keyup(() => {
    $.get("../search/products",{ filter: $('#product-name').val() }, (result) => {
      $("#products-result").html(result);
    });
  });
});
