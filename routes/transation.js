const express = require('express');
const auth = require('./middleware/auth');

const router = express.Router();

/**
 * GET Index - Show all groups
 */
router.get('/', (req, res) => {
  res.render('/succcess', { title: 'Sua compra foi efetuada com sucesso!'});

  function newTransation{
    createTransation
    update offer
    update group
    update user (vendendor e comprador)
  }

});

module.exports = router;
