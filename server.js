import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import knex from "knex";

import { handleRegister } from "./controllers/register.js";
import { signinAuthentication } from "./controllers/signin.js";
import { handleProfileGet, handleProfileUpdate } from "./controllers/profile.js";
import { handleApiCall, handleImage } from "./controllers/image.js";
import { requireAuth } from "./controllers/authorization.js";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  }
});

const whitelist = ['https://brain-scape.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("it's working");
});

app.post("/signin", signinAuthentication(db, bcrypt));

app.post("/register", (req, res) => {
  handleRegister(req, res, db, bcrypt);
});

app.get("/profile/:id", requireAuth, (req, res) => {
  handleProfileGet(req, res, db);
});

app.post('/profile/:id', requireAuth, (req, res) => {
  handleProfileUpdate(req, res, db);
});

app.put("/image", requireAuth, (req, res) => {
  handleImage(req, res, db);
});

app.post("/imageurl", requireAuth, (req, res) => {
  handleApiCall(req, res);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
