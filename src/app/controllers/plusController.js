const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const secret_config = require("../../../config/secret");

const plusDao = require("../dao/plusDao");
const { constants } = require("buffer");

exports.getInoculation = async function (req, res) {
  const token = req.verifiedToken;

  try {
    const userCheckResult = await plusDao.userCheck(token.userIdx);
    if (userCheckResult.isSuccess == false) return userCheckResult;
    if (!userCheckResult || userCheckResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "탈퇴하거나 비활성화된 유저입니다",
      });

    const getInoculationResult = await plusDao.getInoculation(token.userIdx);
    if (getInoculationResult.isSuccess == false) return getInoculationResult;
    if (!getInoculationResult || getInoculationResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2001,
        userIdx: token.userIdx,
        message: "접종 기록이 없습니다",
      });
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "접종 기록 조회 성공",
      result: getInoculationResult,
    });
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "접종 기록 조회 실패",
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

exports.changeReview = async function (req, res) {
  const token = req.verifiedToken;
  const reviewIdx = req.params.reviewIdx;
  const { reviewContent, vaccineName } = req.body;

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
    const checkReviewResult = await reviewDao.checkReview(reviewIdx);
    if (checkReviewResult.isSuccess == false) return checkReviewResult;
    if (!checkReviewResult || checkReviewResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "리뷰가 존재하지 않습니다",
      });
    if (checkReviewResult[0].userIdx != token.userIdx) {
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "권한이 없습니다",
      });
    }
    const updateReviewResult = await reviewDao.updateReview(
      reviewContent,
      vaccineName,
      reviewIdx
    );
    if (updateReviewResult.isSuccess == false) return updateReviewResult;
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "리뷰 수정 성공",
    });
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "리뷰 수정 실패",
    });
  }
};

exports.deleteReview = async function (req, res) {
  const token = req.verifiedToken;
  const reviewIdx = req.params.reviewIdx;

  if (!reviewIdx)
    return res.json({
      isSuccess: false,
      code: 2002,
      message: "후기 인덱스를 입력해주세요",
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
    const checkReviewResult = await reviewDao.checkReview(reviewIdx);
    if (checkReviewResult.isSuccess == false) return checkReviewResult;
    if (!checkReviewResult || checkReviewResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "리뷰가 존재하지 않습니다",
      });
    if (checkReviewResult[0].userIdx != token.userIdx) {
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "권한이 없습니다",
      });
    }
    const deleteReviewResult = await reviewDao.deleteReview(reviewIdx);
    if (deleteReviewResult.isSuccess == false) return deleteReviewResult;
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "후기 삭제 성공",
    });
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "후기 삭제 실패",
    });
  }
};

exports.getMyReview = async function (req, res) {
  const token = req.verifiedToken;

  try {
    const userCheckResult = await reviewDao.userCheck(token.userIdx);
    if (userCheckResult.isSuccess == false) return userCheckResult;
    if (!userCheckResult || userCheckResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "탈퇴하거나 비활성화된 유저입니다",
      });
    const getMyReviewResult = await reviewDao.selectMyReview(token.userIdx);
    if (getMyReviewResult.isSuccess == false) return getMyReviewResult;
    if (!getMyReviewResult || getMyReviewResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "작성한 후기가 없습니다",
      });
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "작성한 후기 조회 성공",
      result: getMyReviewResult,
    });
  } catch (error) {
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "작성한 후기 조회 실패",
    });
  }
};

exports.likeReview = async function (req, res) {
  const token = req.verifiedToken;
  const reviewIdx = req.params.reviewIdx;

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
    const checkReviewResult = await reviewDao.checkReview(reviewIdx);
    if (checkReviewResult.isSuccess == false) return checkReviewResult;
    if (!checkReviewResult || checkReviewResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "리뷰가 존재하지 않습니다",
      });

    checkLikeResult = await reviewDao.checkLike(token.userIdx, reviewIdx);
    if (checkLikeResult.isSuccess == false) return checkLikeResult;

    console.log("checkLikeResult", checkLikeResult);

    if (!checkLikeResult || checkLikeResult.length < 1) {
      //정보 없을 때 추가
      const likeResult = await reviewDao.likeReview(
        token.userIdx,
        reviewIdx,
        1,
        0
      );
      if (likeResult.isSuccess == false) return res.json(likeResult);

      const countLikeResult = await reviewDao.countLike(reviewIdx);
      if (countLikeResult.isSuccess == false) return res.json(countLikeResult);
      console.log(countLikeResult);
      var likeMessage = "좋아요 추가";

      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "좋아요 추가/취소 성공",
        likeMessage: likeMessage,
        likeCount: countLikeResult[0].likeCount,
      });
    }
    if (checkLikeResult[0].status == 1) {
      //like 취소할 때: 정보가 없을 때, 1일 때
      const likeResult = await reviewDao.likeReview(
        token.userIdx,
        reviewIdx,
        1,
        0
      );
      if (likeResult.isSuccess == false) return res.json(likeResult);

      const countLikeResult = await reviewDao.countLike(reviewIdx);
      if (countLikeResult.isSuccess == false) return res.json(countLikeResult);
      var likeMessage = "좋아요 취소";

      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "좋아요 추가/취소 성공",
        likeMessage: likeMessage,
        likeCount: countLikeResult[0].likeCount,
      });
    } else {
      //like 추가할 때: 정보가 없을 때, 0일 때
      const likeResult = await reviewDao.likeReview(
        token.userIdx,
        reviewIdx,
        0,
        1
      );
      if (likeResult.isSuccess == false) return res.json(likeResult);

      const countLikeResult = await reviewDao.countLike(reviewIdx);
      if (countLikeResult.isSuccess == false) return res.json(countLikeResult);
      console.log(countLikeResult);
      var likeMessage = "좋아요 추가";

      return res.json({
        isSuccess: true,
        code: 1000,
        userIdx: token.userIdx,
        message: "좋아요 추가/취소 성공",
        likeMessage: likeMessage,
        likeCount: countLikeResult[0].likeCount,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "좋아요 추가/취소 실패",
    });
  }
};

exports.getMyLikeReview = async function (req, res) {
  const token = req.verifiedToken;

  try {
    const userCheckResult = await reviewDao.userCheck(token.userIdx);
    if (userCheckResult.isSuccess == false) return userCheckResult;
    if (!userCheckResult || userCheckResult.length < 1)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "탈퇴하거나 비활성화된 유저입니다",
      });
    const getMyLikeReviewResult = await reviewDao.selectMyLikeReview(
      token.userIdx
    );
    if (getMyLikeReviewResult.isSuccess == false) return getMyLikeReviewResult;
    if (!getMyLikeReviewResult || getMyLikeReviewResult.length < 1) {
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "좋아요한 후기가 없습니다",
      });
    }
    return res.json({
      isSuccess: true,
      code: 1000,
      userIdx: token.userIdx,
      message: "좋아요한 후기 조회 성공",
      result: getMyLikeReviewResult,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      isSuccess: false,
      code: 2000,
      userIdx: token.userIdx,
      message: "좋아요한 후기 조회 실패",
    });
  }
};
