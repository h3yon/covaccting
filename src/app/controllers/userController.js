const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const jwt = require("jsonwebtoken");
const regexEmail = require("regex-email");
const crypto = require("crypto");
const secret_config = require("../../../config/secret");

const userDao = require("../dao/userDao");
const { constants } = require("buffer");

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
