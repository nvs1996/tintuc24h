const slugify = require('slugify');
const Category = require('../../models/Category');

exports.list = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.render('admin/categories/list', { categories, error: req.flash('error'), success: req.flash('success') });
};

exports.showNew = (req, res) => {
  res.render('admin/categories/form', { category: null, error: req.flash('error') });
};

exports.create = async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    req.flash('error', 'Tiêu đề danh mục không được để trống.');
    return res.redirect('/admin/categories/new');
  }
  const slug = slugify(title, { lower: true, locale: 'vi', strict: true });
  try {
    await Category.create({ title: title.trim(), slug });
    req.flash('success', 'Đã tạo danh mục.');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', err.code === 11000 ? 'Danh mục này đã tồn tại.' : err.message);
    res.redirect('/admin/categories/new');
  }
};

exports.showEdit = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.redirect('/admin/categories');
  res.render('admin/categories/form', { category, error: req.flash('error') });
};

exports.update = async (req, res) => {
  const { title } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) return res.redirect('/admin/categories');

  if (!title || !title.trim()) {
    req.flash('error', 'Tiêu đề danh mục không được để trống.');
    return res.redirect(`/admin/categories/${category._id}/edit`);
  }

  category.title = title.trim();
  category.slug = slugify(title, { lower: true, locale: 'vi', strict: true });
  try {
    await category.save();
    req.flash('success', 'Đã cập nhật danh mục.');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', err.code === 11000 ? 'Danh mục này đã tồn tại.' : err.message);
    res.redirect(`/admin/categories/${category._id}/edit`);
  }
};

exports.remove = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  req.flash('success', 'Đã xóa danh mục.');
  res.redirect('/admin/categories');
};
