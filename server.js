//a website framework
const express = require('express');
//parses the json data
const bodyParser = require('body-parser');
//a password hashing function that makes the site more securely handle user passwords by encrypyting
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'smartbrain'
    }
});

const app = express();

db.select('*').from('users').then(data => {
  console.log(data);
})

app.use(cors())
app.use(bodyParser.json());

app.get('/', (req, res)=> {
    res.send(db.users);
})

/*
/ --> responds with --> this is working
/signin  --> POST request because im post some user information == sucess/fail
/register --> POST to database = new user
/profile/: userid --> GET = returns users individual data
/image --> PUT updates user data of how many images the user has uploaded 
*/


//compares the password entered with the hashed password linked to the email entered within the database using bycrypt
//enabling the user to log in securely
app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
      .where('email', '=', req.body.email)
      .then(data => {
        console.log(req.body.email);
        console.log(req.body.password);
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
          return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
              res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        } else {
          res.status(400).json('wrong credentials')
        }
      })
      .catch(err => res.status(400).json('wrong credentials'))
  })
  
  //registers the user by first encrypting the password the user entered than it stores the hashed password and 
  //email into the login database.
  //it then returns the email which is uses along with name and the time the user joined to create the users account.
  app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    console.log(req.body);
    const hash = bcrypt.hashSync(password);
    console.log(hash);
      db.transaction(trx => {
        trx.insert({
          hash: hash,
          email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()
            })
            .then(user => {
              res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
      })
      .catch(err => res.status(400).json('unable to register'))
  })
  
  //gets all of the user data of the user with the same id as the one requested
  //if successful returns user data
  //if fails returns 'Not found' error
  app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    db.select('*').from('users').where({id})
      .then(user => {
        if (user.length) {
          res.json(user[0])
        } else {
          res.status(400).json('Not found')
        }
      })
      .catch(err => res.status(400).json('error getting user'))
  })
  
  //handles the entry amount by each user
  //after a user uploads an image it gets the number of entries that user has already submitted using their id number
  //then increments that number by 1
  //then return the new 'entries; number back in to the user data in the database
  app.put('/image', (req, res) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json('unable to get entries'))
  })

  //listens for connections on port 3000 and logs and a message on the console when the connection is found
app.listen(3000, ()=> {
    console.log('app is running on port 3000');
})
