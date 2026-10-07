const slugify = require('slugify');
const Article = require('../../models/Article');
const Category = require('../../models/Category');
const TiktokProduct = require('../../models/TiktokProduct');
const { escapeRegex } = require('../../utils/text');

const PER_PAGE = 20;

async function loadFormOptions() {
  const [categories, tiktokProducts] = await Promise.all([
    Category.find().sort({ title: 1 }),
    TiktokProduct.find().sort({ title: 1 }),
  ]);
  return { categories, tiktokProducts };
}

function uniqueSlug(title, id) {
  const base = slugify(title, { lower: true, locale: 'vi', strict: true });
  return `${base}-${id}`;
}

exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const q = (req.query.q || '').trim();
  const sort = req.query.sort === 'views_asc' || req.query.sort === 'views_desc' ? req.query.sort : '';

  const filter = q ? { title: { $regex: escapeRegex(q), $options: 'i' } } : {};
  // status: -1 pins "Tin chính" (status = 1) articles to the top, above the chosen secondary sort.
  const sortSpec = sort === 'views_asc'
    ? { status: -1, views: 1 }
    : sort === 'views_desc'
      ? { status: -1, views: -1 }
      : { status: -1, createdAt: -1 };

  const [articles, total] = await Promise.all([
    Article.find(filter).sort(sortSpec).skip((page - 1) * PER_PAGE).limit(PER_PAGE).populate('category'),
    Article.countDocuments(filter),
  ]);

  res.render('admin/articles/list', {
    articles,
    error: req.flash('error'),
    success: req.flash('success'),
    q,
    sort,
    page,
    perPage: PER_PAGE,
    totalPages: Math.ceil(total / PER_PAGE) || 1,
  });
};

exports.showNew = async (req, res) => {
  const options = await loadFormOptions();
  res.render('admin/articles/form', { article: null, ...options, error: req.flash('error') });
};

exports.create = async (req, res) => {
  const {
    title, categoryId, tiktokProductId, status, isTopNews,
    bodyParagraph1, bodyImage1Url, bodyParagraph2, bodyImage2Url, bodyParagraph3,
  } = req.body;

  if (!title || !title.trim() || !categoryId) {
    req.flash('error', 'Tiêu đề và danh mục là bắt buộc.');
    return res.redirect('/admin/articles/new');
  }

  const files = req.files || {};
  const bodyImage1 = files.bodyImage1 ? `/uploads/${files.bodyImage1[0].filename}` : (bodyImage1Url || '');
  const bodyImage2 = files.bodyImage2 ? `/uploads/${files.bodyImage2[0].filename}` : (bodyImage2Url || '');

  const article = new Article({
    title: title.trim(),
    bodyParagraph1: bodyParagraph1 || '',
    bodyImage1,
    bodyParagraph2: bodyParagraph2 || '',
    bodyImage2,
    bodyParagraph3: bodyParagraph3 || '',
    category: categoryId,
    status: status === '1' ? 1 : 0,
    tiktokProduct: tiktokProductId || null,
    isTopNews: isTopNews === 'on',
  });
  article.slug = uniqueSlug(title, article._id.toString().slice(-6));

  await article.save();
  req.flash('success', 'Đã tạo bài viết.');
  res.redirect('/admin/articles');
};

exports.showEdit = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.redirect('/admin/articles');
  const options = await loadFormOptions();
  res.render('admin/articles/form', { article, ...options, error: req.flash('error') });
};

exports.update = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.redirect('/admin/articles');

  const {
    title, categoryId, tiktokProductId, status, isTopNews,
    bodyParagraph1, bodyImage1Url, bodyParagraph2, bodyImage2Url, bodyParagraph3,
  } = req.body;

  if (!title || !title.trim() || !categoryId) {
    req.flash('error', 'Tiêu đề và danh mục là bắt buộc.');
    return res.redirect(`/admin/articles/${article._id}/edit`);
  }

  const files = req.files || {};
  if (files.bodyImage1) article.bodyImage1 = `/uploads/${files.bodyImage1[0].filename}`;
  else if (bodyImage1Url !== undefined) article.bodyImage1 = bodyImage1Url;
  if (files.bodyImage2) article.bodyImage2 = `/uploads/${files.bodyImage2[0].filename}`;
  else if (bodyImage2Url !== undefined) article.bodyImage2 = bodyImage2Url;

  if (title.trim() !== article.title) {
    article.slug = uniqueSlug(title, article._id.toString().slice(-6));
  }
  article.title = title.trim();
  article.bodyParagraph1 = bodyParagraph1 || '';
  article.bodyParagraph2 = bodyParagraph2 || '';
  article.bodyParagraph3 = bodyParagraph3 || '';
  article.category = categoryId;
  article.status = status === '1' ? 1 : 0;
  article.tiktokProduct = tiktokProductId || null;
  article.isTopNews = isTopNews === 'on';

  await article.save();
  req.flash('success', 'Đã cập nhật bài viết.');
  res.redirect('/admin/articles');
};

exports.clone = async (req, res) => {
  const original = await Article.findById(req.params.id);
  if (!original) return res.redirect('/admin/articles');

  const clone = new Article({
    title: `${original.title} (Bản sao)`,
    bodyParagraph1: original.bodyParagraph1,
    bodyImage1: original.bodyImage1,
    bodyParagraph2: original.bodyParagraph2,
    bodyImage2: original.bodyImage2,
    bodyParagraph3: original.bodyParagraph3,
    category: original.category,
    status: original.status,
    tiktokProduct: original.tiktokProduct,
    isTopNews: original.isTopNews,
  });
  clone.slug = uniqueSlug(clone.title, clone._id.toString().slice(-6));

  await clone.save();
  req.flash('success', 'Đã nhân bản bài viết.');
  res.redirect('/admin/articles');
};

exports.remove = async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  req.flash('success', 'Đã xóa bài viết.');
  res.redirect('/admin/articles');
};
