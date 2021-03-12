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
  const { reviewContent, vaccineName } = req.body;

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

exports.getReview = async function (req, res) {
  const token = req.verifiedToken;
  var { standard, vaccineName1, vaccineName2, vaccineName3 } = req.query;
  //stardard 1: 실시간순, 2: 좋아요순

  if (vaccineName1) {
    if (vaccineName2) {
      if (!vaccineName3) vaccineName3 = "";
    } else {
      vaccineName2 = "";
      vaccineName3 = "";
    }
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
    if (standard) {
      if (standard != 1 && standard != 2)
        return res.json({
          isSuccess: false,
          code: 2002,
          message:
            "정렬기준을 null, 1(실시간순), 2(좋아요순) 중에서 하나로 주세요. null일 경우 1로 간주됩니다",
        });
    }

    if (standard == 2) {
      const selectReviewLikeResult = await reviewDao.selectReviewLike(
        token.userIdx,
        vaccineName1,
        vaccineName2,
        vaccineName3
      );
      if (selectReviewLikeResult.isSuccess == false)
        return selectReviewLikeResult;
      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "좋아요순 후기 조회 성공",
        result: selectReviewLikeResult,
      });
    } else {
      const selectReviewCreateResult = await reviewDao.selectReviewCreate(
        token.userIdx,
        vaccineName1,
        vaccineName2,
        vaccineName3
      );
      console.log(token.userIdx, vaccineName1, vaccineName2, vaccineName3);
      if (selectReviewCreateResult.isSuccess == false)
        return selectReviewCreateResult;
      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "실시간순 리뷰 조회 성공",
        result: selectReviewCreateResult,
      });
    }
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "후기 조회 실패",
    });
  }
};

exports.getDetailReview = async function (req, res) {
  const token = req.verifiedToken;
  const reviewIdx = req.params.reviewIdx;

  console.log(token.userIdx, reviewIdx);
  if (!reviewIdx)
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "리뷰 인덱스를 입력해주세요",
    });

  try {
    const userCheckResult = await reviewDao.userCheck(token.userIdx);
    if (userCheckResult.isSuccess == false) return userCheckResult;
    if (!userCheckResult || userCheckResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "탈퇴하거나 비활성화된 유저입니다",
      });
    const selectDetailReviewResult = await reviewDao.selectDetailReview(
      token.userIdx,
      reviewIdx
    );
    if (selectDetailReviewResult.isSuccess == false)
      return selectDetailReviewResult;
    if (!selectDetailReviewResult || selectDetailReviewResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "존재하지 않는 리뷰입니다",
      });
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "리뷰 상세 조회 성공",
      result: selectDetailReviewResult,
    });
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "리뷰 상세 조회 실패",
    });
  }
};
