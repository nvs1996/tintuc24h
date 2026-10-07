const mongoose = require('mongoose');

// Singleton document holding site-wide settings (logo, hotline, ...).
const siteConfigSchema = new mongoose.Schema(
  {
    logo: { type: String, default: '' },
    hotline: { type: String, default: '' },
  },
  { timestamps: true }
);

siteConfigSchema.statics.getSingleton = async function () {
  let config = await this.findOne();
  if (!config) config = await this.create({});
  return config;
};

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
