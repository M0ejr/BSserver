import jwt from 'jsonwebtoken';
import redis from 'redis';

// Setup Redis 
const redisClient = redis.createClient({
  url: process.env.REDIS_EXTERNAL_URL,
  legacyMode: true
});


redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error(`Error connecting to Redis: ${err}`);
  console.error(`REDIS_URL: ${process.env.REDIS_EXTERNAL_URL}`);
});



const signToken = (username) => {
  const jwtPayload = { username };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days'});
};

const setToken = (key, value) => Promise.resolve(redisClient.set(key, value));

const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: 'true', userId: id, token, user }
    })
    .catch(console.log);
};


const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("Wrong email or password!");
  }
  return db.select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => user[0])
          .catch((err) => res.status(400).json("Unable to get user"));
      } else {
        return Promise.reject("Wrong email or password");
      }
    })
    .catch((err) => err);
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send('Unauthorized')
    }
    return res.json({ id: reply });
  });
};



const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ? getAuthTokenId(req, res)
    : handleSignin(db, bcrypt, req, res)
    .then(data =>
      data.id && data.email ? createSession(data) : Promise.reject(data))
    .then(session => res.json(session))
    .catch(err => res.status(400).json(err));
}

export { handleSignin, signinAuthentication, redisClient };