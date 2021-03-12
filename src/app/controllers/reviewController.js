const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const reviewDao = require("../dao/reviewDao");
const { constants } = require("buffer");

exports.addReview = async function (req, res) {
  const token = req.verifiedToken;
  const { reviewName, reviewContent, vaccineName } = req.body;

  if (!reviewName) {
    return res.json({
      isSuccess: false,
      code: 2001,
      message: "후기 제목을 입력해주세요",
    });
  }
  if (!reviewContent) {
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "후기 내용을 입력해주세요",
    });
  }
  if (!vaccineName) {
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "사용한 백신을 알려주세요",
    });
  }

  try {
    const userCheckResult = await reviewDao.userCheck(token.userIdx);
    if (userCheckResult.isSuccess == false) return userCheckResult;
    if (!userCheckResult || userCheckResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "탈퇴하거나 비활성화된 유저입니다",
      });

    const addReviewResult = await reviewDao.insertReview(
      token.userIdx,
      reviewName,
      reviewContent,
      vaccineName
    );
    if (addReviewResult.isSuccess == false) return addReviewResult;
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "후기 작성 성공",
    });
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "후기 작성 실패",
    });
  }
};
