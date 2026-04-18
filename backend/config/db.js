const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    let connectionInstance = await mongoose.connect(
      "mongodb://0.0.0.0/omegalauth",
    );

    if (connectionInstance) {
      console.log(`Connected to db`);
    }
  } catch (error) {
    console.log("error in connection to db: ", error);
  }
};

module.exports = connectToDB;
