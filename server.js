const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const knex = require("knex");

// controllers files 
const signin = require("./controllers/signin");
const register = require("./controllers/register");
const profile = require("./controllers/profile");
const image = require("./controllers/image");


const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "Ltable",
    database: "brain-scape",
  },
});

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res)=> { res.send(db.users) })
app.post("/signin", signin.handleSignin(db, bcrypt));
app.post('/register', register.handleRegister(db, bcrypt))    
app.get("/profile/:id", profile.handleProfileGet(db));
app.put("/image", image.handleImage(db));
app.put("/imageurl", (req, res) => { image.handleApiCall(req, res)});


app.listen(5000, () => {
  console.log("app is running on port 5000");
});
