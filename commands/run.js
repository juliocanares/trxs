import moment from "moment";

export default (database) => {
  return async (options) => {
    const [result] = await database.raw(query, [Number(options.userId)]);

    const resultWithFormattedDates = result.map((item) => {
      return {
        ...item,
        lastTransaction: moment(item.lastTransaction).format("LLL"),
      };
    });

    console.table(resultWithFormattedDates);
  };
};

const query = `
    SELECT
    Transactions.thirdParty,
    DATE_FORMAT(Transactions.transactedAt, '%Y-%m') AS 'month',
    Transactions.transactedAt AS lastTransaction,
    Transactions.currentBalance AS endingBalance
    FROM
    Transactions
    INNER JOIN (
    SELECT
        Transactions.UserId AS UserId,
        MAX(Transactions.transactedAt) AS transactedAt,
        Transactions.thirdParty AS thirdParty
    FROM
        Transactions
    WHERE
        Transactions.UserId = ?
    GROUP BY
        YEAR(transactedAt),
        YEAR(transactedAt),
        thirdParty) AS FilteredTable ON FilteredTable.UserId = Transactions.UserId
    AND FilteredTable.transactedAt = Transactions.transactedAt
    AND FilteredTable.thirdParty = Transactions.thirdParty;
`;
