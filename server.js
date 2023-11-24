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
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    host: process.env.DATABASE_HOST,
    port: 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_DB,
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
app.post("/imageurl", (req, res) => { image.handleApiCall(req, res)});


app.listen(5000, () => {
  console.log("app is running on port 5000");
});
