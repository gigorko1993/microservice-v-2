module.exports = (sequelize, DataTypes) => {
  class Auction extends sequelize.Sequelize.Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Auction.belongsTo(models.Type);
      Auction.hasMany(models.Bidder);
      Auction.hasOne(models.Seller);
    }
  }
  Auction.init(
    {
      title: DataTypes.STRING,
      seller: DataTypes.STRING,
      sellerNickname: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      price: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM("active", "closed"),
        defaultValue: "active",
      },
      pictureUrl: { type: DataTypes.STRING, defaultValue: null },
    },
    {
      sequelize,
      tableName: "Auction",
      paranoid: true,
      underscored: true,
    }
  );
  return Auction;
};
