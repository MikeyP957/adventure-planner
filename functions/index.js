
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
const secret= require("secret")(functions.config().secret.key);

admin.initializeApp();

const config = {
  apiKey: secret,
  authDomain: "adventure-planner-fb111.firebaseapp.com",
  projectId: "adventure-planner-fb111",
  storageBucket: "adventure-planner-fb111.appspot.com",
  messagingSenderId: "700952279621",
  appId: "1:700952279621:web:dc444bbe408ff62e02c12c",
  measurementId: "G-YDQFRZ9WC5",
};

const firebase = require("firebase");
const { isEmpty } = require("lodash");
firebase.initializeApp(config);

const db = admin.firestore();
let token;
let userId;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const emptyString = (string) => {
  if(string.trim() === '') return true;
  else return false;
}
const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if(email.match(emailRegEx)) return true
  else return false;
}

const FBAuth = (req, res, next ) => {
  let idToken;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('no token found')
    return res.status(403).json({error: 'Unauthorized'})
  }

  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db.collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error('Error while verifying token', err);
      return res.status(403).json(err)
    })
}

app.get("/messages", (req, res) => {
  db
      .collection("messages")
      .orderBy("createdAt", "desc")
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
});
// post one message
app.post("/messages", FBAuth, (req, res) => {
  const newMessage = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
  };

  db
      .collection("messages")
      .add(newMessage)
      .then((doc) => {
        res.json({message: `document ${doc.id} created successfully`});
      })
      .catch((err) => {
        res.status(500).json({error: `There is an error: ${err}`});
      });
});

// signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  let errors = {};

  // validate Data
 
  if(emptyString(newUser.email)) {
    errors.email = 'Must not be empty';
  } else if (!isEmail(newUser.email)){
    errors.email = 'must be a valid email address'
  }

  if(emptyString(newUser.password)) errors.password = 'Must not be empty';
  // if(newUser.passowrd !== newUser.confirmPassword) errors.confirmPassword = 'passwords must match'
  if(emptyString(newUser.handle)) errors.handle = 'Must not be empty';
  
  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  // userToken and userId defined at top

  db.doc(`/users/${newUser.handle}`).get()
      .then((doc) => {
        if (doc.exists) { // makes username unique
          return res.status(400).json({handle: "this handle is already taken"});
        } else {
          return firebase
              .auth()
              .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then((data) => {
        userId = data.user.uid;
        return data.user.getIdToken();
      })
      .then((idToken) => {
        token = idToken;
        const userCredentials = {
          handle: newUser.handle,
          email: newUser.email,
          createdAT: new Date().toISOString(),
          userId: userId,
        };
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then(()=> {
        return res.status(201).json({token});
      })
      .catch((err) => {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
          return res.status(400).json({message: "email is already in use"});
        }
        return res.status(500).json({error: err});
      });
});
//login
app.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
    password:req.body.password
  };

  let errors = {};

  if(emptyString(user.email)) errors.email = 'Must not be empty';
  if(emptyString(user.password)) errors.password = 'Must not be empty';

  if(Object.keys(errors).length > 0) return res.status(400).json(errors);

  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({ error: err.code })
    })

})


//  https://baseurl.com/api/
exports.api = functions.https.onRequest(app);
