$('#navbar-form').on('click', (e) => {
  e.stopPropagation(); // Para a programação pra que nenhum outro evento seja disparado
  $('#navbar-form .fa-search, #navbar-form button').hide();
  $('nav .form-control').show();
});

$(document).on('click', () => {
  $('nav .form-control').hide();
  $('#navbar-form .fa-search, #navbar-form button').show();
});
