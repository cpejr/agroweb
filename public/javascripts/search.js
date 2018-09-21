$(document).ready(() => {
  $("#product-name").keyup(() => {
    $.get("../search/products",{ filter: $('#product-name').val() }, (result) => {
      printResult(result);
    });
  });
});

function printResult(result)
{
  $("#products-result").html(result);
}
