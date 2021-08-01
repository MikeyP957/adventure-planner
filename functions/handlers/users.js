const { admin, db} = require("../util/admin");
const config = require("../util/config");
const {validateSignupData, validateLoginData, reduceUserDetails} = require("../util/validators");
const firebase = require("firebase");
const noImage = 'no-image.png'


let token;
let userId;

firebase.initializeApp(config);

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const {valid, errors} = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);


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
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImage}?alt=media`,
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
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  const {valid, errors} = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);


  firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({token});
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
      });
};

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
      return res.json({message: 'details added successfully'})
    })
    .catch(err => {
      console.error(err)
      return res.status(500).json({error: err})
    })
}

exports.getAuthenticatedUser = (req, res) => {
  let resData = {};
  db.doc(`/user/${req.user.handle}`).get()
  .then(doc => {
    if(doc.exists){
      userData.credentials = doc.data()
      return db.collection('likes').where('userHandle', '==', req.user.handle).get()
    }
  })
  .then(data => {
    userData.likes = [];
    data.forEach(doc => {
      userData.likes.push(doc.data());
    });
    return res.json(userData);
  })
  .catch(err => {
    console.error(err)
    res.status(500).json({error: err.code})
  })
}

exports.uploadImage = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({headers: req.headers});

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({error: 'Wrong file type!'})
    }
    console.log('filename: ', filename)
    console.log('file: ', file)
    console.log('mimetype: ', mimetype)

    const imageExt = filename.split('.')[filename.split('.').length -1];
    //possibly change to using a uuid from npm
    imageFileName = `${Math.round(Math.random()*1000000000000)}.${imageExt}`
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  } );

  busboy.on('finish', () => {
    admin.storage().bucket().upload(imageToBeUploaded.filepath, {
      resumable: false,
      metadata: {
        metadata: {
          contentType: imageToBeUploaded.mimetype
        }
      }
    })
    .then(() => {
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
      return db.doc(`/users/${req.user.handle}`).update({imageUrl})
    })
    .then(() => {
      return res.json({message: 'image uploaded successfully'})
    })
    .catch(err => {
      console.error(err)
    });
  });
  busboy.end(req.rawBody)
}
