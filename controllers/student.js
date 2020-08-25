/* eslint-disable linebreak-style */
exports.getEmail = (req, res) => {
  const { email } = req.body;
  if (email) res.status(200).send(`${email}`);
};
