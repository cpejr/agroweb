$(document).ready(() => {
  var password = document.getElementById('password'),
    confirmPassword = document.getElementById('confirmPassword');

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
    else if (selectedUserType === 'Revendedor') {
      $('.producer-option').hide();
      $('.franchisee-option').hide();
      $('.industry-option').hide();
      $('.dealer-option').removeClass('d-none').show();
    }

    $('#form-buttons').removeClass('d-none').show(); // Classe bootstrap que esconde o elemento
  });

  function validatePassword() {
    if (password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('As senhas não coincidem!');
    }
    else {
      confirmPassword.setCustomValidity('');
    }
  }

  password.onchange = validatePassword;
  confirmPassword.onkeyup = validatePassword;

  $('#industryOption').click(() => {
    $.get('/industryOption', (response) => {
      const wind = window.open('', 'Industry Option', 'width=600,height=600,scrollbars=yes');
      wind.document.write(response);
    });
  });

  $('#producerOption').click(() => {
    $.get('/producerOption', (response) => {
      const wind = window.open('', 'Producer Option', 'width=600,height=600,scrollbars=yes');
      wind.document.write(response);
    });
  });

  $('#franchiseeOption').click(() => {
    $.get('/site/franchisee', (response) => {
      const wind = window.open('', 'Franchisee Option', 'width=600,height=600,scrollbars=yes');
      wind.document.write(response);
    });
  });

  $('#dealerOption').click(() => {
    $.get('/dealerOption', (response) => {
      const wind = window.open('', 'Dealer Option', 'width=600,height=600,scrollbars=yes');
      wind.document.write(response);
    });
  });
});

function limpa_formulario_cep() {
            //Limpa valores do formulário de cep.
            document.getElementById('rua').value=("");
            document.getElementById('cidade').value=("");
            document.getElementById('estado').value=("");
            document.getElementById('rua1').value=("");
            document.getElementById('cidade1').value=("");
            document.getElementById('estado1').value=("");
            document.getElementById('rua2').value=("");
            document.getElementById('cidade2').value=("");
            document.getElementById('estado2').value=("");
            document.getElementById('rua3').value=("");
            document.getElementById('cidade3').value=("");
            document.getElementById('estado3').value=("");

    }

    function meu_callback(conteudo) {
        if (!("erro" in conteudo)) {
            //Atualiza os campos com os valores.
            document.getElementById('rua').value=(conteudo.logradouro);
            document.getElementById('cidade').value=(conteudo.localidade);
            document.getElementById('estado').value=(conteudo.uf);
            document.getElementById('rua1').value=(conteudo.logradouro);
            document.getElementById('cidade1').value=(conteudo.localidade);
            document.getElementById('estado1').value=(conteudo.uf);
            document.getElementById('rua2').value=(conteudo.logradouro);
            document.getElementById('cidade2').value=(conteudo.localidade);
            document.getElementById('estado2').value=(conteudo.uf);
            document.getElementById('rua3').value=(conteudo.logradouro);
            document.getElementById('cidade3').value=(conteudo.localidade);
            document.getElementById('estado3').value=(conteudo.uf);
        } //end if.
        else {
            //CEP não Encontrado.
            limpa_formulario_cep();
            alert("CEP não encontrado.");
            document.getElementById('cep').value=("");
            document.getElementById('cep1').value=("");
            document.getElementById('cep2').value=("");
            document.getElementById('cep3').value=("");

        }
    }

    function pesquisacep(valor) {

        //Nova variável "cep" somente com dígitos.
        var cep = valor.replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep !== "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if(validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                document.getElementById('rua').value="...";
                document.getElementById('cidade').value="...";
                document.getElementById('estado').value="...";
                document.getElementById('rua1').value="...";
                document.getElementById('cidade1').value="...";
                document.getElementById('estado1').value="...";
                document.getElementById('rua2').value="...";
                document.getElementById('cidade2').value="...";
                document.getElementById('estado2').value="...";
                document.getElementById('rua3').value="...";
                document.getElementById('cidade3').value="...";
                document.getElementById('estado3').value="...";


                //Cria um elemento javascript.
                var script = document.createElement('script');

                //Sincroniza com o callback.
                script.src = '//viacep.com.br/ws/'+ cep + '/json/?callback=meu_callback';

                //Insere script no documento e carrega o conteúdo.
                document.body.appendChild(script);

            } //end if.
            else {
                //cep é inválido.
                limpa_formulario_cep();
                alert("Formato de CEP inválido.");
            }
        } //end if.
        else {
            //cep sem valor, limpa formulário.
            limpa_formulario_cep();
        }
    }

function formatar(mascara, documento){
  var i = documento.value.length;
  var saida = mascara.substring(0,1);
  var texto = mascara.substring(i);

  if (texto.substring(0,1) != saida){
            documento.value += texto.substring(0,1);
  }

}

function idade (){
    var data=document.getElementById("dtnasc").value;
    var dia=data.substr(0, 2);
    var mes=data.substr(3, 2);
    var ano=data.substr(6, 4);
    var d = new Date();
    var ano_atual = d.getFullYear(),
        mes_atual = d.getMonth() + 1,
        dia_atual = d.getDate();

        ano=+ano,
        mes=+mes,
        dia=+dia;

    var idade=ano_atual-ano;

    if (mes_atual < mes || mes_atual == mes_aniversario && dia_atual < dia) {
        idade--;
    }
return idade;
}


function exibe(i) {



	document.getElementById(i).readOnly= true;




}

function desabilita(i){

     document.getElementById(i).disabled = true;
    }
function habilita(i)
    {
        document.getElementById(i).disabled = false;
    }


function showhide()
 {
       var div = document.getElementById("newpost");

       if(idade()>=18){

    div.style.display = "none";
}
else if(idade()<18) {
    div.style.display = "inline";
}

 }
