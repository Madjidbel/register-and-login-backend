exports.authorization = (...authRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }
    if (!authRoles.includes(req.user.role)) {
      return res.status(403).send("Forbidden. You don't have permission.");
    }
    next();
  };
};
