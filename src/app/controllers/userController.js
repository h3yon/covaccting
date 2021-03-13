const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const userDao = require("../dao/userDao");
const { constants } = require("buffer");
var moment = require("moment");

/**
 update : 2020.10.4
 01.signUp API = 회원가입
 */
exports.signUp = async function (req, res) {
  const {
    userEmail,
    userNickname,
    userPassword,
    userProfileImgLink,
  } = req.body;

  // 이메일 체크
  if (!userEmail)
    return res.json({
      isSuccess: false,
      code: 2003,
      message: "이메일을 입력해주세요",
    });
  if (userEmail.length > 30)
    return res.json({
      isSuccess: false,
      code: 2004,
      message: "이메일은 30자리 미만으로 입력해주세요",
    });
  // 이메일 중복 확인
  const emailCheckRows = await userDao.userEmailCheck(userEmail);
  if (emailCheckRows.length > 0) {
    return res.json({
      isSuccess: false,
      code: 2010,
      message: "중복된 이메일입니다.",
    });
  }

  if (!regexEmail.test(userEmail))
    return res.json({
      isSuccess: false,
      code: 2005,
      message: "이메일을 형식을 정확하게 입력해주세요",
    });

  if (!userPassword)
    return res.json({
      isSuccess: false,
      code: 2006,
      message: "비밀번호를 입력해주세요",
    });
  if (userPassword.length < 8 || userPassword.length > 20)
    return res.json({
      isSuccess: false,
      code: 2007,
      message: "비밀번호는 8~20자리를 입력해주세요",
    });
  var regexUserNickname = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|\*]+$/;
  if (!userNickname) {
    return res.json({
      isSuccess: false,
      code: 2011,
      message: "닉네임을 입력해주세요",
    });
  }
  if (!regexUserNickname.test(userNickname))
    return res.json({
      isSuccess: false,
      code: 2008,
      message: "닉네임은 한글/영문/숫자만 입력 가능합니다",
    });
  // 닉네임 중복 확인
  const nicknameRows = await userDao.userNicknameCheck(userNickname);
  if (nicknameRows.length > 0) {
    return res.json({
      isSuccess: false,
      code: 2009,
      message: "중복된 닉네임입니다.",
    });
  }
  var regexUrl = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}/;
  if (userProfileImgLink) {
    if (regexUrl.test(userProfileImgLink) == false) {
      return res.json({
        isSuccess: false,
        code: 2012,
        message: "프로필 이미지 링크가 올바른 링크 형식이 아닙니다",
      });
    }
  }

  const hashedPassword = await crypto
    .createHash("sha512")
    .update(userPassword)
    .digest("hex");
  const insertUserInfoParams = [
    userNickname,
    userEmail,
    hashedPassword,
    userProfileImgLink,
  ];

  const signUpFinished = await userDao.insertUserInfo(insertUserInfoParams);
  if (signUpFinished.isSuccess == false) return res.json(signUpFinished);

  const finalUserIdx = await userDao.userEmailCheck(userEmail);
  if (finalUserIdx.isSuccess == false) return res.json(finalUserIdx);
  console.log("finalUserIdx: ", finalUserIdx[0].userIdx);

  let token = await jwt.sign(
    {
      userIdx: finalUserIdx[0].userIdx,
      userEmail: userEmail,
      userPassword: hashedPassword,
    },
    secret_config.jwtsecret,
    { expiresIn: "365d", subject: "userInfo" }
  );
  const tokenInfo = await jwt.verify(token, secret_config.jwtsecret);
  console.log("tokenInfo: ", tokenInfo);

  // 토큰 생성
  return res.json({
    isSuccess: true,
    code: 1000,
    message: "회원가입 성공",
    userIdx: finalUserIdx[0].userIdx,
    jwt: token,
  });
};

