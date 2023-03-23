const jwt = require("jsonwebtoken");
const passwordJwt = require("../services/passwordJwt");

const verifyAuthentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Não autorizado!" });
  }

  const token = authorization.split(" ")[1];

  try {
    const tokenUser = jwt.verify(token, passwordJwt);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Não autorizado!" });
  }
};

module.exports = verifyAuthentication;
