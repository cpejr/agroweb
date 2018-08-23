const nodemailer = require('nodemailer');

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
      text: data.text
    };
    console.log(config);
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

  /**
   * Send an update email
   * @param {Object} data - Email Document Data
   * @param {String} status - Transaction's new status
   * @returns {Object} Information
   */
  static updateEmail(data, status) {
    const text = `Prezado(a) ${data.name},
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
    console.log(data);
    const text = `Prezado(a) ${data.buyer.firstName},
    Sua compra do produto ${data.offer.product.name} foi realizada com sucesso.
    A transação permanecerá com o status "Boleto pendente" até que o administrador aprove a compra e envie o boleto para você.
    Confira abaixo os detalhes da sua compra:
    Compra #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade: ${data.amountBought}
    Preço: R$ ${data.unitPrice}/${data.offer.product.unit}
    Total: R$ ${data.priceBought}

    Se você não fez essa compra, clique no link: `;
    const subject = 'MEGAPOOL: Compra realizada com sucesso';
    const emailContent = {
      clientEmail: data.buyer.email,
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
   * Send an email to the seller
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static sellEmail(data) {
    console.log('Seller Email');
    console.log(data);
    const text = `Prezado(a) ${data.offer.seller.firstName},
    Você tem uma nova demanda do produto ${data.offer.product.name}.
    A transação permanecerá com o status "Boleto pendente" até que o administrador aprove a compra e envie o boleto para o comprador.
    Confira abaixo os detalhes da sua venda:
    Transação #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade vendida: ${data.amountBought}
    Quantidade em estoque: ${data.offer.stock}
    Preço: R$ ${data.unitPrice}/${data.offer.product.unit}
    Total: R$ ${data.priceBought} `;
    const subject = `MEGAPOOL: Oi ${data.offer.seller.firstName}, você tem uma nova demanda`;
    const emailContent = {
      clientEmail: data.offer.seller.email,
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
   * Send an email to the admin about a new transaction
   * @param {Object} data - Email Document Data
   * @returns {Object} Information
   */
  static adminNewTransactionEmail(data) {
    console.log('admin Email');
    console.log(data);
    const text = `Nova compra realizada sob o número #${data._id}.
    A transação aguarda sua aprovação e pode ser consultada no caminho Dashboard -> Boletos pendentes ou pelo link

    O comprador terá acesso ao boleto uma vez que você aprove a transação e gere o boleto.

    Confira abaixo os detalhes da transação:
    Transação #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade vendida: ${data.amountBought}
    Quantidade em estoque: ${data.offer.stock}
    Preço: R$ ${data.unitPrice}/${data.offer.product.unit}
    Total: R$ ${data.priceBought} `;
    const subject = 'MEGAPOOL: Uma nova transação foi realizada';
    const emailContent = {
      clientEmail: 'felipesouza@cpejr.com.br',
      text,
      subject
    };
    return new Promise((resolve) => {
      Email.sendEmail(emailContent).then((info) => {
        resolve(info);
      });
    });
  }
}

module.exports = Email;
