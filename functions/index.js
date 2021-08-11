const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");
const {
  getAllMessages,
  postOneMessage,
  getOneMessage,
  commentOnMessage,
  likeMessage,
  unlikeMessage,
  deleteMessage,
} = require("./handlers/messages");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

const {db} = require("./util/admin");

// messages routes
app.get("/messages", getAllMessages);
app.get("/messages/:messagesId", getOneMessage);
// like
app.get("/messages/:messageId/like", FBAuth, likeMessage);
app.get("/messages/:messageId/unlike", FBAuth, unlikeMessage);
// post messages
app.post("/messages", FBAuth, postOneMessage);
// comment on message
app.post("/messages/:messagesId/comment", FBAuth, commentOnMessage);
// delete
app.delete("/messages/:messageId", FBAuth, deleteMessage);

// user routes
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);

// activity routes
// training
// outdoor
//

//  https://baseurl.com/api/
exports.api = functions.https.onRequest(app);

exports.createNotificationsOnLike = functions.firestore.document("/likes/{id}")
    .onCreate((snapShot) => {
      db.doc(`/messages/${snapShot.data().messageId}`).get()
          .then((doc) => {
            if (doc.exists) {
              return db.doc(`/notifications/${snapShot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapShot.data().userHandle,
                type: "like",
                read: false,
                messageId: doc.id,
              });
            }
          })
          .then(() => {
            return;
          })
          .catch((err) => {
            console.error(err);
            return;
          });
    });

exports.deleteNotificationOnUnlike = functions
    .firestore
    .document("likes/{id}")
    .onDelete((snapShot) => {
      db.doc(`/notifications/${snapShot.id}`)
          .delete()
          .then(() => {
            return;
          })
          .catch((err) => {
            console.error(err);
          });
    });


exports.createNotificationsOnComment = functions.firestore
    .document("/comments/{id}")
    .onCreate((snapShot) => {
      db.doc(`/messages/${snapShot.data().messageId}`).get()
          .then((doc) => {
            if (doc.exists) {
              return db.doc(`/notifications/${snapShot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapShot.data().userHandle,
                type: "comment",
                read: false,
                messageId: doc.id,
              });
            }
          })
          .then(() => {
            return;
          })
          .catch((err) => {
            console.error(err);
            return;
          });
    });
