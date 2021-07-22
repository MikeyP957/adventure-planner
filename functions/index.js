const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Do Geese See God");
});

exports.getMessagse = functions.https.onRequest((req, res) => {
  admin
      .firestore()
      .collection("messages")
      .get()
      .then((data) => {
        const messages = [];
        data.forEach((doc) =>{
          messages.push(doc.data());
        } );
        return res.json(messages);
      } )
      .catch((err) => console.error(err));
});

exports.createMessagse = functions.https.onRequest((req, res) => {
  const newMessage = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  }

  admin.firestore()
    .collection('messages')
    .add(newMessage)
    .then(doc => {
        res.json({message: `document ${doc.id} created successfully`})
    })
    .catch(err => {
        res.status(500).json({error: `There is an error: ${err}`})
    })

});
