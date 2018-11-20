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
      from: data.clientEmail,
      to: 'lucassouza@cpejr.com.br',
      // to: 'admcpejr@megapool.com.br',
      subject: data.subject,
      text: data.content
    };
    // console.log(config);
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
    //console.log(data);
    const text = `Prezado(a) ${data.buyer.firstName},
    Sua compra do produto ${data.offer.product.name} foi realizada com sucesso.
    A transação permanecerá com o status "Aguardando boleto" até que o vendedor aprove a compra e envie o boleto para você.

    Confira abaixo os detalhes da sua compra:
    Compra #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade: ${data.amountBought} ${data.offer.product.unit}
    Preço: R$ ${data.unitPrice}/${data.offer.product.unit}
    Total: R$ ${data.priceBought}

    Dados do vendedor:
    Nome: ${data.offer.seller.fullName}
    Email: ${data.offer.seller.email}
    Telefone: ${data.offer.seller.phone}
    Celular: ${data.offer.seller.cellphone}

    Se você não fez essa compra, clique no link: `;
    const subject = 'MEGAPOOL: Compra realizada com sucesso';
    const emailContent = {
      // clientEmail: data.buyer.email,
      // clientEmail: 'admcpejr@megapool.com.br',
      clientEmail: 'lucassouza@cpejr.com.br',
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
    // console.log(data);
    const text = `Prezado(a) ${data.offer.seller.firstName},
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
    Preço: R$ ${data.unitPrice}/${data.offer.product.unit}
    Total: R$ ${data.priceBought}

    Dados do comprador:
    Nome: ${data.buyer.fullName}
    Email: ${data.buyer.email}
    Telefone: ${data.buyer.phone}
    Celular: ${data.buyer.cellphone}`;
    const subject = `MEGAPOOL: Oi ${data.offer.seller.firstName}, você tem uma nova demanda`;
    const emailContent = {
      //clientEmail: data.offer.seller.email,
      // clientEmail: 'admcpejr@megapool.com.br',
      clientEmail: 'lucassouza@cpejr.com.br',
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
    console.log('Admin Email');
    // console.log(data);
    const text = `Nova compra realizada sob o número #${data._id}.
    A transação permanecerá com o status "Aguardando boleto" até que o vendedor aprove a compra e envie o boleto para o comprador. Esse terá acesso ao boleto uma vez que o vendedor aprove a transação e gere o boleto.

    Para transação ocorrer com sucesso, é preciso emitir o boleto para o vendedor referente à parcela da Megapoll sobre a venda.

    Confira abaixo os detalhes da transação:
    Transação #${data._id}
    Produto: ${data.offer.product.name}
    Entrega: ${data.offer.delivery}
    Quantidade vendida: ${data.amountBought} ${data.offer.product.unit}
    Quantidade em estoque: ${data.offer.stock} ${data.offer.product.unit}
    Preço: R$ ${data.unitPrice}/${data.offer.product.unit}
    Total: R$ ${data.priceBought}

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
      clientEmail: 'lucassouza@cpejr.com.br',
      // clientEmail: 'admcpejr@megapool.com.br',
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
