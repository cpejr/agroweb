$(document).ready((offer) => {
$.ajax(
  {
    type:"GET",
    url:"https://economia.awesomeapi.com.br/json/USD-BRL/1"
  })
  .done(function(data)
  {
    console.log(data);
    console.log(data[0]["ask"]);
    console.log(data[0]["ask"]*offer.priceBought);
    //var data = JSON.parse(data);
    // Manipula o dado aqui
  });
});
