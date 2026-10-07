const SiteConfig = require('../../models/SiteConfig');

exports.show = async (req, res) => {
  const config = await SiteConfig.getSingleton();
  res.render('admin/config', { config, error: req.flash('error'), success: req.flash('success') });
};

exports.update = async (req, res) => {
  const config = await SiteConfig.getSingleton();
  const { hotline } = req.body;

  config.hotline = (hotline || '').trim();
  if (req.file) config.logo = `/uploads/${req.file.filename}`;

  await config.save();
  req.flash('success', 'Đã cập nhật cấu hình.');
  res.redirect('/admin/config');
};
