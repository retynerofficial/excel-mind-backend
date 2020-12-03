const paginatedResults = (model) => async (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  console.log(page, limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  console.log(startIndex, endIndex);

  const results = {};

  if (endIndex < await model.countDocuments().exec()) {
    results.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit
    };
  }
  try {
    results.results = await model.find().limit(limit).skip(startIndex).exec();
    res.paginatedResults = results;
    console.log(res.paginatedResults);

    next();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = paginatedResults;
