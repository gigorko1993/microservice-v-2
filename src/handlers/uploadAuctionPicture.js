const AWS = require("aws-sdk");

const s3 = new AWS.S3();

const { createResponse } = require("./responseHandler");

const bucketName = "auction-bucket-random123-dev";
const { findAuctionById, setAuctionPictureUrl } = require("./auctionManager");

const handler = async (event) => {
  const { auctionId } = event.pathParameters;
  const { email } = event.requestContext.authorizer;

  const auction = await findAuctionById(auctionId);

  // Validate auction ownership
  if (auction.seller !== email) {
    createResponse(400, "Not possible to upload picture if you is not seller");
  }
  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  try {
    const result = await s3
      .upload({
        Bucket: bucketName,
        Key: `${auction.id}.jpg`,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
      })
      .promise();
    console.log("Upload to S3 result: ", result.Location);
    const updatedAuction = await setAuctionPictureUrl(
      auction.id,
      result.Location
    );

    return createResponse(200, { body: JSON.stringify(updatedAuction) });
  } catch (error) {
    return createResponse(500, "Error on uploading picture");
  }
};

module.exports = { handler };
