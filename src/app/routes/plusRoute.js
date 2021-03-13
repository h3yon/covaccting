module.exports = function (app) {
  const plus = require("../controllers/plusController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //접종 기록 조회
  app.get("/users/inoculation", jwtMiddleware, plus.getInoculation);
};
