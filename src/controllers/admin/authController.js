const bcrypt = require('bcryptjs');
const Admin = require('../../models/Admin');

exports.showLogin = (req, res) => {
  res.render('admin/login', { error: req.flash('error') });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin || !(await bcrypt.compare(password || '', admin.passwordHash))) {
    req.flash('error', 'Sai tài khoản hoặc mật khẩu.');
    return res.redirect('/admin/login');
  }

  req.session.adminId = admin._id.toString();
  req.session.username = admin.username;
  res.redirect('/admin');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};

exports.showChangePassword = (req, res) => {
  res.render('admin/change-password', {
    error: req.flash('error'),
    success: req.flash('success'),
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const admin = await Admin.findById(req.session.adminId);

  if (!admin || !(await bcrypt.compare(currentPassword || '', admin.passwordHash))) {
    req.flash('error', 'Mật khẩu hiện tại không đúng.');
    return res.redirect('/admin/change-password');
  }

  if (!newPassword || newPassword.length < 8) {
    req.flash('error', 'Mật khẩu mới phải có ít nhất 8 ký tự.');
    return res.redirect('/admin/change-password');
  }

  if (newPassword !== confirmPassword) {
    req.flash('error', 'Xác nhận mật khẩu không khớp.');
    return res.redirect('/admin/change-password');
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();

  req.flash('success', 'Đổi mật khẩu thành công.');
  res.redirect('/admin/change-password');
};
