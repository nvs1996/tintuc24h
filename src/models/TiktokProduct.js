const mongoose = require('mongoose');

const tiktokProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    image: { type: String, default: '' },
    tiktokLink: { type: String, required: true, trim: true },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TiktokProduct', tiktokProductSchema);
