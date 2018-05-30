var express = require('express');
const firebase = require ('firebase');
var router = express.Router();



/* GET users listing. */
router.get('/', (req, res, next) => {
  res.render('newsletterlist', { title: 'Newsletter'});
  firebase.firestore().collection('newsletter').where("mail", "==", true).get()
    .then(function(querySnapshot){
      querySnapshot.forEach(function(doc){
        console.log(doc.id, " => ", doc.data());
      });
    }).catch(function(error){
      console.log("Error getting documents: ", error);
    });
});


module.exports = router;
