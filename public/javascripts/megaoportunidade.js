$(document).ready(() => {
  $(() => {
      $('#mega-price').hide();
      $('#mega-block-delivery').hide();

      $('#mega').on('click', function () {
          if ($(this).prop('checked')) {
              $('#mega-price').fadeIn();
              $('#mega-price-input').attr('required','required');
              $('#low-price').hide();
              $('#low-price-input').removeAttr('required');
              $('#average-price').hide();
              $('#average-price-input').removeAttr('required');
              $('#high-price').hide();
              $('#high-price-input').removeAttr('required');
              $('#mega-block-delivery').fadeIn();
              $('#change-prices').hide();
              $('#low-breakpoint').removeAttr('required');
              $('#average-breakpoint').removeAttr('required');
              $('#normal-delivery').removeAttr('required');
              $('#mega-delivery').attr('required','required');
              $('#damage-input').attr('required','required');
              $('#low-breakpoint').val(2)
              $('#average-breakpoint').val(1)
          } else {
              $('#mega-price').hide();
              $('#mega-price-input').removeAttr('required');
              $('#low-price').fadeIn();
              $('#low-price-input').attr('required','required');
              $('#average-price').fadeIn();
              $('#average-price-input').attr('required','required');
              $('#high-price').fadeIn();
              $('#high-price-input').attr('required','required');
              $('#mega-block-delivery').hide();
              $('#change-prices').fadeIn();
              $('#low-breakpoint').attr('required','required');
              $('#average-breakpoint').attr('required','required');
              $('#normal-delivery').attr('required','required');
              $('#mega-delivery').removeAttr('required');
              $('#damage-input').removeAttr('required');
              $('#low-breakpoint').val(0)
              $('#average-breakpoint').val(0)
          }
      });
  });
});
