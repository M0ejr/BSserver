import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import knex from "knex";

import { handleRegister } from "./controllers/register.js";
import { handleSignin } from "./controllers/signin.js";
import { handleProfileGet } from "./controllers/profile.js";
import { handleApiCall, handleImage } from "./controllers/image.js";

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

const corsOptions = {
  origin: "https://brainscape-o01p.onrender.com", // Replace with your Render URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.send(db.users);
});
app.post("/signin", handleSignin(db, bcrypt));
app.post("/register", (req, res) => {
  handleRegister(req, res, db, bcrypt);
});
app.get("/profile/:id", (req, res) => {
  handleProfileGet(req, res, db);
});
app.put("/image", (req, res) => {
  handleImage(req, res, db);
});
app.post("/imageurl", (req, res) => {
  handleApiCall(req, res);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
