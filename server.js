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
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

const db = knex({
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST || 'dpg-cmjvnv6n7f5s73cg7mig-a',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.POSTGRES_USERNAME || 'bs_database_user',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB || 'bs_database',
  }
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
