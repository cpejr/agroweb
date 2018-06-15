$('#paid').click(function () {
  if (confirm('Tem certeza que deseja confirmar o pagamento?')) {
    $(this).prop("disabled",true);
    $('#status-payment-form').submit();
  }
});

$('#delivered').click(function () {
  if (confirm('Tem certeza que deseja confirmar a entrega?')) {
    $(this).attr('checked', 'checked');
    document.getElementById('delivered').disabled = true;
  }
});
