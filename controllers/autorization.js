import { redisClient } from "./signin.js";

const requireAuth = (req, res, next) => {
   const { authorization } = req.headers;
   if (!authorization) {
     return res.status(401).json('Unauthorized');
   }
   return redisClient.get(authorization, (err, reply) => {
     if (err || !reply) {
       console.error('Error checking auth token in Redis:', err);
       return res.status(401).json('Unauthorized');
     }
     return next();
   });
 };
 

export { requireAuth };