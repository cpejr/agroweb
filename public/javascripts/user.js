$('form .fa-search').on('click', () => {
  $('form .fa-search, form button').hide();
  $('nav .form-control').show();
});

$('.list-group-item').on('click', () => {
  $('nav .form-control').hide();
  $('form .fa-search, form button').show();
});
