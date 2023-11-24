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
  handleImage,
  handleApiCall,
};
