const express = require('express')
const db = require('../database')
const {
  getWorkingDays,
  rearrangeArraySchedule,
  weekday
} = require('./middleware/app')

const router = express.Router()

router.get('/', (req, res) => {
  const getUsers = db.any('SELECT * FROM users')
  const getSchedules = db.any("SELECT user_id, firstname, day, TO_CHAR(start_at, 'HH.MIam') start_at, TO_CHAR(end_at, 'HH.MIam') end_at FROM schedules s JOIN users u ON u.id=s.user_id ORDER BY user_id, day");

  Promise.all([getUsers,getSchedules]).then(data => {
    const users = data[0]
    const schedules = data[1]
    const newArraySchedule = rearrangeArraySchedule(schedules)
    const days = getWorkingDays(schedules)

    res.render('pages/schedules', {
      users,
      schedules,
      newArraySchedule,
      days,
      weekday,
      showById: false,
      userId: 'x'
    })

  })

  .catch((error) => {
    console.log(error)
    res.render('pages/error', {
      message: error.message
    })
  })
  
})

router.get('/:id/:day/new', (req, res) => {
  let user_id = Number.parseInt(req.params.id)
  let day = Number.parseInt(req.params.day)
  let matchUser = false
  let matchWeekday = false
  let user_name = ''

  db.any('SELECT * FROM users')

  .then(users => {
    for(let i = 0; i < users.length; i++) {
      if(users[i].id == user_id) {
        user_name = users[i].firstname + ' ' + users[i].lastname
        matchUser = true
      }
    }

    if(matchUser === false){
      user_id = ""
      res.redirect("/error?message=" + "User does not match")
    }

    if(day != 0 && day <= weekday.length-1) 
      matchWeekday = true

    if(matchWeekday === false) {
      res.redirect("/error?message=" + "Working day does not match")
    }

    res.render('pages/new-schedule', {
      users,
      user_id,
      user_name,
      day,
      weekday
    })
  })
})

router.get('/new', (req, res) => {
  db.any('SELECT * FROM users')

  .then(users => {
    res.render('pages/new-schedule', {
      users,
      weekday
    })
  })

  .catch((error) => {
    console.log(error)
    res.redirect("/error?message=" + error)
  })
})


router.post('/', (req, res) => {
  const userId = Number.parseInt(req.body.user_id)
  const day = Number.parseInt(req.body.day)
  const start_at_mm = req.body.start_at_mm
  const end_at_mm = req.body.end_at_mm

  let start_at_hh, end_at_hh, start_at, end_at

  if(req.body.start_am === 'PM')
    start_at_hh = 12 + Number.parseInt(req.body.start_at_hh)
  else
    start_at_hh = Number.parseInt(req.body.start_at_hh)

  if(req.body.end_am === 'PM')
    end_at_hh = 12 + Number.parseInt(req.body.end_at_hh)
  else
    end_at_hh = Number.parseInt(req.body.end_at_hh)

  start_at = "2000-01-01 " + start_at_hh + ":" + start_at_mm
  end_at = "2000-01-01 " + end_at_hh + ":" + end_at_mm

  db.none('INSERT INTO schedules (user_id, day, start_at, end_at) VALUES ($1, $2, $3, $4);', [userId, day, start_at, end_at])

  .then(sid => {
    // res.redirect(`/users/${userId}/${day}/schedules`)
    res.redirect(`/schedules`)
  })

  .catch(error => {
    console.log(error)
    res.redirect("/error?message=" + error.message)
    // res.render('pages/error', {
    //   message: error.message
    // })
  })
})

router.post('/view-user',(req, res)=>{
  
  const {user_id} = req.body

  db.any("SELECT *, TO_CHAR(start_time,'HH12:MI AM')start_time ,TO_CHAR(end_time,'HH12:MI AM')end_time FROM schedules WHERE user_id =$1 ",[user_id])
  .then((schedules)=>{

        db.any('SELECT * FROM users WHERE id =$1',[user_id])
  
    .then((users)=>{
      
 res.render('pages/userinfo',{
         
                  
                    id:user_id,
                    firstname:users[0].firstname,
                    lastname:users[0].lastname,
                    email:users[0].email, 
                    days,
                    schedules   
 
       })
      })

    })
  
    
    .catch((error)=>{
 
      console.log(error)
      
      res.redirect("/error?message=" + error.message)
          }) 
  
       .catch((error)=>{
 
        console.log(error)
        
        res.redirect("/error?message=" + error.message)
            })
  
  })


module.exports = router