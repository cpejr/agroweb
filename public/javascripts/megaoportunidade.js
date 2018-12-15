// $(document).ready(() => {
//   $('#select').on('change', () => {
//      $('#megaOpportunity').empty();
//       const badgeHtml = `
//       <div class="user-input">
//         <br/>
//         <div class="input-group mb-2">
//          <div class="input-group-prepend">
//            <div class="input-group-text"><i class="fas fa-car"></i></div>
//          </div>
//          <select class="form-control new-shadow" name="offer[delivery]" required/>
//            <option disabled selected value>-- Forma de entrega --</option>
//            <option value="31 dias">Em até 31 dias</option>
//            <option value="48 horas">Em até 48 horas</option>
//          </select>
//         </div>
//       </div>`;
//       $('#megaOpportunity').append(badgeHtml);
//   });

  function myFunction() {
  // Get the checkbox
  var checkBox = document.getElementById("my-check");
  // Get the output text
  var text1 = document.getElementById("text1");
  var text2 = document.getElementById("text2");
  var text3 = document.getElementById("text3");
  var text4 = document.getElementById("text4");

  // var price = document.getElementByClassName("on-checkbox")[0];


  // If the checkbox is checked, display the output text
  if (checkBox.checked == true) {
    $('#input1').removeAttr('required');
    $('#input2').removeAttr('required');
    $('#input3').removeAttr('required');
    $('#input4').removeAttr('required');
    text1.style.display = "none";
    text2.style.display = "block";
    text3.style.display = "none";
    text4.style.display = "block";


  } else {
    $('#input1').removeAttr('required');
    $('#input2').removeAttr('required');
    $('#input3').removeAttr('required');
    $('#input4').removeAttr('required');
    text1.style.display = "block";
    text2.style.display = "none";
    text3.style.display = "block";
    text4.style.display = "none";



  }
}
// });
