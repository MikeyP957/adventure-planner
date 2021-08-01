const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");
const {getAllMessages, postOneMessage, getOneMessage} = require("./handlers/messages");
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require("./handlers/users");


// messages routes
app.get("/messages", getAllMessages);
// post one message
app.post("/messages", FBAuth, postOneMessage);
app.get('/messages/:messageId', getOneMessage)
//Todo:
//delete, like, unlike, comment on messages

// user routes
app.post("/signup", signup);
app.post("/login", login);
app.post('/user/image',FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails)
app.get('/user', FBAuth, getAuthenticatedUser)

//  https://baseurl.com/api/
exports.api = functions.https.onRequest(app);
