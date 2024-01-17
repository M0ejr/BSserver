import jwt from 'jsonwebtoken';
import redis from 'redis';

// Setup Redis 
const createRedisClient = () => {
  return redis.createClient({
    host: process.env.REDIS_HOST || 'bsserver_redis_1',
    port: process.env.REDIS_PORT || 6379,
  });
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
          .catch((err) => Promise.reject("Unable to get user"));
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
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' });
};

const setToken = (redisClient, key, value) => {
  return new Promise((resolve, reject) => {
    redisClient.set(key, value, 'EX', 60 * 60 * 24 * 2, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

const createSessions = (user, redisClient) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(redisClient, token, id)
    .then(() => {
      return { success: 'true', userId: id, token };
    })
    .catch(console.log);
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const redisClient = createRedisClient();

  const { authorization } = req.headers;
  return authorization ? getAuthTokenId(req, res, redisClient) :
    handleSignin(db, bcrypt, req, res)
      .then(data => {
        return data.id && data.email ? createSessions(data, redisClient) : Promise.reject(data);
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err))
      .finally(() => {
        // Close the Redis client after use
        redisClient.quit();
      });
};

export { handleSignin, signinAuthentication, createRedisClient };