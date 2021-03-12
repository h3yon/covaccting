const { pool } = require("../../../config/database");

// Signup
async function userEmailCheck(userEmail) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectEmailQuery = `
        select userIdx from User where userEmail = ? and status = 1;
                  `;
    const selectEmailParams = [userEmail];
    const [emailRows] = await connection.query(
      selectEmailQuery,
      selectEmailParams
    );
    connection.release();
    return emailRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "userEmailCheck query error",
    });
  }
}

async function userNicknameCheck(userNickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectNicknameQuery = `
                  SELECT userNickname FROM User 
                  WHERE userNickname = ?;
                  `;
    const selectNicknameParams = [userNickname];
    const [nicknameRows] = await connection.query(
      selectNicknameQuery,
      selectNicknameParams
    );
    connection.release();
    return nicknameRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "userNicknameCheck query error",
    });
  }
}

async function insertUserInfo(insertUserInfoParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertUserInfoQuery = `
      insert User(userNickname, userEmail, userPassword, userProfileImgLink) VALUES (?, ?, ?, ?);
      `;
    const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertUserInfoParams
    );
    connection.release();
    return insertUserInfoRow;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "insertUserInfo query error",
    });
  }
}

//SignIn
async function login(userEmail, hashedPassword) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const loginQuery = ` 
            SELECT userIdx, userEmail, userPassword FROM User 
            WHERE userEmail = ? and userPassword = ? and status = 1`;
    let loginParams = [userEmail, hashedPassword];
    const [userInfoRows] = await connection.query(loginQuery, loginParams);
    if (userInfoRows.length < 1) {
      connection.release();
      return {
        isSuccess: false,
        code: 2007,
        message: "존재하지 않는 이메일이거나 탈퇴된 회원입니다",
      };
    }
    if (userInfoRows[0].userPassword !== hashedPassword) {
      connection.release();
      return {
        isSuccess: false,
        code: 2008,
        message: "비밀번호를 확인해주세요",
      };
    } else {
      return userInfoRows;
    }
  } catch (err) {
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "login Query error",
    };
  }
}

module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  login,
};
