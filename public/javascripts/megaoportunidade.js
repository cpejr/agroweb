$(document).ready(() => {
  $('#select').on('change', () => {
     $('#megaOpportunity').empty();
      const badgeHtml = `
      <div class="user-input">
        <br/>
        <div class="input-group mb-2">
         <div class="input-group-prepend">
           <div class="input-group-text"><i class="fas fa-car"></i></div>
         </div>
         <select class="form-control new-shadow" name="offer[delivery]" required/>
           <option disabled selected value>-- Forma de entrega --</option>
           <option value="31 dias">Em até 31 dias</option>
           <option value="48 horas">Em até 48 horas</option>
         </select>
        </div>
      </div>`;
      $('#megaOpportunity').append(badgeHtml);
  });
});
