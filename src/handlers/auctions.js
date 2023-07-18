const {
  putAuction,
  deleteAuction,
  findAuctionById,
  scanAuctions,
  addBid,
  closeAuction,
  getEndedAuctions,
} = require("./auctionManager");
const { createResponse } = require("./responseHandler");
const baseService = require("../helpers/baseService");
const { db } = require("../helpers/db");

const createAuction = async event =>
  baseService(async sequelize => {
    const { title, price, type } = JSON.parse(event.body);

    const { email } = event.requestContext.authorizer.claims;
    console.log("🚀 ~ file: auctions.js:19 ~ email:", email);

    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1);

    try {
      const { Auction, Type } = await db(sequelize);

      const { id: type_id } = await Type.findOne({
        where: { name: type },
        attributes: ["id"],
      });
      console.log(
        "🚀 ~ file: auctionManager.js:26 ~ putAuction ~ type_id:",
        type_id
      );

      const auction = {
        title,
        seller: email,
        seller_nickname: email,
        start: now.toISOString(),
        end: endDate.toISOString(),
        price,
        type_id,
        status: "Open",
        picture_url: null,
      };
      console.log(
        "🚀 ~ file: auctionManager.js:38 ~ putAuction ~ auction:",
        auction
      );

      const res = await Auction.create({...auction});
      console.log("🚀 ~ file: auctions.js:60 ~ res:", res)
      return {
        body: res,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

const deleteAuctionById = (auctionId, callback) => {
  deleteAuction(auctionId)
    .then(res => {
      console.log("response: ", res);
      callback(null, createResponse(200, res));
    })
    .catch(err => {
      console.log(err);
      callback(null, createResponse(500, "Error on saving auction"));
    });
};
const findAuction = (auctionId, callback) => {
  const auction = findAuctionById(auctionId)
    .then(res => {
      console.log("response: ", res);
      callback(null, createResponse(200, res));
    })
    .catch(err => {
      console.log(err);
      callback(null, createResponse(500, "Error on saving auction"));
    });
  console.log("auction: ", auction);
  if (!auction) {
    throw new Error(`No auction with id: ${auctionId}`);
  }
};

const getAuctionsList = async (status, callback) => {
  await scanAuctions(status)
    .then(res => {
      console.log("response: ", res);
      callback(null, createResponse(200, res));
    })
    .catch(err => {
      console.log(err);
      callback(null, createResponse(500, "Error on get auction list"));
    });
};

const placeBid = async (auctionId, amount, email, nickname, callback) => {
  const auction = await findAuctionById(auctionId);

  console.log("auction: ", auction);

  // Checking if auction exist
  if (!auction) {
    return callback(
      null,
      createResponse(400, `No auction with id: ${auctionId}`)
    );
  }
  // Auction status validation
  if (auction?.status !== "Open") {
    return callback(
      null,
      createResponse(
        400,
        `Not possible to place bid on CLOSED auction with id: ${auction.id}`
      )
    );
  }
  // Bid identity validation
  if (email === auction?.seller) {
    return callback(
      null,
      createResponse(
        400,
        `Not possible to place bid on your own auction: ${auction.seller}`
      )
    );
  }

  await addBid(auctionId, amount, email, nickname);

  return callback(
    null,
    createResponse(204, { auctionId, amount, email, nickname })
  );
};

const processAuctions = async (_event, _context, callback) => {
  try {
    const auctionsToClose = await getEndedAuctions();
    console.log("auctionsToClose in handler: ", auctionsToClose);

    if (auctionsToClose.length) {
      const closePromises = await Promise.all(
        auctionsToClose.map(({ id }) => closeAuction(id))
      );

      console.log("closePromises: ", closePromises);
      callback(null, createResponse(204, { closed: closePromises.length }));
    }

    callback(null, createResponse(204, { closed: auctionsToClose.length }));
  } catch (error) {
    callback(null, createResponse(400, `Error on closing auctions`));
  }
};

module.exports = {
  createAuction,
  deleteAuctionById,
  findAuction,
  getAuctionsList,
  placeBid,
  processAuctions,
};
