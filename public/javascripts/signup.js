$(document).ready(() => {
  $('input[name=userType]').on('change', () => {
    const selectedUserType = $('input[name=userType]:checked').val();

    if (selectedUserType === 'Indústria') {
      $('.producer-option').hide();
      $('.franchisee-option').hide();
      $('.dealer-option').hide();
      $('.industry-option').removeClass('d-none').show().focus();
    }
    else if (selectedUserType === 'Produtor') {
      $('.industry-option').hide();
      $('.franchisee-option').hide();
      $('.dealer-option').hide();
      $('.producer-option').removeClass('d-none').show();
    }
    else if (selectedUserType === 'Franqueado') {
      $('.producer-option').hide();
      $('.industry-option').hide();
      $('.dealer-option').hide();
      $('.franchisee-option').removeClass('d-none').show();
    }
    else {
      $('.producer-option').hide();
      $('.franchisee-option').hide();
      $('.industry-option').hide();
      $('.dealer-option').removeClass('d-none').show();
    }

    $('#form-buttons').removeClass('d-none').show(); // Classe bootstrap que esconde o elemento
  });
});
