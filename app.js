// Clinton Sheppard - csheppard4@myseneca.ca - WEB322 Assignment 3 ? 4? 5? maybe all ?
const express = require("express");
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const controllerG = require("./controllers/general.js");
const db = require('./db.js');
require('dotenv').config({path:"./config/keys.env"});
const PORT = process.env.PORT;
const app = express();
var hbs = require('express-handlebars').create({
  defaultLayout: 'main',
  partialsDir: [
      'views/partials/',
      'views/fsPartials/'
      ]
  });

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", controllerG);

/* -------- server online! -------- */

db.initialize()
.then(()=>{
  app.listen(PORT, ()=>{
  console.log(`server online! PORT: ${PORT}`);
  });
})
.catch((data)=>{
  console.log(data);
});
