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
async function insertReview(userIdx, reviewContent, vaccineName) {
  console.log(userIdx, reviewContent, vaccineName);
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertReviewQuery = `
        insert Review(userIdx, reviewContent, vaccineName) values (?, ?, ?);
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

// 후기 조회(생성일순)
async function selectReviewCreate(
  userIdx,
  vaccineName1,
  vaccineName2,
  vaccineName3
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectReviewQuery = `
    select Review.reviewIdx, Review.userIdx,
       User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
       (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
       (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
       case
           when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
           when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
           when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
           when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
           when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
           when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
           else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
            left join User on Review.userIdx = User.userIdx
            left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where if(? is not null,  vaccineName = ?, 1=1) and Review.status = 1 and User.status = 1
    union
    select Review.reviewIdx, Review.userIdx,
          User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
          (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
          (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
          case
              when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
              when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
              when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
              when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
              when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
              when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
              else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
            left join User on Review.userIdx = User.userIdx
            left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where if(? is not null,  vaccineName = ?, 1=1) and Review.status = 1 and User.status = 1
    union
    select Review.reviewIdx, Review.userIdx,
          User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
          (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
          (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
          case
              when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
              when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
              when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
              when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
              when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
              when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
              else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
            left join User on Review.userIdx = User.userIdx
            left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where if(? is not null,  vaccineName = ?, 1=1) and Review.status = 1 and User.status = 1
    group by Review.reviewIdx, Review.createdAt
    order by createdAt desc;
                  `;
    const selectReviewParams = [
      userIdx,
      vaccineName1,
      vaccineName1,
      userIdx,
      vaccineName2,
      vaccineName2,
      userIdx,
      vaccineName3,
      vaccineName3,
    ];
    const [selectReviewRows] = await connection.query(
      selectReviewQuery,
      selectReviewParams
    );
    connection.release();
    return selectReviewRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "selectReviewCreate query error",
    });
  }
}

// 후기 조회(좋아요순)
async function selectReviewLike(
  userIdx,
  vaccineName1,
  vaccineName2,
  vaccineName3
) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectReviewQuery = `
    select Review.reviewIdx, Review.userIdx,
       User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
       (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
       (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
       case
           when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
           when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
           when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
           when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
           when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
           when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
           else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
            left join User on Review.userIdx = User.userIdx
            left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where if(? is not null,  vaccineName = ?, 1=1) and Review.status = 1 and User.status = 1
    union
    select Review.reviewIdx, Review.userIdx,
          User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
          (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
          (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
          case
              when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
              when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
              when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
              when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
              when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
              when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
              else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
            left join User on Review.userIdx = User.userIdx
            left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where if(? is not null,  vaccineName = ?, 1=1) and Review.status = 1 and User.status = 1
    union
    select Review.reviewIdx, Review.userIdx,
          User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
          (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
          (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
          case
              when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
              when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
              when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
              when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
              when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
              when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
              else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
            left join User on Review.userIdx = User.userIdx
            left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where if(? is not null,  vaccineName = ?, 1=1) and Review.status = 1 and User.status = 1
    group by Review.reviewIdx, likeReviewCount
    order by likeReviewCount desc;
                  `;
    const selectReviewParams = [
      userIdx,
      vaccineName1,
      vaccineName1,
      userIdx,
      vaccineName2,
      vaccineName2,
      userIdx,
      vaccineName3,
      vaccineName3,
    ];
    const [selectReviewRows] = await connection.query(
      selectReviewQuery,
      selectReviewParams
    );
    connection.release();
    return selectReviewRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "selectReviewLike query error",
    });
  }
}

// 상세 후기 조회
async function selectDetailReview(userIdx, reviewIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const selectDetailReviewQuery = `
    select Review.reviewIdx, Review.userIdx,
    User.userNickname, User.userProfileImgLink, reviewContent, vaccineName,
    (select count(*) from LikeReview where LikeReview.status = 1 and LikeReview.reviewIdx = Review.reviewIdx) as likeReviewCount,
    (select CASE WHEN LikeReview.status = 1 THEN 1 ELSE 0 END) as likeStatus,
    case
        when TIMESTAMPDIFF(MINUTE,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(SECOND,Review.createdAt,now()), '초전')
        when TIMESTAMPDIFF(HOUR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MINUTE,Review.createdAt,now()), '분전')
        when TIMESTAMPDIFF(DAY,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(HOUR,Review.createdAt,now()), '시간전')
        when TIMESTAMPDIFF(WEEK,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(DAY,Review.createdAt,now()), '일전')
        when TIMESTAMPDIFF(MONTH,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(WEEK,Review.createdAt,now()), '주전')
        when TIMESTAMPDIFF(YEAR,Review.createdAt,now()) < 1 then concat(TIMESTAMPDIFF(MONTH,Review.createdAt,now()), '달전')
        else concat(TIMESTAMPDIFF(YEAR, Review.createdAt, now()), '년전') end as createdAt
    from Review
          left join User on Review.userIdx = User.userIdx
          left join LikeReview on LikeReview.userIdx = ? and Review.reviewIdx = LikeReview.reviewIdx
    where Review.reviewIdx = ? and Review.status = 1 and User.status = 1;
                  `;
    const selectDetailReviewParams = [userIdx, reviewIdx];
    const [selectDetailReviewRows] = await connection.query(
      selectDetailReviewQuery,
      selectDetailReviewParams
    );
    connection.release();
    return selectDetailReviewRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "selectDetailReview query error",
    });
  }
}

// 후기 수정
async function updateReview(reviewContent, vaccineName, reviewIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const updateReviewQuery = `
    update Review set
    reviewContent = IFNULL(?, (select reviewContent where reviewIdx = ?)),
    vaccineName = IFNULL(?, (select vaccineName where reviewIdx = ?)),
    updatedAt = now() where reviewIdx = ? and status = 1;
                  `;
    const updateReviewParams = [
      reviewContent,
      reviewIdx,
      vaccineName,
      reviewIdx,
      reviewIdx,
    ];
    const [updateReviewRows] = await connection.query(
      updateReviewQuery,
      updateReviewParams
    );
    connection.release();
    return { isSuccess: true };
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "updateReview query error",
    });
  }
}

// 후기 체크
async function checkReview(reviewIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkReviewQuery = `
    select reviewIdx, userIdx from Review where reviewIdx = ? and status = 1;
                  `;
    const checkReviewParams = [reviewIdx];
    const [checkReviewRows] = await connection.query(
      checkReviewQuery,
      checkReviewParams
    );
    connection.release();
    return checkReviewRows;
  } catch (err) {
    connection.release();
    return res.json({
      isSuccess: false,
      code: 4000,
      message: "checkReview query error",
    });
  }
}

module.exports = {
  userCheck,
  insertReview,
  selectReviewCreate,
  selectReviewLike,
  selectDetailReview,
  checkReview,
  updateReview,
};
