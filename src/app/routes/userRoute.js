module.exports = function (app) {
  const user = require("../controllers/userController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  // app.route('/app/signUp').post(user.signUp);
  // app.route('/app/signIn').post(user.signIn);

  app.post("/users/login", user.login);
  app.post("/users/signup", user.signUp);

  //마이페이지 조회
  app.get("/users/my-page", jwtMiddleware, user.getmypage);
  //프로필 관리 조회
  app.get("/users", jwtMiddleware, user.getprofile);
  //프로필 관리 수정
  app.patch("/users", jwtMiddleware, user.patchprofile);
  //내 접종기록 수정
  app.patch("/users/inoculation", jwtMiddleware, user.patchinoculation);
  //   app.get("/check", jwtMiddleware, user.check);
};
