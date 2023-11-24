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
const express = require("express");
require("isomorphic-fetch");

// Define MODEL_ID as a constant
const MODEL_ID = "face-detection";

// Create an Express application
const app = express();
app.use(express.json());

// Your Clarifai API key
const PAT = "1688182ed34d4c109fd1258085461dbe";

// Function to return Clarifai request options
const returnClarifaiRequestOptions = (imageUrl) => {
  const USER_ID = "moejr";
  const APP_ID = "smartbrain";
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
      "Content-Type": "application/json",
    },
    body: raw,
  };

  return requestOptions;
};

// Route to handle Clarifai API call
const handleApiCall = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      throw new Error("Input URL is required");
    }

    const clarifaiOptions = returnClarifaiRequestOptions(input);

    const response = await fetch(
      `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/latest/outputs`,
      clarifaiOptions
    );

    if (!response.ok) {
      const errorMessage = `Clarifai API request failed: ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Clarifai API response:", data);
    res.json(data);
  } catch (error) {
    console.error("Error in handleApiCall:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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

module.exports = {
  handleApiCall,
  handleImage,
};
