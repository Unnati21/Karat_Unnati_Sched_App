const weekday = ['','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const rearrangeArraySchedule = (schedules) => {

  const newArray = []
  let userId, day, time, start_at, end_at
  let currentUserId = -9999
  let currentDay = -9999
  let count = 0

  for( let i = 0; i < schedules.length; i++ ) {
    userId = schedules[i].user_id
    day = schedules[i].day
    start_at = schedules[i].start_at
    end_at = schedules[i].end_at

    if(start_at[0] == '0') {
      start_at = start_at.substr(1)
      schedules[i].start_at = start_at
    }

    if(end_at[0] == '0') {
      end_at = end_at.substr(1)
      schedules[i].end_at = end_at
    }

    time = start_at + '' +  end_at

    newArray[`${userId} ${day} start`] = start_at
    newArray[`${userId} ${day} end`] = end_at
  }
 
  return newArray
}

const getWorkingDays = (schedules) => {
  const days = []
  for(let i = 0; i < schedules.length; i++){
    if(days.includes(schedules[i].day) == false) {
      days.push(schedules[i].day)
    }
  }
  
  days.sort()

  return days;
}

const getUsers = (schedules) => {
  const users = []

  for(let i = 0; i < schedules.length; i++){
    let count = 0
    let match = false

    for(let j = 0; j < users.length; j++ ) {
      if(users[j].id === schedules[i].user_id) {
        match = true
      }

      count++
    }
  
    if(match === false && count == users.length) {
      users.push({
        id: schedules[i].user_id,
        username: schedules[i].username
      })
    }
  }
  
  users.sort()
  return users;
}

const validateInput = (input) => {
  const regex = {
    firstname: /^[A-Za-zÀ-ÖØ-öø-ÿ -'\.]+$/,
    lastname: /^[A-Za-zÀ-ÖØ-öø-ÿ -'\.]+$/,
   username: /^[a-zA-Z0-9]+$/,
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    password: /^[a-zA-Z0-9]{4,15}$/
  }

  let count = 0

  for(let key in input){
    if(regex[key].test(input[key])){
      console.log(`${key}: true`)
      count++
    }else{
      console.log(`${key}: false`)
      console.log(input[key])
    }
  }

  if(count === 5){
    return true;
  }

  return false;
}

module.exports = {
  getUsers,
  getWorkingDays,
  rearrangeArraySchedule,
  validateInput,
  weekday
}