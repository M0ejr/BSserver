// import { redisClient } from "./signin.js";

// const requireAuth = (req, res, next) => {
//    const { authorization } = req.headers;
//    if (!authorization) {
//      return res.status(401).json('Unauthorized');
//    }
//    return redisClient.get(authorization, (err, reply) => {
//      if (err || !reply) {
//        console.error('Error checking auth token in Redis:', err);
//        return res.status(401).json('Unauthorized');
//      }
//      return next();
//    });
//  };
 

// export { requireAuth };

import { createRedisClient } from "./signin.js";

const requireAuth = (req, res, next) => {
   const { authorization } = req.headers;
   if (!authorization) {
     return res.status(401).json('Unauthorized');
   }

   const redisClient = createRedisClient();

   return redisClient.get(authorization, (err, reply) => {
     if (err || !reply) {
       console.error('Error checking auth token in Redis:', err);
       redisClient.quit(); // Close the Redis client in case of an error
       return res.status(401).json('Unauthorized');
     }

     // Continue to the next middleware
     next();

     // Close the Redis client after use
     redisClient.quit();
   });
};
 
export { requireAuth };
