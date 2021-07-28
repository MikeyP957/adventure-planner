const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");
const {getAllMessages, postOneMessage} = require("./handlers/messages");
const {signup, login, uploadImage, addUserDetails} = require("./handlers/users");


// messages routes
app.get("/messages", getAllMessages);
// post one message
app.post("/messages", FBAuth, postOneMessage);
app.post('/user', FBAuth, addUserDetails)

// user routes
app.post("/signup", signup);
app.post("/login", login);
app.post('/user/image',FBAuth, uploadImage)


//  https://baseurl.com/api/
exports.api = functions.https.onRequest(app);
