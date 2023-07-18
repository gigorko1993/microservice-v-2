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
    }
  }
  Auction.init(
    {
      title: DataTypes.STRING,
      seller: DataTypes.STRING,
      seller_nickname: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      price: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
      status: {
        type: DataTypes.ENUM("active", "closed"),
        defaultValue: "active",
      },
      picture_url: { type: DataTypes.STRING, defaultValue: null },
    },
    {
      sequelize,
      tableName: "Auction",
      underscored: true,
    }
  );
  return Auction;
};
