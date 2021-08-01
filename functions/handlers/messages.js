const {db} = require("../util/admin");

exports.getAllMessages = (req, res) => {
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
};

exports.postOneMessage = (req, res) => {
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
};

exports.getOneMessage = (req, res) => {
  let messageData = {};
  db.doc(`/messages/${req.params.messageId}`).get()
  .then(doc => {
    console.log("document: ",doc)
    if(!doc.exists){
      return res.status(404).json({error: 'message not found'})
    }
    messageData = doc.data();
    messageData.messageId = doc.id;
    return db
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .where('messageId', '==', req.params.messageId)
      .get();
  })
  .then(data => {
    messageData.comments = [];
    data.forEach(doc => {
      messageData.comments.push(doc.data())
    })
    return res.json(messageData)
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({error: err.code})
  })
}