exports.login = async function (req, res) {
  const { userEmail, userPassword } = req.body;
  try {
    // 이메일 체크
    if (!userEmail)
      return res.json({
        isSuccess: false,
        code: 2002,
        message: "이메일을 입력해주세요",
      });
    if (userEmail.length > 30)
      return res.json({
        isSuccess: false,
        code: 2003,
        message: "이메일은 30자리 미만으로 입력해주세요",
      });
    if (!regexEmail.test(userEmail))
      return res.json({
        isSuccess: false,
        code: 2004,
        message: "이메일 형식을 정확하게 입력해주세요",
      });
    if (!userPassword)
      return res.json({
        isSuccess: false,
        code: 2005,
        message: "비밀번호를 입력해주세요",
      });
    if (userPassword.length < 8 || userPassword.length > 20)
      return res.json({
        isSuccess: false,
        code: 2006,
        message: "비밀번호는 8~20자리를 입력해주세요",
      });

    const hashedPassword = await crypto
      .createHash("sha512")
      .update(userPassword)
      .digest("hex");

    const userEmailCheckComplete = await userDao.userEmailCheck(userEmail);
    if (userEmailCheckComplete.isSuccess == false)
      return userEmailCheckComplete;
    if (!userEmailCheckComplete || userEmailCheckComplete.length < 1)
      return res.json({
        isSuccess: false,
        code: 2001,
        message: "이메일을 확인해주세요",
      });

    // 로그인
    const loginComplete = await userDao.login(userEmail, hashedPassword);
    if (loginComplete.isSuccess == false) return loginComplete;

    if (loginComplete[0].userPassword !== hashedPassword) {
      return {
        isSuccess: false,
        code: 2008,
        message: "비밀번호를 확인해주세요",
      };
    }

    // 토큰 생성
    let token = await jwt.sign(
      {
        userIdx: loginComplete[0].userIdx,
        userEmail: userEmail,
        userPassword: hashedPassword,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀 키
      {
        expiresIn: "365d",
        subject: "userInfo",
      } // 유효 시간은 365일
    );

    // 토큰 정보
    const tokenInfo = await jwt.verify(token, secret_config.jwtsecret);
    console.log(tokenInfo);

    return res.json({
      isSuccess: true,
      code: 1000,
      message: "로그인 성공",
      userIdx: loginComplete[0].userIdx,
      jwt: token,
    });
  } catch (error) {
    return res.json({ isSuccess: false, code: 2000, message: "로그인 실패" });
  }
};

// 마이페이지 조회
exports.getmypage = async function (req, res) {
  try {
    var userIdx = req.verifiedToken.userIdx;

    const userRows = await userDao.getuser(userIdx);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "가입되어있지 않은 유저입니다.",
      });

    const getmypageRows = await userDao.getmypage(userIdx);

    if (getmypageRows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "마이페이지 조회 성공",
        result: getmypageRows,
      });
    } else
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "마이페이지 조회 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 프로필 관리 조회
exports.getprofile = async function (req, res) {
  try {
    var userIdx = req.verifiedToken.userIdx;

    const userRows = await userDao.getuser(userIdx);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "가입되어있지 않은 유저입니다.",
      });

    const getprofileRows = await userDao.getprofile(userIdx);

    if (getprofileRows.length > 0) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "프로필 관리 조회 성공",
        result: getprofileRows,
      });
    } else
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "프로필 관리 조회 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};

// 프로필 관리 수정
exports.patchprofile = async function (req, res) {
  try {
    var userIdx = req.verifiedToken.userIdx;

    var { userNickname, userEmail, userProfileImgLink } = req.body;

    const userRows = await userDao.getuser(userIdx);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "가입되어있지 않은 유저입니다.",
      });

    if (!userNickname) {
      return res.json({
        isSuccess: false,
        code: 2010,
        message: "닉네임을 입력해주세요.",
      });
    } else if (!userEmail) {
      return res.json({
        isSuccess: false,
        code: 2011,
        message: "이메일을 입력해주세요.",
      });
    }

    const patchprofileRows = await userDao.patchprofile(
      userIdx,
      userNickname,
      userEmail,
      userProfileImgLink
    );

    if (patchprofileRows.changedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "프로필 관리 수정 성공",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "프로필 관리 수정 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
// 내 접종기록 수정
exports.patchinoculation = async function (req, res) {
  try {
    var userIdx = req.verifiedToken.userIdx;

    var { userInoculation, userFirstDate, userSecondDate } = req.body;

    const userRows = await userDao.getuser(userIdx);
    if (userRows[0] === undefined)
      return res.json({
        isSuccess: false,
        code: 2100,
        message: "가입되어있지 않은 유저입니다.",
      });

    if (!userInoculation) {
      return res.json({
        isSuccess: false,
        code: 2020,
        message: "1차 접종일을 입력해주세요.",
      });
    } else if (!userFirstDate) {
      return res.json({
        isSuccess: false,
        code: 2021,
        message: "백신을 입력해주세요.",
      });
    }

    if (
      userInoculation !== "화이자" &&
      userInoculation !== "모더나" &&
      userInoculation !== "아스트라제네카" &&
      userInoculation !== "얀센"
    ) {
      return res.json({
        isSuccess: false,
        code: 2022,
        message: "백신종류를 정확하게 입력해주세요.",
      });
    }
    var userFirstDate1 = moment(userFirstDate, "YYYY.MM.DD");

    if (!userSecondDate) {
      if (userInoculation === "화이자") {
        userFirstDate1.add(21, "d");
        userSecondDate = userFirstDate1.format("YYYY-MM-DD");
      } else if (userInoculation === "모더나") {
        userFirstDate1.add(28, "d");
        userSecondDate = userFirstDate1.format("YYYY-MM-DD");
      } else if (userInoculation === "아스트라제네카") {
        userFirstDate1.add(56, "d");
        userSecondDate = userFirstDate1.format("YYYY-MM-DD");
      }
    }
    console.log(userSecondDate);

    const patchinoculationRows = await userDao.patchinoculation(
      userIdx,
      userInoculation,
      userFirstDate,
      userSecondDate
    );

    if (patchinoculationRows.changedRows === 1) {
      return res.json({
        isSuccess: true,
        code: 1000,
        message: "내 접종 수정 성공",
      });
    } else if (patchinoculationRows.changedRows === 0) {
      return res.json({
        isSuccess: true,
        code: 2001,
        message: "수정 내용을 입력해주세요.",
      });
    } else
      return res.json({
        isSuccess: false,
        code: 2000,
        message: "내 접종 수정 실패",
      });
  } catch (err) {
    logger.error(`App - SignUp Query error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
};
