$(document).ready(() => {
  $('#user-type input[type=radio]').on('change', () => {
    const selectedUserType = $('#user-type input[type=radio]:checked').val();

    if (selectedUserType === 'Indústria') {
      console.log('Industria');
      $('.producer-option').hide();
      $('.franchisee-option').hide();
      $('.dealer-option').hide();
      $('.industry-option').removeClass('d-none').show().focus();
    }
    else if (selectedUserType === 'Produtor') {
      console.log('Produtor');
      $('.industry-option').hide();
      $('.franchisee-option').hide();
      $('.dealer-option').hide();
      $('.producer-option').removeClass('d-none').show();
    }
    else if (selectedUserType === 'Franqueado') {
      console.log('Franqueado');
      $('.producer-option').hide();
      $('.industry-option').hide();
      $('.dealer-option').hide();
      $('.franchisee-option').removeClass('d-none').show();
    }
    else if (selectedUserType === 'Revenda')  {
      console.log('Revenda');
      $('.producer-option').hide();
      $('.franchisee-option').hide();
      $('.industry-option').hide();
      $('.dealer-option').removeClass('d-none').show();
    }

    $('#form-buttons').removeClass('d-none').show(); // Classe bootstrap que esconde o elemento
  });
});
