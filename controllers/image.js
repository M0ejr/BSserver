const returnClarifaiRequestOptions = (imageUrl) => {
  const PAT = "1688182ed34d4c109fd1258085461dbe";
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
  const clarifaiOptions = returnClarifaiRequestOptions(req.body.input);

  fetch("https://api.clarifai.com/v2/models/face-detection/outputs", clarifaiOptions)
    .then((response) => {
      console.log('Clarifai API Response Status:', response.status);
      // Print response body for additional details
      return response.text();
    })
    .then((data) => {
      console.log('Clarifai API Response Data:', data);
      // Attempt to parse response body as JSON
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseError) {
        // If parsing fails, send raw response text
        res.status(400).send(data);
      }
    })
    .catch((err) => {
      console.error('Error in handleApiCall:', err);
      res.status(400).json('Unable to work with API');
    });
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
