module.exports = function (app) {
  const review = require("../controllers/reviewController");
  const jwtMiddleware = require("../../../config/jwtMiddleware");

  //후기 작성
  app.post("/reviews", jwtMiddleware, review.addReview);
  //후기 조회
  app.get("/reviews", jwtMiddleware, review.getReview);
  //상세 후기 조회
  app.get("/reviews/:reviewIdx", jwtMiddleware, review.getDetailReview);
  //후기 수정
  app.patch("/reviews/:reviewIdx", jwtMiddleware, review.changeReview);
  //후기 삭제
  app.patch("/reviews/:reviewIdx/delete", jwtMiddleware, review.deleteReview);

  //좋아요 추가/취소
  app.post("/reviews/:reviewIdx/like", jwtMiddleware, review.likeReview);

  //내가 쓴 글 조회
  app.get("/users/my-review", jwtMiddleware, review.getMyReview);
};
