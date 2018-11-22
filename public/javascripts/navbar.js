// $('#navbar-form').on('click', (e) => {
//   e.stopPropagation(); // Para a programação pra que nenhum outro evento seja disparado
//   $('#navbar-form #show .fa-search, #show').removeClass('d-inline');
//   $('#navbar-form #show .fa-search, #show').addClass('d-none');
//   $('#navbar-form #search .fa-search, #search').removeClass('d-none');
//   $('#navbar-form #search.fa-search, #search').addClass('d-inline');
//   $('nav .form-control').removeClass('d-none');
//   $('nav .form-control').addClass('d-inline');
//   $('#menu').removeClass('d-inline');
//   $('#menu').addClass('d-none');
// });

$(document).on('click', () => {
  // $('nav .form-control').hide();
  // $('#navbar-form .fa-search, #navbar-form button').show();
  $('#navbar-form #show .fa-search, #show').removeClass('d-inline');
  $('#navbar-form #show .fa-search, #show').addClass('d-inline');
  $('#navbar-form #search .fa-search, #search').removeClass('d-inline');
  $('#navbar-form #search .fa-search, #search').addClass('d-none');
  $('nav .form-control').removeClass('d-inline');
  $('nav .form-control').addClass('d-none');
  $('#menu').removeClass('d-none');
  $('#menu').addClass('d-inline');
  $('.btn-ok').on('click', () => {
      $(this).parent().addClass('d-none');
  });
});

let removeParent = (element) => {
  $(element).parent().parent().addClass('d-none');
}
