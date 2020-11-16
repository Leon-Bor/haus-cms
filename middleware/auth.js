module.exports = (req, res, next) => {
  try {
    console.log(req.headers.authorization);
    if (process.env.editKey === req.headers.authorization) {
      next();
    } else {
      if (req.headers.authorization) {
        res.status(401).json({
          message: 'Invalid editKey provided!',
        });
      } else {
        res.status(401).json({
          message: 'No editKey provided!',
        });
      }
    }
  } catch {
    res.status(401).json({
      message: 'Invalid request!',
    });
  }
};
