const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');

const homeSchema = new mongoose.Schema({
  houseName: {
    type: String,
    required:true
  },
  price: {
    type: Number, 
    required:true
  },
  location: {
    type: String, 
    required:true
  },
  photoUrl: String,
  description: String
});
homeSchema.pre('findOneAndDelete', async function(next) {
  console.log('Came to pre hook while deleting a home');
  const homeId = this.getQuery()._id;
  await this.model('Favourite').deleteMany({houseId: homeId});
  next();
});

module.exports = mongoose.model('Home', homeSchema);
