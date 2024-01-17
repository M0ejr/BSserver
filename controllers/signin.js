import jwt from 'jsonwebtoken';
import redis from 'redis';

// setup Redis 
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'bsserver_redis_1',
  port: process.env.REDIS_PORT || 6379,
});

// Handle cleanup on exit
const cleanup = () => {
  redisClient.quit();
  process.exit();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  cleanup();
});

// Handle process exit and termination signals
['exit', 'SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, cleanup);
});


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
          .catch((err) => Promise.reject("unable to get user"));
      } else {
        Promise.reject("Wrong email or password");
      }
    })
    .catch((err) => Promise.reject("Wrong email or password"));
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      console.error('Error getting auth token:', err);
      return res.status(400).json('Unauthorized');
    }
    return res.json({ id: reply });
  });
};


const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days'});
}

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value, 'EX', 60 * 60 * 24 * 2)); // Expires in 2 days
};


const createSessions = (user) => {
  // JWT token, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
  .then(() => {
    return { success: 'true', userId: id, token }
  })
  .catch(console.log)
}

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ? getAuthTokenId(req, res) : 
    handleSignin(db, bcrypt, req, res)
      .then(data => {
        return data.id && data.email ? createSessions(data) : Promise.reject(data)
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err));
}

export { handleSignin, signinAuthentication, redisClient };
