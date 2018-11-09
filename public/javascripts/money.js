$(document).ready(() => {
$.ajax({
    type: 'GET',
    url: 'https://economia.awesomeapi.com.br/json/USD-BRL/1'
  }).done((data) => {
    $('[data-usd=true]').each((index, value) => {
      value.textContent = "R$ " + convertPrice(data[0]["ask"], toNumber(value.textContent));
    });
  });
});

function toNumber(value) {
  return isNaN(value) == false ? parseFloat(value) :   parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'));
}

function convertPrice(usd, realPrice) {
  number = usd * realPrice;
  number = number.toFixed(2);
  return number;
}
