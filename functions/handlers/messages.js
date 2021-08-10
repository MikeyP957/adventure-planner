const {db} = require("../util/admin");
// messagesId refers to the table, messageId is stored on a comment etc.
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
    userImage: req.user.imageUrl, //does this change on cascade? i.e. if the user posts a message and then changes their image, does this change as well?
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db
      .collection("messages")
      .add(newMessage)
      .then((doc) => {
        const resMessage = newMessage;
        resMessage.messageId = doc.id;
        res.json(resMessage);
      })
      .catch((err) => {
        res.status(500).json({error: `There is an error: ${err}`});
      });
};

exports.getOneMessage = (req, res) => {
  let messageData = {};
  db.doc(`/messages/${req.params.messagesId}`).get()
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
      .where('messageId', '==', req.params.messagesId)
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

exports.commentOnMessage = (req, res) => {
  if(!req.body) {
    return res.status(400).json({error: 'Must not be empty'})
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    userHandle: req.user.handle,
    messageId: req.params.messagesId,
    userImage: req.user.imageUrl
  }

  db.doc(`/messages/${req.params.messagesId}`)
    .get()
    .then(doc => {
      console.log("doc: ", doc)
      if(!doc.exists){
        return res.status(404).json({error: 'Message not found'})
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1})
    })
    .then(() => {
      console.log("comment: ",newComment)
      res.json(newComment);
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: 'something went wrong'})
    })
}

exports.likeMessage = (req, res) => {
  const likeDocument = db.collection('likes').where("userHandle", "==", req.user.handle).where("messageId", "==", req.params.messageId).limit(1);

    const messageDocument = db.doc(`/messages/${req.params.messageId}`);

    let messageData;

    messageDocument.get()
    .then(doc => {
      if(doc.exists){
        messageData = doc.data();
        messageData.messageId = doc.id;
        return likeDocument.get()
      } else {
        return res.status(404).json({error: 'message not found'})
      }
    })
    .then(data => {
      if(data.empty){
        return db.collection('likes').add({
          messageId: req.params.messageId,
          userHandle: req.user.handle
        })
        .then(() => {
          messageData.likeCount++
          return messageDocument.update({ likeCount: messageData.likeCount});
        })
        .then(() => {
          return res.json(messageData)
        })
      } else {
        return res.status(400).json({error: "message already liked"})
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error:err.code})
    })
}

exports.unlikeMessage = (req, res) => {
  const likeDocument = db.collection('likes').where("userHandle", "==", req.user.handle)
    .where("messageId", "==", req.params.messageId).limit(1);

    const messageDocument = db.doc(`/messages/${req.params.messageId}`);

    let messageData;

    messageDocument.get()
    .then(doc => {
      if(doc.exists){
        messageData = doc.data();
        messageData.messageId = doc.id;
        return likeDocument.get()
      } else {
        return res.status(404).json({error: 'message not found'})
      }
    })
    .then(data => {
      if(data.empty){
        return res.status(400).json({error: "message not liked"}) 
      } 
      else {
        return db.doc(`/likes/${data.docs[0].id}`).delete()
          .then(() => {
            messageData.likeCount--;
            return messageDocument.update({likeCount: messageData.likeCount})
          })
          .then(() => {
            res.json(messageData);
          })
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error:err.code})
    })
}

exports.deleteMessage = (req, res) => {
  const document = db.doc(`/messages/${req.params.messageId}`);

  document.get()
    .then(doc => {
      if(!doc.exists){
        return res.status(400).json({error: 'message not found'});
      }
      if(doc.data().userHandle !== req.user.handle) {
        return res.status(400).json({error: 'Unauthorized'});
      } else {
        return document.delete()
      }
    })
    .then(() => {
      return res.json({message: "Message deleted successfully"})
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    })
}
