const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");
const {getAllMessages, postOneMessage, getOneMessage, commentOnMessage, likeMessage, unlikeMessage} = require("./handlers/messages");
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require("./handlers/users");


// messages routes
app.get("/messages", getAllMessages);
app.get('/messages/:messagesId', getOneMessage)
// like
app.get('/messages/:messageId/like', FBAuth, likeMessage)
app.get('/messages/:messageId/unlike', FBAuth, unlikeMessage)
// post messages
app.post("/messages", FBAuth, postOneMessage);
// comment on message
app.post(`/messages/:messagesId/comment`, FBAuth, commentOnMessage)
//delete

// user routes
app.get('/user', FBAuth, getAuthenticatedUser)
app.post("/signup", signup);
app.post("/login", login);
app.post('/user/image',FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)

// activity routes
    // training
    // outdoor
// 

//  https://baseurl.com/api/
exports.api = functions.https.onRequest(app);
