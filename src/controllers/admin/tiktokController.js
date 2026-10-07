const TiktokProduct = require('../../models/TiktokProduct');
const { escapeRegex } = require('../../utils/text');

const PER_PAGE = 20;

exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const q = (req.query.q || '').trim();
  const sort = req.query.sort === 'clicks_asc' || req.query.sort === 'clicks_desc' ? req.query.sort : '';

  const filter = q ? { title: { $regex: escapeRegex(q), $options: 'i' } } : {};
  const sortSpec = sort === 'clicks_asc' ? { clicks: 1 } : sort === 'clicks_desc' ? { clicks: -1 } : { createdAt: -1 };

  const [products, total] = await Promise.all([
    TiktokProduct.find(filter).sort(sortSpec).skip((page - 1) * PER_PAGE).limit(PER_PAGE),
    TiktokProduct.countDocuments(filter),
  ]);

  res.render('admin/tiktok/list', {
    products,
    error: req.flash('error'),
    success: req.flash('success'),
    q,
    sort,
    page,
    perPage: PER_PAGE,
    totalPages: Math.ceil(total / PER_PAGE) || 1,
  });
};

exports.showNew = (req, res) => {
  res.render('admin/tiktok/form', { product: null, error: req.flash('error') });
};

exports.create = async (req, res) => {
  const { title, type, tiktokLink } = req.body;
  if (!title || !title.trim() || !tiktokLink || !tiktokLink.trim()) {
    req.flash('error', 'Tiêu đề và link TikTok là bắt buộc.');
    return res.redirect('/admin/tiktok/new');
  }

  const image = req.file ? `/uploads/${req.file.filename}` : '';
  await TiktokProduct.create({ title: title.trim(), type: (type || '').trim(), tiktokLink: tiktokLink.trim(), image });
  req.flash('success', 'Đã tạo TikTok product.');
  res.redirect('/admin/tiktok');
};

exports.showEdit = async (req, res) => {
  const product = await TiktokProduct.findById(req.params.id);
  if (!product) return res.redirect('/admin/tiktok');
  res.render('admin/tiktok/form', { product, error: req.flash('error') });
};

exports.update = async (req, res) => {
  const product = await TiktokProduct.findById(req.params.id);
  if (!product) return res.redirect('/admin/tiktok');

  const { title, type, tiktokLink } = req.body;
  if (!title || !title.trim() || !tiktokLink || !tiktokLink.trim()) {
    req.flash('error', 'Tiêu đề và link TikTok là bắt buộc.');
    return res.redirect(`/admin/tiktok/${product._id}/edit`);
  }

  product.title = title.trim();
  product.type = (type || '').trim();
  product.tiktokLink = tiktokLink.trim();
  if (req.file) product.image = `/uploads/${req.file.filename}`;

  await product.save();
  req.flash('success', 'Đã cập nhật TikTok product.');
  res.redirect('/admin/tiktok');
};

exports.remove = async (req, res) => {
  await TiktokProduct.findByIdAndDelete(req.params.id);
  req.flash('success', 'Đã xóa TikTok product.');
  res.redirect('/admin/tiktok');
};
