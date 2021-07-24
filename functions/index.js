const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require('express')();

admin.initializeApp();

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "adventure-planner-fb111.firebaseapp.com",
  projectId: "adventure-planner-fb111",
  storageBucket: "adventure-planner-fb111.appspot.com",
  messagingSenderId: "700952279621",
  appId: "1:700952279621:web:dc444bbe408ff62e02c12c",
  measurementId: "G-YDQFRZ9WC5"
};

const firebase = require('firebase')
firebase.initializeApp(config)

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.get('/messages', (req, res) => {
  db
      .collection("messages")
      .orderBy('createdAt', 'desc')
      .get()
      .then((data) => {
        const messages = [];
        data.forEach((doc) =>{
          messages.push(
            {
              messageId: doc.id,
              body: doc.data().body,
              userHandle: doc.data().userHandle,
              createdAt: doc.data().createdAt,
            }
          );
        } );
        return res.json(messages);
      } )
      .catch((err) => console.error(err));
})

app.post('/messages', (req, res) => {
  const newMessage = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  }

  db
    .collection('messages')
    .add(newMessage)
    .then(doc => {
        res.json({message: `document ${doc.id} created successfully`})
    })
    .catch(err => {
        res.status(500).json({error: `There is an error: ${err}`})
    })
})

//signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  // validate Data
 db.doc(`/users/${newUser.handle}`).get()
  .then(doc => {
    if(doc.exists){
      return res.status(400).json({handle: 'this handle is already taken'})
    } else{
      return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
    }
  })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({error: err })
    })
})


//  https://baseurl.com/api/
exports.api = functions.https.onRequest(app);