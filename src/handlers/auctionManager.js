const AWS = require("aws-sdk");
const { Op } = require("sequelize");
const baseService = require("../helpers/baseService");
const { db } = require("../helpers/db");

const QueueUrl =
  "https://sqs.eu-west-1.amazonaws.com/985430231206/MailQueue-dev";

const sqs = new AWS.SQS();

const closeAuction = async id =>
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

const setAuctionPictureUrl = async (id, picture_url) =>
  baseService(async sequelize => {
    const { Auction } = await db(sequelize);
    const auction = await Auction.update(
      {
        picture_url,
      },
      { where: { id } }
    );
    return auction;
  });

const getEndedAuctions = async () =>
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

module.exports = {
  closeAuction,
  setAuctionPictureUrl,
  getEndedAuctions,
};
