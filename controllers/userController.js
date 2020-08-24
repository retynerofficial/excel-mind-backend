exports.signUp = (req, res) => {
  const {
    email, password, name, role
  } = req.body;
  console.log(email, password, name, role);
  res.status(201).json({ response: "user credentials succesfully saved" });
};
