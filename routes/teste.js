var express = require('express');

var router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('maintenance', { title: 'Manutenção', layout: "layoutMaintenance" });
});

module.exports = router;
