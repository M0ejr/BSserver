const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const knex = require("knex");
const bodyParser = require("body-parser");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const { handleApiCall, handleImage } = require("./controllers/image");

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

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(db.users);
});
app.post("/signin", signin.handleSignin(db, bcrypt));
app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});
app.get("/profile/:id", (req, res) => {
  profile.handleProfileGet(req, res, db);
});
app.put("/image", (req, res) => {
  handleImage(req, res, db);
});
app.post("/imageurl", (req, res) => {
  handleApiCall(req, res);
});

app.listen(5000, () => {
  console.log("app is running on port 5000");
});