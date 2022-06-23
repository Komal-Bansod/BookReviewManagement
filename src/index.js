const express = require('express');
var bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose = require('mongoose')

const app = express();        
const multer = require("multer")

const app = express();
app.use(multer().any())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect("mongodb+srv://komalbansod_04:BdcyrSiZZa4v5y76@komal04.fvnel.mongodb.net/group4Database?retryWrites=true&w=majority", {useNewUrlParser: true})
    .then(() => console.log('MongoDb Connected'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});
