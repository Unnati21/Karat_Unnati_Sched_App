const express = require('express')
const db = require('../database')
const { redirectToLogin } = require('./middleware/redirect')
const { weekday } = require('./middleware/app')

const router = express.Router()

router.get('/', redirectToLogin, (req, res) => {
  db.any("SELECT s.user_id,u.firstname,u.lastname, day, TO_CHAR(start_at, 'HH.MIam') start_at, TO_CHAR(end_at, 'HH.MIam') end_at FROM schedules s JOIN users u ON u.id=s.user_id ORDER BY day, start_at")
  
  .then(schedules => {
    const userId = req.session.userId;
    res.render('pages/home', {
      weekday,
      schedules
    })
    
  })
  

  .catch(error => {
    console.log(error.message)
  })

})


module.exports = router