import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import knex from "knex";

import { handleRegister } from "./controllers/register.js";
import { signinAuthentication } from "./controllers/signin.js";
import { handleProfileGet, handleProfileUpdate } from "./controllers/profile.js";
import { handleApiCall, handleImage } from "./controllers/image.js";
import { requireAuth } from "./controllers/autorization.js";

import redis from 'redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  // ... other Redis options
});

const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URI
});

const app = express();

app.use(express.json());
app.use(cors());

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
app.post('/profile/:id', requireAuth, (req, res) => { handleProfileUpdate(req, res, db)})
app.put("/image", requireAuth, (req, res) => {
  handleImage(req, res, db);
});
app.post("/imageurl", requireAuth, (req, res) => {
  handleApiCall(req, res);
});



app.listen(3000, () => {
  console.log(`App is running on port 3000`);
});
