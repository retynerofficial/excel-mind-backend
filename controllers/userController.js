exports.signUp = (req, res) => {
  const {
    email, password, firstname, lastname, role
  } = req.body;
  console.log(email, password, firstname, lastname, role);
  res.status(201).json({ response: "user credentials succesfully saved" });
};
