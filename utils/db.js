const mongoose = require('mongoose');

module.exports.dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('datbase connected');
  } catch (error) {
    console.log('===', error.message);
  }
};

// {
//       useNewUrlParser: true,
//     }
