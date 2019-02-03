const nodemailer = require('nodemailer');
const fs = require('fs');
const Money = require('../functions/money');
const Transaction = require('../models/transaction');

const transporter = nodemailer.createTransport({
  host: `${process.env.EMAIL_HOST}`,
  port: `${process.env.EMAIL_PORT}`,
  secure: false,
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASS}`
  },
  tls: {
    rejectUnauthorized: false
  }
});

class Email {
  /**
   * Send an email
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static sendEmail(data) {

    const config = {
      from: 'admcpejr@megapool.com.br',
      to: data.clientEmail,
      subject: data.subject,
      text: data.content,
      attachments: data.attachments
    };

    console.log(`Config ${config}`);
    console.log(config.to);
    return new Promise((resolve) => {
      transporter.sendMail(config, (error, info) => {
        if (error) {
          console.log(error);
          resolve(error);
        }
        else {
          console.log(`Email enviado ${info.response}`);
          resolve(info);
        }
      });
    });
  }

  static contactEmail(data) {
    const config = {
      from: data.clientEmail,
      to: 'admcpejr@megapool.com.br',
      subject: data.subject,
      text: `Mensagem enviada por: ${data.name}

      ${data.content}`
    };
    return new Promise((resolve) => {
      transporter.sendMail(config, (error, info) => {
        if (error) {
          resolve(error);
        }
        else {
          console.log(`Email enviado ${info.response}`);
          resolve(info);
        }
      });
    });
  }


  static contractApprovedEmail(data, franchisee) {
    console.log('Email contrato aprovado');
    const content = `Prezado(a) ${data.firstName},
  ${franchisee} acabou de aceitar sua solicitação de franqueamento. A partir de agora, ele poderá realizar cotações e compras para você, facilitando muito sua experiência na plataforma Megapool.`;
    const subject = 'MEGAPOOL: Pedido aceito';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  static contractRepprovedEmail(data, franchisee) {
    console.log(`Franqueado: ${franchisee}`);
    console.log('Email contrato reprovado');
    const content = `Prezado(a) ${data.firstName},
     ${franchisee} acabou de recusar sua solicitação de franqueamento. Portanto, ele não será capaz de realizar cotações e compras para você.`;
    const subject = 'MEGAPOOL: Pedido recusado';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to waiting approval users
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static waitingForApprovalEmail(data) {
    console.log('Email aguardando aprovação enviado');
    console.log(data);
    const content = `Prezado(a) ${data.firstName},
    Você acabou de cadastrar na plataforma Megapool. Seus dados foram enviados para nossa equipe e avaliaremos se será aprovado ou não. Aguarde essa avaliação para começar a utilizar as funcionalidades.`;
    const subject = 'MEGAPOOL: Cadastro feito com sucesso';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to approved users
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static approvedUsersEmail(data) {
    console.log('Email aprovado enviado');
    const content = `Caro(a) ${data.firstName},
    Sua conta na plataforma MEGAPOOL, foi aprovada.
    Entre na site da MEGAPOOL, com seu login e senha e tenha acesso a tudo que a plataforma possa lhe proporcionar!

    Os usuários da plataforma devem pagar à equipe MEGAPOOL uma taxa sob suas vendas proporcional ao valor do produto negociado e que dependente da categoria do produto. Esses valores podem ser vistos a seguir:
    Defensivos agrícolas/Agroquímicos -> 1%
    Sementes em geral -> 2%
    Fertilizantes sólidos de base -> 0,65%
    Fertilizantes liquidos/Adjuvantes/Biológicos -> 3%
    Produtos Mega Oportunidade -> 3%

    Bons negócios!
    Dúvidas, entre em contato conosco: suportemegapool@megapool.com.br

    Equipe MEGAPOOL`;
    const subject = 'MEGAPOOL: Conta ativada';
    const emailContent = {
      // clientEmail: data.email,
      clientEmail: 'lucaschaia@hotmail.com',
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to disapprovedUsers
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static disapprovedUsersEmail(data) {
    console.log('Email reprovado enviado');
    const content = `Prezado(a) ${data.firstName},
  Analisamos a sua solicitação de cadastro e, infelizmente, seu pedido não foi aceito por nossa equipe. Portanto, não será possível utilizar as funcionalidades da plataforma Megapool.`;
    const subject = 'MEGAPOOL: Cadastro reprovado';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to activate users
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static activatedUsersEmail(data) {
    console.log('Email ativado enviado');
    const content = `Prezado(a) ${data.firstName},
    Sua conta Megapool acabou de ser ativada. A partir de agora você poderá entrar com seu email e senha na plataforma, começando a fazer suas atividades. Aproveite!`;
    const subject = 'MEGAPOOL: Conta ativada';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to inactive users
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static inactivatedUsersEmail(data) {
    console.log('Email inativado enviado');
    const content = `Caro(a) ${data.firstName},
    Sua conta encontra-se inativada.

    Por favor, entre em contato com nosso suporte para que possamos resolver: suportemegapool@megapool.com.br

    Obrigado
    Equipe MEGAPOOL`;
    const subject = 'MEGAPOOL: Conta inativada';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to blocked users
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static blockedUsersEmail(data) {
    console.log('Email bloqueado enviado');
    const content = `Caro(a) ${data.firstName},
    Sua conta encontra-se bloqueada.

    Por favor, entre em contato com nosso suporte para que possamos resolver: suportemegapool@megapool.com.br

    Obrigado
    Equipe MEGAPOOL`;
    const subject = 'MEGAPOOL: Conta bloqueada';
    const emailContent = {
      clientEmail: data.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an update email
   * @param {Object} data - Email Document Data
   * @param {String} status - Transaction's new status
   * @returns {Object} Information
   */
  static updateEmail(data, status) {
    console.log('Update email');
    const content = `Caro(a) ${data.firstName},
    Seu pedido #${data.transactionID} teve atualização de status para:"${status}"`;
    const subject = `MEGAPOOL: Atualização no status do pedido #${data.transactionID}`;
    const emailContent = {
      ...data,
      content,
      subject
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
  * Send an email to the buyer
  * @param {Object} data - Email Document Data
  * @returns {Object} Information
  */
  static buyEmail(data) {
    console.log('Buyer Email');
    const totalPrice = data.priceBought;
    const unitPrice = data.unitPrice;
    const content = `Caro(a) ${data.buyer.firstName},
    Sua compra* do produto ${data.offer.product.name} foi realizada com sucesso e permanecerá com status de "Aguardando boleto" até o vendedor confirmar a venda. Você será informado quando isso acontecer.

    Confira os dados de sua compra abaixo:

    Compra #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade: ${data.amountBought} ${data.offer.product.unit}
    Preço: U$ ${unitPrice}/${data.offer.product.unit}
    Total: U$ ${totalPrice}

    Dados do vendedor:
    Nome: ${data.offer.seller.fullName}
    Email: ${data.offer.seller.email}
    Telefone: ${data.offer.seller.phone}
    Celular: ${data.offer.seller.cellphone}

    *LEMBRE-SE: Todos os preços são em Dólar, para conversão será utilizado o valor do Dólar Ptax de venda do dia anterior ao vencimento.

    Qualquer divergência entre em contato conosco: suportemegapool@megapool.com.br
    Equipe MEGAPOOL`;
    const subject = 'MEGAPOOL: Compra realizada com sucesso';
    const emailContent = {
      clientEmail: data.buyer.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
  * Send an email to the seller
  * @param {Object} data - Email Document Data
  * @returns {Object} Information
  */
  static sellEmail(data) {
    console.log('Seller Email');
    const totalPrice = data.priceBought;
    const unitPrice = data.unitPrice;
    const content = `Caro(a) ${data.offer.seller.firstName},

    Parabéns, você fez uma nova venda* do produto ${data.offer.product.name}. Existe pedido pendente para sua aprovação em seu ambiente virtual em Dashboard -> Boletos pendentes, entre e confirme por favor.
    - Confira o volume, preço e condição de entrega.
    - Estando de acordo, emita o boleto para o cliente e envie o mesmo através da plataforma.
    - Assim que receber o valor acertado, comunique no status que o boleto foi pago e proceda com a entrega.
    - O administrador irá gerar o boleto referente à parcela da MEGAPOOL sobre a venda.
    - Caso seja necessário gerar um novo boleto para a venda, retorne o status para "Boleto pendente" e a opção de enviar o boleto aparecerá novamente.
    - *** Caso não queira concretizar o negócio, cancele a venda, porém saiba que estará sujeito às implicações previstas.

    Confira abaixo os detalhes da sua venda:
    Transação #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
    Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
    Preço: U$ ${unitPrice}/${data.offer.product.unit}
    Total: U$ ${totalPrice}

    Dados do comprador:
    Nome: ${data.buyer.fullName}
    Email: ${data.buyer.email}
    Telefone: ${data.buyer.phone}
    Celular: ${data.buyer.cellphone}

    *LEMBRE-SE: Todos os preços são em Dólar, para conversão será utilizado o valor do Dólar Ptax de venda do dia anterior ao vencimento.

    Ótimos negócios.

    Equipe MEGAPOOL`;
    const subject = `MEGAPOOL: Oi ${data.offer.seller.firstName}, você tem uma nova demanda`;
    const emailContent = {
      clientEmail: data.offer.seller.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
  * Send an email to the admin about a new transaction
  * @param {Object} data - Email Document Data
  * @returns {Object} Information
  */
  static adminNewTransactionEmail(data) {
    console.log('Admin Email');
    const totalPrice = data.priceBought;
    const unitPrice = data.unitPrice;
    const content = `Nova compra* realizada sob o número #${data._id}.
    A transação permanecerá com o status "Aguardando boleto" até que o vendedor aprove a compra e envie o boleto para o comprador.
    Esse terá acesso ao boleto uma vez que o vendedor aprove a transação e gere o boleto.
    Para transação ocorrer com sucesso, é preciso emitir o boleto para o vendedor referente à parcela da Megapoll sobre a venda.

    Confira abaixo os detalhes da transação:
    Transação #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
    Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
    Preço: U$ ${unitPrice}/${data.offer.product.unit}
    Total: U$ ${totalPrice}

    Dados do vendedor:
    Nome: ${data.offer.seller.fullName}
    Email: ${data.offer.seller.email}
    Telefone: ${data.offer.seller.phone}
    Celular: ${data.offer.seller.cellphone}

    Dados do comprador:
    Nome: ${data.buyer.fullName}
    Email: ${data.buyer.email}
    Telefone: ${data.buyer.phone}
    Celular: ${data.buyer.cellphone}
    *LEMBRE-SE: Todos os preços são em Dólar, para conversão será utilizado o valor do Dólar Ptax de venda do dia anterior ao vencimento. `;
    const subject = 'MEGAPOOL: Uma nova transação foi realizada';
    const emailContent = {
      clientEmail: 'admcpejr@megapool.com.br',
      content,
      subject
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }


  /**
  * Send an email to the franchisee about a new transaction
  * @param {Object} data - Email Document Data
  * @returns {Object} Information
  */
  static franchiseeEmail(data) {
    console.log('Franchisee Email');
    const totalPrice = data.priceBought;
    const unitPrice = data.unitPrice;
    const content = `Prezado ${data.franchisee.firstName},
    Uma cotação realizada por você foi aprovada para compra* ${data.offer.product.name}.
    A transação foi aprovada e pode ser consultada no caminho Dashboard -> Minhas compras
    Confira abaixo os detalhes da transação realizada:

    Transação #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
    Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
    Preço: U$ ${unitPrice}/${data.offer.product.unit}
    Total: U$ ${totalPrice}

    Dados do comprador:
    Nome: ${data.buyer.fullName}
    Email: ${data.buyer.email}
    Telefone: ${data.buyer.phone}
    Celular: ${data.buyer.cellphone}
    *LEMBRE-SE: Todos os preços são em Dólar, para conversão será utilizado o valor do Dólar Ptax de venda do dia anterior ao vencimento. `;
    const subject = `Olá ${data.franchisee.fullName}, uma cotação sua foi comprada.`;
    const emailContent = {
      clientEmail: data.franchisee.email,
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to the admin asking for a indication
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static indication(data) {
    console.log('Indication');
    const content = `Prezado administrador,

    O seguinte usuário quer uma recomendação de franqueado:
    Nome: ${data.fullName}
    Email: ${data.email}
    Telefone: ${data.phone}
    Celular: ${data.cellphone}  `;
    const subject = 'Olá administrador, um cliente gostaria de uma indicação';
    const emailContent = {
      clientEmail: 'admcpejr@megapool.com.br',
      subject,
      content
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to the franchisee when it sign up at MEGAPOOl
   * @param {Object} email - Franchisee's email
   * @returns {Object} Information
   */
  static signedUpFranchisee(email) {
    const content = `Olá, caro profissional

Seu pré cadastro será analisado pelo nosso departamento de franquias e será deferido ou indeferido no prazo máximo de 3 dias.
Outras informações complementares poderão ser solicitadas.
Caso aprovado, será enviado o contrato de franqueado para que possa ler e assinar se estiver de acordo.

À disposição,
Equipe de franquias MEGAPOOL.`;
    const subject = 'MEGAPOOL: Pré-cadastro efetuado';
    const emailContent = {
      clientEmail: email,
      content,
      subject
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to the franchisee with the contract
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static franchiseeContract(data) {
    const content = `Olá, ${data.firstName}

Após análise do seu pré cadastro, seu pedido como franqueado foi aceito.
Segue em anexo o contrato de franqueado:
- Deverá ser lido e assinado.
- Devolvido a MEGAPOOL. (franqueado@megapool.com.br)
- Será enviado também o boleto da taxa de franquia, que deverá ser pago e enviado o comprovante no mesmo e-mail.
Após esse processo sua senha de operação será liberada.

A disposição
Equipe de franquias MEGAPOOL`;
    const subject = 'MEGAPOOL: Contrato';
    const emailContent = {
      clientEmail: data.email,
      content,
      subject,
      attachments: [{ path: data.path }]
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        fs.unlink(data.path, (err) => {
          if (err) throw err;
          resolve(info);
        });
      });
    });
  }

  /**
   * Send to the franchisee the acceptance e-mail notice
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static acceptFranchisee(data) {
    const content = `Parabéns, ${data.firstName}
Você agora é um franqueado MEGAPOOL e faz parte do maior grupo de compras online do Brasil!
Você terá acesso a todas informações disponíveis na plataforma para desenvolver seu trabalho através de seu escritório virtual:
Link do site: https://www.megapool.com.br

Em caso de duvidas ou suporte entra em contato: suportemegapool@megapool.com.br

Desejamos ótimos negócios
Equipe de franquias MEGAPOOL.`;
    const subject = 'MEGAPOOL: Cadastro aceito';
    const emailContent = {
      clientEmail: data.email,
      content,
      subject
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send the franchisee the rejection e-mail notice
   * @param {Object} email - Franchisee's Email Address
   * @returns {Object} Information
   */
  static rejectFranchisee(email) {
    const content = `Após análise do seu pré cadastro, seu pedido como franqueado foi indeferido. O indeferimento do pedido de franqueado ocorre por 2 motivos principais, são eles:
- Perfil do profissional incompatível com a função.
- Números de franqueado máximo atingido na mesma região.
O pedido pode ser feito novamente após 60 dias, onde ele irá passar novamente por avaliação.

Agradecemos o seu interesse e estamos a disposição: suportemegapool@megapool.com.br
Equipe de franquias MEGAPOOL.`;
    const subject = 'MEGAPOOL: Cadastro rejeitado';
    const emailContent = {
      clientEmail: email,
      content,
      subject
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }

  /**
   * Send an email to the client with the ticket
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static ticket(data) {
    const content = `Olá, ${data.firstName}

Seu pedido #${data.transactionID} teve atualização de status para: "Aguardando pagamento".
Segue em anexo o boleto para realizar o pagamento da sua compra. Não se esqueça de enviar o comprovante de pagamento pela plataforma.

A disposição
Equipe MEGAPOOL`;
    const subject = `MEGAPOOL: Atualização no status do pedido #${data.transactionID}`;
    const emailContent = {
      // clientEmail: data.email,
      clientEmail: 'maarina.faria@gmail.com',
      content,
      subject,
      attachments: [{ path: data.path }]
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        fs.unlink(data.path, (err) => {
          if (err) throw err;
          resolve(info);
        });
      });
    });
  }

  /**
   * Send an email to the client with the tax ticket
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static taxTicket(data) {
    const content = `Olá, ${data.firstName}

Segue em anexo o boleto para realizar o pagamento da taxa referente à sua venda #${data.transactionID}.
Não se esqueça de enviar o comprovante de pagamento pela plataforma.

A disposição
Equipe MEGAPOOL`;
    const subject = `MEGAPOOL: Pagamento da taxa venda #${data.transactionID}`;
    const emailContent = {
      // clientEmail: data.email,
      clientEmail: 'maarina.faria@gmail.com',
      content,
      subject,
      attachments: [{ path: data.path }]
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        fs.unlink(data.path, (err) => {
          if (err) throw err;
          resolve(info);
        });
      });
    });
  }

  /**
   * Send an email with the proof of payment
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static paymentProof(data) {
    const content = `Olá, ${data.firstName}

Segue em anexo o comprovante de pagamento referente a venda #${data.transactionID}. Confira os dados e, caso esteja tudo certo, lembre-se de atualizar o status da venda para "Pagamento confirmado" na plataforma.

A disposição
Equipe MEGAPOOL`;
    const subject = `MEGAPOOL: Comprovante de pagamento do pedido #${data.transactionID}`;
    const emailContent = {
      // clientEmail: data.email,
      clientEmail: 'maarina.faria@gmail.com',
      content,
      subject,
      attachments: [{ path: data.path }]
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        fs.unlink(data.path, (err) => {
          if (err) throw err;
          resolve(info);
        });
      });
    });
  }

  /**
   * Send an email with the tax's proof of payment
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static taxPaymentProof(data) {
    const content = `Segue em anexo o comprovante de pagamento da taxa Megapool referente a venda #${data.transactionID}.
Confira os dados e, caso esteja tudo certo, lembre-se de atualizar o status para "Pagamento confirmado" na plataforma.`;
    const subject = `MEGAPOOL: Comprovante de pagamento de taxa #${data.transactionID}`;
    const emailContent = {
      // clientEmail: 'admcpejr@megapool.com.br',
      clientEmail: 'maarina.faria@gmail.com',
      content,
      subject,
      attachments: [{ path: data.path }]
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        fs.unlink(data.path, (err) => {
          if (err) throw err;
          resolve(info);
        });
      });
    });
  }
}

module.exports = Email;
