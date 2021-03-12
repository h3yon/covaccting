const { pool } = require("../../../config/database");

// 유효한 유저인지 체크
async function userCheck(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const userCheckQuery = `
      select userIdx from User where userIdx = ? and status = 1;
                  `;
    const userCheckParams = [userIdx];
    const [userCheckRows] = await connection.query(
      userCheckQuery,
      userCheckParams
    );
    connection.release();
    return userCheckRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "userCheck query error",
    });
  }
}

// 후기 작성
async function insertReview(userIdx, eviewContent, vaccineName) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertReviewQuery = `
        insert Review(userIdx, reviewContent, vaccineName) values (?, ?, ?, ?);
                  `;
    const insertReviewParams = [userIdx, reviewContent, vaccineName];
    const [insertReviewRows] = await connection.query(
      insertReviewQuery,
      insertReviewParams
    );
    connection.release();
    return { isSuccess: true };
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "insertReview query error",
    });
  }
}
module.exports = {
  userCheck,
  insertReview,
};
