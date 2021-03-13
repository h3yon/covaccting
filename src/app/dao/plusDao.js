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

// 내 접종기록 수정
async function getInoculation(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const getInoculationQuery = `
  select userIdx, userInoculation, userFirstDate, userSecondDate
  from User where userIdx = ? and status = 1;
`;
  const getInoculationParams = [userIdx];

  const [getInoculationRows] = await connection.query(
    getInoculationQuery,
    getInoculationParams
  );
  connection.release();
  return getInoculationRows;
}

module.exports = {
  userCheck,
  getInoculation,
};
