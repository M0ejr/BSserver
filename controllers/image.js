// const returnClarifaiRequestOptions = (imageUrl) => {
//   const PAT = '1688182ed34d4c109fd1258085461dbe';
//   const USER_ID = "moejr";
//   const APP_ID = "smartbrain";
//   // eslint-disable-next-line
//   const MODEL_ID = "face-detection";
//   const IMAGE_URL = imageUrl;

//   const raw = JSON.stringify({
//     user_app_id: {
//       user_id: USER_ID,
//       app_id: APP_ID,
//     },
//     inputs: [
//       {
//         data: {
//           image: {
//             url: IMAGE_URL,
//           },
//         },
//       },
//     ],
//   });

//   const requestOptions = {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       Authorization: "Key " + PAT,
//     },
//     body: raw,
//   };

//   return requestOptions;
// };

// const handleApiCall = (req, res) => {
//   Promise.resolve(returnClarifaiRequestOptions(req.body.input))
//     .then(data => {
//       fetch("https://api.clarifai.com/v2/models/" + "face-detection" + "/outputs", data)
//         .then(response => response.json())
//         .then(data => {
//           res.json(data);
//         })
//         .catch(err => res.status(400).json('unable to work with API'));
//     })
//     .catch(err => res.status(400).json('unable to work with API'));
// }

// const handleImage = (req, res, db) => {
//   const { id } = req.body;
//   db("users")
//     .where("id", "=", id)
//     .increment("entries", 1)
//     .returning("entries")
//     .then((entries) => {
//       res.json(entries[0].entries);
//     })
//     .catch((err) => res.status(400).json("unable to get entries"));
// };

// module.exports = {
//   handleImage,
//   handleApiCall,
// };


// Import necessary modules
const express = require('express');
require('isomorphic-fetch');


// Create an Express application
const app = express();
app.use(express.json());

// Your Clarifai API key
const PAT = '1688182ed34d4c109fd1258085461dbe';

// Function to return Clarifai request options
const returnClarifaiRequestOptions = (imageUrl) => {
  const USER_ID = "moejr";
  const APP_ID = "smartbrain";
  const MODEL_ID = "face-detection";
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: "Key " + PAT,
      'Content-Type': 'application/json',
    },
    body: raw,
  };

  return requestOptions;
};

// Route to handle Clarifai API call
app.post('/api/call-clarifai', (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json('Input URL is required');
  }

  const clarifaiOptions = returnClarifaiRequestOptions(input);

  fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/versions/latest/outputs`, clarifaiOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Clarifai API response:', data);
      res.json(data);
    })
    .catch(err => {
      console.error('Fetch error:', err);
      res.status(400).json('Unable to work with Clarifai API');
    });
});

// Your handleImage function
const handleImage = (req, res, db) => {
    const { id } = req.body;
    db("users")
      .where("id", "=", id)
      .increment("entries", 1)
      .returning("entries")
      .then((entries) => {
        res.json(entries[0].entries);
      })
      .catch((err) => res.status(400).json("unable to get entries"));
  };
