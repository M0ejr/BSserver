const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("Make sure everything is correct");
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.error("Error hashing the password:", err);
        return res.status(500).json("Error hashing the password");
      }

      db.transaction((trx) => {
        trx
          .insert({
            hash: hash,
            email: email,
          })
          .into("login")
          .returning("email")
          .then((loginEmail) => {
            return trx("users")
              .returning("*")
              .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date(),
              })
              .then((user) => {
                res.json(user[0]);
              });
          })
          .then(trx.commit)
          .catch((error) => {
            console.error("Transaction error:", error);
            trx.rollback();
            res.status(400).json("Unable to register");
          });
      }).catch((error) => {
        console.error("Database transaction error:", error);
        res.status(400).json("Unable to register");
      });
    });
  });
};

export { handleRegister };
