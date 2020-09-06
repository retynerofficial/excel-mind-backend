/* eslint-disable linebreak-style */
exports.getEmail = async (req, res) => {
  const { email } = req.body;
  console.log(req.user);
  if (email) res.status(200).send(`${email}`);
};
