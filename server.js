const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require('path');

//middleware
app.use(express.urlencoded({ extended : true })) //parses incoming requests with urlencoded payloads and is based on body-parser
app.use(express.json())
app.use(express.static('public'))

//serve up static assets (i've done previously on heroku)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
}
//Add routes
app.use(routes)

//connect to DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/adventurers', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true, 
},
function(err){
    if(err) throw err;
    console.log('success')
});

app.listen(PORT, function() {
    console.log(`Listening on http://localhost:${PORT}/`)
});