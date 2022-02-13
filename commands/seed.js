import _ from "lodash";

export default (database, tableName) => {
  return async (options) => {
    const hasTable = await database.schema.hasTable(tableName);

    if (hasTable) {
      await database.schema.dropTable(tableName);
    }

    await database.schema.createTable(tableName, (table) => {
      table.increments("id");
      table.string("thirdParty");
      table.integer("UserId");
      table.decimal("currentBalance");
      table.datetime("transactedAt");
      table.index(["UserId", "transactedAt", "thirdParty"], "queryIndex");
    });

    const thirdParties = [
      "BofA",
      "Wells fargo",
      "Chase",
      "Silicon Valley Bank",
      "Coinbase",
      "MetaMask",
    ];

    function randomDate(start, end) {
      const timeWindow = end.getTime() - start.getTime();

      return new Date(start.getTime() + Math.random() * timeWindow);
    }

    const total = Number(options.total);

    const defaultChunkSize = Number(options.chunkSize);

    let alreadyCreated = 0;

    const createInChunks = async (chunkSize) => {
      alreadyCreated += chunkSize;

      console.log(
        `processing ${chunkSize} new records ${alreadyCreated}/${total}`
      );

      const transactions = [];

      for (let i = 0; i < chunkSize; i++) {
        const transactedAt = randomDate(new Date(2021, 0, 1), new Date());

        const transaction = {
          thirdParty: _.sample(thirdParties),
          UserId: _.random(1, 100),
          currentBalance: _.random(-100, 10000),
          transactedAt,
        };

        transactions.push(transaction);
      }

      await database.batchInsert(tableName, transactions, 100);

      const toProcess = total - alreadyCreated;

      if (toProcess === 0) {
        console.log(`all ${total} records were created`);

        return;
      }

      const newChunkSize = Math.min(toProcess, chunkSize);

      await createInChunks(newChunkSize);
    };

    await createInChunks(defaultChunkSize);
  };
};
