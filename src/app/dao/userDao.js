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
    return userInfoRows;
  } catch (err) {
    connection.release();
    return {
      isSuccess: false,
      code: 4000,
      message: "login Query error",
    };
  }
}

// ????????? ?????? ??????????????? ??????
async function getuser(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getuserQuery = `
  select *
from User
where userIdx = ${userIdx};
`;

  const [getuserRows] = await connection.query(getuserQuery);
  connection.release();

  return getuserRows;
}

// ????????? ?????? ??????????????? ??????
async function getmypage(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getmypageQuery = `
  select userIdx,
  userNickname,
  DATE_FORMAT(userFirstDate, '%Y-%m-%d') as userFirstDate,
  DATE_FORMAT(userSecondDate, '%Y-%m-%d') as userSecondDate,
  TO_DAYS(userSecondDate) - TO_DAYS(curdate()) as userSecondDday
from User
where userIdx = ${userIdx};
`;

  const [Rows] = await connection.query(getmypageQuery);
  connection.release();

  return Rows;
}

// ????????? ?????? ??????
async function getprofile(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getmypageQuery = `
  select userNickname, userEmail, userProfileImgLink
from User
where userIdx = ${userIdx};
`;

  const [Rows] = await connection.query(getmypageQuery);
  connection.release();

  return Rows;
}

// ????????? ?????? ??????
async function patchprofile(
  userIdx,
  userNickname,
  userEmail,
  userProfileImgLink
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getmypageQuery = `
  update User
  set userNickname = '${userNickname}', userEmail = '${userEmail}', userProfileImgLink = '${userProfileImgLink}'
  where userIdx = ${userIdx};
`;

  const [Rows] = await connection.query(getmypageQuery);
  connection.release();

  return Rows;
}
// ??? ???????????? ??????
async function patchinoculation(
  userIdx,
  userInoculation,
  userFirstDate,
  userSecondDate
) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getmypageQuery = `
  update User
  set userInoculation = '${userInoculation}', userFirstDate = '${userFirstDate}', userSecondDate = '${userSecondDate}'
  where userIdx = ${userIdx};
`;

  const [Rows] = await connection.query(getmypageQuery);
  connection.release();

  return Rows;
}
// ?????? ??? ?????? ??????
async function getmycomment(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getmycommentQuery = `
  select userIdx, reviewIdx, date_format(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt, comment, commentIdx
  from Comment
  where userIdx = ${userIdx}
  order by createdAt DESC;
`;

  const [Rows] = await connection.query(getmycommentQuery);
  connection.release();

  return Rows;
}
module.exports = {
  userEmailCheck,
  userNicknameCheck,
  insertUserInfo,
  login,
  getuser,
  getmypage,
  getprofile,
  patchprofile,
  patchinoculation,
  getmycomment,
};
