var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res) => {
  res.render('maintenance', { title: 'Manutenção', extraCss: 'maintenance', layout: 'layout' });
});

module.exports = router;
