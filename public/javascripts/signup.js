$(document).ready(() => {
  $('input[name=user_type]').on('change', () => {
    let selectedUserType = $('input[name=user_type]:checked').val();

    if (selectedUserType == 'industry') {
      $('.producer-option').hide();
      $('.franchisee-option').hide();
      $('.dealer-option').hide();
      $('.industry-option').removeClass('d-none').show().focus();
    }
    else if (selectedUserType == 'producer') {
      $('.industry-option').hide();
      $('.franchisee-option').hide();
      $('.dealer-option').hide();
      $('.producer-option').removeClass('d-none').show();
    }
    else if (selectedUserType == 'franchisee') {
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
