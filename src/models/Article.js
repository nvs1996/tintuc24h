const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    // Body structured as alternating paragraphs/images: p1, image1, p2, image2, p3
    // bodyImage1 also doubles as the article's representative/thumbnail image on the FE.
    bodyParagraph1: { type: String, default: '' },
    bodyImage1: { type: String, default: '' },
    bodyParagraph2: { type: String, default: '' },
    bodyImage2: { type: String, default: '' },
    bodyParagraph3: { type: String, default: '' },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    views: { type: Number, default: 0 },

    // 1 = Main news, 0 = Secondary news
    status: { type: Number, enum: [0, 1], default: 0 },

    tiktokProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'TiktokProduct', default: null },

    isTopNews: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);
