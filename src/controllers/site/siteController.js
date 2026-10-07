const Article = require('../../models/Article');
const Category = require('../../models/Category');
const SiteConfig = require('../../models/SiteConfig');
const TiktokProduct = require('../../models/TiktokProduct');
const Event = require('../../models/Event');

async function commonLayoutData() {
  const [categories, siteConfig] = await Promise.all([
    Category.find().sort({ title: 1 }),
    SiteConfig.getSingleton(),
  ]);
  return { categories, siteConfig };
}

exports.home = async (req, res) => {
  const layout = await commonLayoutData();

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const perPage = 15;

  const topNews = await Article.find({ isTopNews: true })
    .sort({ _id: -1 })
    .limit(2)
    .populate('category');

  const mainNews = await Article.find({ status: 1 })
    .sort({ createdAt: -1 })
    .limit(1)
    .populate('category');

  const recentForFeatured = await Article.find({ status: 0 })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('category');

  const [latestNews, totalLatest] = await Promise.all([
    Article.find({ status: 0 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('category'),
    Article.countDocuments({ status: 0 }),
  ]);

  const mostRead = await Article.find().sort({ views: -1 }).limit(5);

  res.render('site/home', {
    ...layout,
    topNews,
    mainNews,
    recentForFeatured,
    latestNews,
    mostRead,
    page,
    totalPages: Math.ceil(totalLatest / perPage) || 1,
  });
};

exports.category = async (req, res) => {
  const layout = await commonLayoutData();
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).render('site/404', layout);

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const perPage = 12;

  const [articles, total] = await Promise.all([
    Article.find({ category: category._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('category'),
    Article.countDocuments({ category: category._id }),
  ]);

  res.render('site/category', {
    ...layout,
    category,
    articles,
    page,
    totalPages: Math.ceil(total / perPage) || 1,
  });
};

exports.articleDetail = async (req, res) => {
  const layout = await commonLayoutData();
  const article = await Article.findOne({ slug: req.params.slug })
    .populate('category')
    .populate('tiktokProduct');

  if (!article) return res.status(404).render('site/404', layout);

  Article.updateOne({ _id: article._id }, { $inc: { views: 1 } }).exec();

  const mostRead = await Article.find({ _id: { $ne: article._id } })
    .sort({ views: -1 })
    .limit(5)
    .populate('category');

  // An active event (useThisEvent = 1) overrides the per-article TikTok gate
  // popup site-wide: its own image is shown, and the TikTok link opened is
  // picked at random from its linked products, on every article - even ones
  // with no tiktokProduct of their own. Falls back to the article's own
  // linked TikTok product when no event is active.
  const activeEvent = await Event.findOne({ useThisEvent: 1 }).populate('tiktokIds');

  let popup = null;
  if (activeEvent && activeEvent.tiktokIds.length) {
    const picked = activeEvent.tiktokIds[Math.floor(Math.random() * activeEvent.tiktokIds.length)];
    popup = { image: activeEvent.image, tiktokLink: picked.tiktokLink, tiktokId: picked._id };
  } else if (article.tiktokProduct) {
    popup = {
      image: article.tiktokProduct.image,
      tiktokLink: article.tiktokProduct.tiktokLink,
      tiktokId: article.tiktokProduct._id,
    };
  }

  res.render('site/article', { ...layout, article, mostRead, popup });
};

exports.trackTiktokClick = async (req, res) => {
  await TiktokProduct.updateOne({ _id: req.params.id }, { $inc: { clicks: 1 } }).catch(() => {});
  res.status(204).end();
};
