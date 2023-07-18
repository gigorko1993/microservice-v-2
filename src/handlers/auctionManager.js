const AWS = require("aws-sdk");
const { Op } = require("sequelize");
const baseService = require("../helpers/baseService");
const { db } = require("../helpers/db");

const name = process.env.AUCTION_TABLE_V2_NAME || "Auction";
const stage = process.env.stage || "dev";
const tableName = `${name}-${stage}`;
const QueueUrl =
  "https://sqs.eu-west-1.amazonaws.com/985430231206/MailQueue-dev";

const sqs = new AWS.SQS();

const putAuction = async (title, email, nickname, price, type) => {
  baseService(async sequelize => {
    const now = new Date();
    const endDate = new Date();
    endDate.setHours(now.getHours() + 1);

    const { Auction, Type } = await db(sequelize);

    const { id: type_id } = await Type.findOne({
      where: { name: type },
      attributes: ["id"],
    });

    const auction = {
      title,
      seller: email,
      sellerNickname: nickname,
      status: "Open",
      start: now.toISOString(),
      end: endDate.toISOString(),
      price,
      type_id,
    };

    const createdAuction = await Auction.bulkCreate(auction);
    return createdAuction;
  });
};

const deleteAuction = async auctionId => {
  baseService(async sequelize => {
    const { Auction } = await db(sequelize);
    const auction = await Auction.destroy({
      where: {
        id: auctionId,
      },
    });
    return auction;
  });
};

const findAuctionById = async auctionId => {
  baseService(async sequelize => {
    const { Auction } = await db(sequelize);

    const auction = await Auction.findOne({ where: { id: auctionId } });
    return auction;
  });
};

const scanAuctions = async status => {
  baseService(async sequelize => {
    const { Auction } = await db(sequelize);

    const auctions = await Auction.findAll({ where: { status } });
    return auctions;
  });
};

const addBid = async (auctionId, amount, email, nickname) => {
  baseService(async sequelize => {
    const { Bidder, Auction } = await db(sequelize);
    const highestBidder = await Bidder.findAll({
      include: [{ model: Auction, where: id }],
      order: [["amount", "DESC"]],
      limit: 1,
    });

    if (highestBidder && highestBidder.email === email) {
      return highestBidder;
    }

    const bidderExist = await Bidder.findOne({
      where: { auction_id, email, nickname },
    });
    if (bidderExist) {
      const updateBidder = await bidderExist.update({
        bid,
      });
      return updateBidder;
    } else {
      const bidderInfo = {
        email,
        nickname,
        bid: amount,
        auction_id: auctionId,
      };
      const result = await Bidder.bulkCreate(bidderInfo);
      return result;
    }
  });
};

const closeAuction = async id => {
  baseService(async sequelize => {
    const { Bidder, Auction } = await db(sequelize);

    const bidderExist = await Bidder.findAll({
      include: [{ model: Auction, where: id }],
      order: [["bid", "DESC"]],
      limit: 1,
    });

    if (bidderExist && bidderExist.bid === 0) {
      const notifySeller = await sqs
        .sendMessage({
          QueueUrl,
          MessageBody: JSON.stringify({
            subject: "No bids on your auction :(",
            recipient: bidderExist.Auction.seller,
            body: `Your Item ${title} didn't get any bids. Better luck next time`,
          }),
        })
        .promise();
      return notifySeller;
    }

    await Auction.update(
      {
        status: "Closed",
      },
      { where: { id } }
    );

    const notifySeller = sqs
      .sendMessage({
        QueueUrl,
        MessageBody: JSON.stringify({
          subject: "Your Item has been sold",
          recipient: bidderExist.Auction.seller,
          body: `Congratulation. Your Item ${bidderExist.Auction.title} has been sold for ${bidderExist.bid} $`,
        }),
      })
      .promise();

    const notifyBidder = sqs
      .sendMessage({
        QueueUrl,
        MessageBody: JSON.stringify({
          subject: "Your won an auction",
          recipient: bidderExist.email,
          body: `Congratulation. What a great deal. Your got a ${bidderExist.Auction.title} for: ${bidderExist.amount} $`,
        }),
      })
      .promise();

    return Promise.all([notifySeller, notifyBidder]);
  });
};

const setAuctionPictureUrl = async (id, pictureUrl) => {
  baseService(async sequelize => {
    const { Auction } = await db(sequelize);
    const auction = await Auction.update(
      {
        pictureUrl,
      },
      { where: { id } }
    );
    return auction;
  });
};

const getEndedAuctions = async () => {
  baseService(async sequelize => {
    const { Auction } = await db(sequelize);

    const now = new Date();
    const where = {
      status: "Open",
      end: { [Op.lte]: now },
    };

    const result = await Auction.findAll(where).promise();

    return result;
  });
};

module.exports = {
  putAuction,
  deleteAuction,
  findAuctionById,
  scanAuctions,
  addBid,
  closeAuction,
  setAuctionPictureUrl,
  getEndedAuctions,
};
