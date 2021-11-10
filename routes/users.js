const express = require('express')
const db = require('../database')
const bcrypt = require('bcryptjs')
const router = express.Router()
)

const {
  rearrangeArraySchedule,
  getWorkingDays,
  weekday, 
  } = require('./middleware/app')


    const firstnameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ -'\.]+$/
    const lastnameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ -'\.]+$/
    
    const emailRegex  = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const passwordRegex = /^[a-zA-Z0-9]{4,15}$/

  const isValid = (value, regex) => {
    return regex.test(value)
  }
  
  const cleanEmail = (email) => {
  return email ? email.toLowerCase().trim() : ""
}

router.get('/new', (req, res) => {
  console.log('hello')
  console.log(req.session)
  
  res.render('pages/register', {
   errors: req.flash("error")
  })
})


//Create the first routes to return all the informatin(GET USERS)
router.get('/',(req, res) => {
  db.any('SELECT * FROM users;')
  .then((users) => {
    console.log(users)
    
    res.render('pages/users', {
      name:users.firstname + users.lastname,
      users
      
    })

  })
  .catch((error) => {
    console.log(error)
    res.render('pages/error',{
      message:error.message
    })
  })
 
})
//create parameterized routes(get individual users)
router.get('/:id', (req,res) => {
  const userId = Number.parseInt(req.params.id, 10)
 
  const getUsers = db.any('SELECT * FROM users WHERE id = $1', [userId])
  const getSchedules = db.any(`SELECT user_id, day, TO_CHAR(start_at, 'HH.MI AM') start_at, TO_CHAR(end_at, 'HH.MI AM') end_at  FROM schedules WHERE user_id=$1`, [userId])
  Promise.all([getUsers,getSchedules]).then(data => {
    const user = data[0]
    const schedules = data[1]
    const days = getWorkingDays(schedules)

    res.render('pages/view-user', {
      user,
      schedules,
      days,
      weekday,
     userId
    })
  })
})




  


//get userid/schedules
router.get('/:id/schedules', (req, res) => {
  const userId = Number.parseInt(req.params.id)

  const getUsers = db.any('SELECT * FROM users')
  const getSchedules = db.any(`SELECT user_id, firstname, day, TO_CHAR(start_at, 'HH.MIAM') start_at, TO_CHAR(end_at, 'HH.MIAM') end_at FROM schedules s JOIN users u ON u.id=s.user_id ORDER BY user_id, day`);

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
      showById: true,
      userId
    })
  })
})

router.get('/:id/:day/schedules', (req, res) => {
  const userId = Number.parseInt(req.params.id, 10)
  const day = Number.parseInt(req.params.day, 10)

  const getUsers = db.any('SELECT * FROM users')
  const getSchedules = db.any(`SELECT user_id, firstname, day, TO_CHAR(start_at, 'HH.MIAM') start_at, TO_CHAR(end_at, 'HH.MIAM') end_at FROM schedules s JOIN users u ON u.id=s.user_id ORDER BY user_id, day`);

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
      showById: true,
      userId,
      day
    })
  })
})
//display register form
// @path    '/users/register'
// @desc    register a new user
// @access  public


router.post('/new', (req, res) => {
 console.log('Hello')
  const { firstname, lastname, email, password, confirmPassword } = req.body
  const cleanedEmail = cleanEmail(email)
 
   // 1. validate! - yup and joi are decent validation packages

   if (!firstname||!lastname||!email || !password || !confirmPassword )  req.flash("error", "Please enter all fields")
   if (!isValid(cleanedEmail, emailRegex)) req.flash("error", "Email not valid")
   if (!isValid(password, passwordRegex)) req.flash("error", "Password must be 6 characters or more")
   if (password !== confirmPassword)   req.flash("error", "Passwords don't match")
  if (req.session.flash.error.length > 0) return res.redirect("/users/new")


   db.oneOrNone('SELECT email FROM users WHERE email = $1;', [cleanedEmail])
   .then((user) => {
     if (user) return res.send("User already exists")
     const salt = bcrypt.genSaltSync(10)
     const hash = bcrypt.hashSync(password, salt)
 console.log(req.body)
     db.none('INSERT INTO users (firstname, lastname, email, password) VALUES ($1, $2, $3, $4);', [firstname, lastname, cleanedEmail, hash])
     .then(() => {
      res.flash('success', 'User successfully created, please login.')
      res.flash('success', 'Good job!')
       res.redirect('/users/login')
       // TODO: add success message
     })
     .catch((err) => {
      // error inserting into db
      console.log(err)
      res.send(err.message)
    })
  })
   .catch((err) => {
     // error checking whether the email exists
     console.log(err)
     res.send(err.message)
   })
 })



  
 





module.exports = router
