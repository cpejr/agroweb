const nodemailer = require('nodemailer');
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
      from: 'andreluis@cpejr.com.br',
      to: data.clientEmail,
      subject: data.subject,
      text: data.content
    };
    console.log('Config' + config);
    console.log(config.to);
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

  static contactEmail(data) {
    const config = {
      from: data.clientEmail,
      to: 'admcpejr@megapool.com.br',
      subject: data.subject,
      text: data.content
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
    console.log('Franqueado: '+ franchisee);
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
    console.log('Franqueado: '+ franchisee);
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
    const content = `Prezado(a) ${data.firstName},
     Sua conta Megapool acabou de ser inativada. Já se passou muito tempo desde seu último acesso. Para reativá-la, basta logar novamente na plaforma. A reativação será feita imediatamente no acesso.`;
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
    const content = `Prezado(a) ${data.firstName},
     Sua conta Megapool acabou de ser bloqueada. Nossa equipe analisou o caso e decidiu que essa ação fosse necessária. Portanto, não será mais possível utilizar sua conta.`;
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
    const text = `Prezado(a) ${data.firstName},
    o status do seu pedido foi atualizado para "${status}"`;
    const subject = 'MEGAPOOL: Atualização no status do seu pedido';
    const emailContent = {
      ...data,
      text,
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
    return new Promise((resolve) => {
      Money.getUsdValue().then((usd) => {
        const totalPrice = data.priceBought * usd;
        const unitPrice = data.unitPrice * usd;
        const content = `Prezado(a) ${data.buyer.firstName},
        Sua compra do produto ${data.offer.product.name} foi realizada com sucesso.
        A transação permanecerá com o status "Aguardando boleto" até que o vendedor aprove a compra e envie o boleto para você.

        Confira abaixo os detalhes da sua compra:
        Compra #${data._id}
        Produto: ${data.offer.product.name}
        Entrega: ${data.offer.delivery}
        Quantidade: ${data.amountBought} ${data.offer.product.unit}
        Preço: R$ ${unitPrice}/${data.offer.product.unit}
        Total: R$ ${totalPrice}

        Dados do vendedor:
        Nome: ${data.offer.seller.fullName}
        Email: ${data.offer.seller.email}
        Telefone: ${data.offer.seller.phone}
        Celular: ${data.offer.seller.cellphone}

        Se você não fez essa compra, clique no link: `;
        const subject = 'MEGAPOOL: Compra realizada com sucesso';
        const emailContent = {
          clientEmail: 'andrecosta.leao@gmail',
          // clientEmail: data.buyer.email,
          subject,
          content
        };
        return new Promise((resolve) => {
          Email.sendEmail(emailContent).then((info) => {
            resolve(info);
          });
        });
      }).catch((err) => {
        console.log(err);
        return err;
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
    return new Promise((resolve) => {
      Money.getUsdValue().then((usd) => {
        const totalPrice = data.priceBought * usd;
        const unitPrice = data.unitPrice * usd;
        const content = `Prezado(a) ${data.offer.seller.firstName},
      Você tem uma nova demanda do produto ${data.offer.product.name}.
      A transação aguarda sua aprovação e pode ser consultada no caminho Dashboard -> Boletos pendentes
      O comprador terá acesso ao boleto uma vez que você aprove a transação e gere o boleto.
      O administrador irá gerar o boleto referente à parcela da Megapool sobre a venda.

      Confira abaixo os detalhes da sua venda:
      Transação #${data._id}
      Produto: ${data.offer.product.name}
      Entrega: ${data.offer.delivery}
      Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
      Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
      Preço: R$ ${unitPrice}/${data.offer.product.unit}
      Total: R$ ${totalPrice}

      Dados do comprador:
      Nome: ${data.buyer.fullName}
      Email: ${data.buyer.email}
      Telefone: ${data.buyer.phone}
      Celular: ${data.buyer.cellphone}`;
        const subject = `MEGAPOOL: Oi ${data.offer.seller.firstName}, você tem uma nova demanda`;
        const emailContent = {
          clientEmail: data.seller.email,
          subject,
          content
        };
        return new Promise((resolve) => {
          Email.sendEmail(emailContent).then((info) => {
            resolve(info);
          });
        });
      }).catch((err) => {
        console.log(err);
        return err;
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
     return new Promise((resolve) => {
       Money.getUsdValue().then((usd) => {
         const totalPrice = data.priceBought * usd;
         const unitPrice = data.unitPrice * usd;
         console.log('admin Email');
         const content = `Nova compra realizada sob o número #${data._id}.
         A transação permanecerá com o status "Aguardando boleto" até que o vendedor aprove a compra e envie o boleto para o comprador.
         Esse terá acesso ao boleto uma vez que o vendedor aprove a transação e gere o boleto.
         Para transação ocorrer com sucesso, é preciso emitir o boleto para o vendedor referente à parcela da Megapoll sobre a venda.

         Confira abaixo os detalhes da transação:
         Transação #${data._id}
         Produto: ${data.offer.product.name}
         Entrega: ${data.offer.delivery}
         Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
         Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
         Preço: R$ ${unitPrice}/${data.offer.product.unit}
         Total: R$ ${totalPrice}

         Dados do vendedor:
         Nome: ${data.offer.seller.fullName}
         Email: ${data.offer.seller.email}
         Telefone: ${data.offer.seller.phone}
         Celular: ${data.offer.seller.cellphone}

         Dados do comprador:
         Nome: ${data.buyer.fullName}
         Email: ${data.buyer.email}
         Telefone: ${data.buyer.phone}
         Celular: ${data.buyer.cellphone}`;
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
       }).catch((err) => {
         console.log(err);
         return err;
       });
     });
   }

  static FranchiseeEmail(data) {
    console.log('Franchisee Email');

    return new Promise((resolve) => {
      Money.getUsdValue().then((usd) => {
      const totalPrice = data.priceBought * usd;
      const unitPrice = data.unitPrice * usd;
      const content = `Prezado ${data.franchisee.firstName},
      Uma cotação realizada por você foi aprovada para compra ${data.offer.product.name}.
      A transação foi aprovada e pode ser consultada no caminho Dashboard -> Minhas compras
      Confira abaixo os detalhes da transação realizada:

      Transação #${data._id}
      Produto: ${data.offer.product.name}
      Entrega: ${data.offer.delivery}
      Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
      Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
      Preço: R$ ${unitPrice}/${data.offer.product.unit}
      Total: R$ ${totalPrice}

      Dados do comprador:
      Nome: ${data.buyer.fullName}
      Email: ${data.buyer.email}
      Telefone: ${data.buyer.phone}
      Celular: ${data.buyer.cellphone}`;
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
      }).catch((err) => {
        console.log(err);
        return err;
      });
    });
  }
  static Indication(data) {
    console.log('Indication');
    return new Promise((resolve) => {
      const content = `Prezado administrador,
      O seguinte usuário quer uma recomendação de franqueado:
      Nome: ${data.fullName}
      Email: ${data.email}
      Telefone: ${data.phone}
      Celular: ${data.cellphone}  `;
      const subject = `Olá administrador, um cliente gostaria de uma indicação`;
      const emailContent = {
        clientEmail: 'andrecosta.leao@gmail.com',
        subject,
        content
      };
      return new Promise((resolve) => {
        Email.sendEmail(emailContent).then((info) => {
          resolve(info);
        });
      });
    });
  }
}

module.exports = Email;
