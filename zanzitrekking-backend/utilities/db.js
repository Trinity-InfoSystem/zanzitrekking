const mongoose = require("mongoose");

const logger = require('./logger');
module.exports.dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    logger.info("Database connected");
  } catch (error) {
    logger.error("Database connection error:", error.message);
  }
};
