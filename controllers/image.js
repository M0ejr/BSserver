const returnClarifaiRequestOptions = (imageUrl) => {
  const PAT = '1688182ed34d4c109fd1258085461dbe';
  const USER_ID = "moejr";
  const APP_ID = "smartbrain";
  // eslint-disable-next-line
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
    },
    body: raw,
  };

  return requestOptions;
};

const handleApiCall = (req, res) => {
  Promise.resolve(returnClarifaiRequestOptions(req.body.input))
    .then(data => {
      fetch("https://api.clarifai.com/v2/models/" + "face-detection" + "/outputs", data)
        .then(response => response.json())
        .then(data => {
          res.json(data);
        })
        .catch(err => res.status(400).json('unable to work with API'));
    })
    .catch(err => res.status(400).json('unable to work with API'));
}
// const Clarifai = require("clarifai");

//You must add your own API key here from Clarifai.
// const app = new Clarifai.App({
//   apiKey: "0905a39bff8a4195ac4acb14466ae57b",
// });

// const handleApiCall = (req, res) => {
//   // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
//   // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
//   // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
//   // If that isn't working, then that means you will have to wait until their servers are back up.

//   app.models
//     .predict("face-detection", req.body.input)
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => res.status(400).json("unable to work with API"));
// };

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
      // entries[0] --> this used to return the entries
      // TO
      // entries[0].entries --> this now returns the entries
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("unable to get entries"));
};

module.exports = {
  handleImage,
  handleApiCall,
};
