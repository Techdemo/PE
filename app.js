const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const hbs = require('express-handlebars'); 

const admin = require('firebase-admin')
const serviceAccount = require('./ServiceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore(); 
const increment = admin.firestore.FieldValue.increment(1); 
const Ref = db.collection('votes').doc('food')

app.set('view engine', 'hbs')
app.engine( 'hbs', hbs( {
    extname: 'hbs', 
    defaultView: 'default', 
    layoutsDir: __dirname + '/views/layouts/', 
    partialsDir: __dirname + '/views/partials/'
}))
app.use(express.urlencoded())
app.use(express.static('public'))

app.get('/', function(req, res, next) {
res.render('home', {
    layout: 'default', 
    template: 'home-template'
  });
});

app.post('/vote-submitted', (req, res) => {
  if (req.body.food === undefined){
    res.render('home', {
      layout: 'default', 
      template: 'home-template', 
      err: "*Je hebt geen stemveld aangewezen. Selecteer je voorkeur en druk op submit"
    })
  } else {
  const vote = req.body.food
 

  let getDoc = Ref.get()
    .then(doc => {
      if (!doc.exists) {
        console.log("no such document")
      } else {
        Ref.update({ [vote]: increment })
        let data = doc.data()
        res.render('results', {
          layout: 'default', 
          template: 'home-template', 
          vote: vote, 
          data: data
        })
      }
    })
    .catch(err => {
      console.log('error getting document', err)
    })
  }
})

app.get('/results', function(req, res, next) {
  let getDoc = Ref.get()
    .then(doc => {
      if (!doc.exists) {
        console.log("no such document")
      } else {
        let data = doc.data()
        res.render('results', {
          layout: 'default', 
          template: 'home-template', 
          data: data
        })
      }
    })
  });

app.listen(port, () => console.log(`Example app listening on port ${port}!`))