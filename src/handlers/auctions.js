const { closeAuction, getEndedAuctions } = require("./auctionManager");
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

      const res = await Auction.create({ ...auction });
      console.log("🚀 ~ file: auctions.js:60 ~ res:", res);
      return {
        body: res,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  });

const deleteAuctionById = async event =>
  baseService(async sequelize => {
    const { auctionId } = event.pathParameters;
    console.log("🚀 ~ file: auctions.js:67 ~ auctionId:", auctionId);

    const { Auction } = await db(sequelize);
    const auction = await Auction.destroy({
      where: {
        id: auctionId,
      },
    });

    console.log("🚀 ~ file: auctions.js:75 ~ auction:", auction);
    return { body: auction };
  });

const findAuction = async event =>
  baseService(async sequelize => {
    const { auctionId } = event.pathParameters;
    const { Auction } = await db(sequelize);

    const auction = await Auction.findOne({ where: { id: auctionId } });
    return { body: auction };
  });

const getAuctionsList = async event =>
  baseService(async sequelize => {
    const { status, type } = event.pathParameters;
    const { Auction } = await db(sequelize);

    const where = { status };
    if (type) {
      where[type] = type;
    }

    const auctions = await Auction.findAll({ where });
    return { body: auctions };
  });

const placeBid = async event =>
  baseService(async sequelize => {
    const { auctionId } = event.pathParameters;
    const { amount } = JSON.parse(event.body);
    const { email, "cognito:username": nickname } =
      event.requestContext.authorizer.claims;

    const { Bidder, Auction } = await db(sequelize);

    const auction = await Auction.findOne({ where: { id: auctionId } });

    // Checking if auction exist
    if (!auction) {
      console.log(`No auction with id: ${auctionId}`);
      return { statusCode: 400, body: `No auction with id: ${auctionId}` };
    }
    // Auction status validation
    if (auction?.status !== "Open") {
      console.log(
        `Not possible to place bid on CLOSED auction with id: ${auction.id}``Not possible to place bid on CLOSED auction with id: ${auction.id}`
      );
      return {
        statusCode: 400,
        body: `Not possible to place bid on CLOSED auction with id: ${auction.id}`,
      };
    }
    // Bid identity validation
    if (email === auction?.seller) {
      console.log(
        `Not possible to place bid on your own auction: ${auction.seller}`
      );
      return {
        statusCode: 400,
        body: `Not possible to place bid on your own auction: ${auction.seller}`,
      };
    }

    const highestBidder = await Bidder.findAll({
      include: [{ model: Auction, where: { id: auctionId } }],
      order: [["amount", "DESC"]],
      limit: 1,
    });

    if (highestBidder && highestBidder.email === email) {
      return {
        statusCode: 204,
        body: highestBidder,
        message: `highest bid already exist for user: ${highestBidder.email}`,
      };
    }

    const bidderExist = await Bidder.findOne({
      where: { auction_id, email, nickname },
    });
    if (bidderExist) {
      const updateBidder = await bidderExist.update({
        bid,
      });
      return { statusCode: 200, body: updateBidder };
    } else {
      const bidderInfo = {
        email,
        nickname,
        bid: amount,
        auction_id: auctionId,
      };
      const result = await Bidder.create({ ...bidderInfo });
      return { body: result };
    }
  });

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
