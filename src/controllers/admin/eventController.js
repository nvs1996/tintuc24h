const Event = require('../../models/Event');
const TiktokProduct = require('../../models/TiktokProduct');

const PER_PAGE = 20;

function parseTiktokIds(raw) {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

exports.list = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const [events, total] = await Promise.all([
    Event.find()
      .sort({ useThisEvent: -1, createdAt: -1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE),
    Event.countDocuments(),
  ]);

  res.render('admin/events/list', {
    events,
    error: req.flash('error'),
    success: req.flash('success'),
    page,
    perPage: PER_PAGE,
    totalPages: Math.ceil(total / PER_PAGE) || 1,
  });
};

exports.showNew = async (req, res) => {
  const tiktokProducts = await TiktokProduct.find().sort({ title: 1 });
  res.render('admin/events/form', { event: null, tiktokProducts, error: req.flash('error') });
};

exports.create = async (req, res) => {
  const { title, status, useThisEvent } = req.body;

  if (!title || !title.trim()) {
    req.flash('error', 'Tiêu đề event không được để trống.');
    return res.redirect('/admin/events/new');
  }

  const image = req.file ? `/uploads/${req.file.filename}` : '';
  const tiktokIds = parseTiktokIds(req.body.tiktokIds);
  const isActive = useThisEvent === '1';

  if (isActive) {
    await Event.updateMany({}, { useThisEvent: 0 });
  }

  await Event.create({
    title: title.trim(),
    image,
    tiktokIds,
    status: status === '1' ? 1 : 0,
    useThisEvent: isActive ? 1 : 0,
  });

  req.flash('success', 'Đã tạo event.');
  res.redirect('/admin/events');
};

exports.showEdit = async (req, res) => {
  const [event, tiktokProducts] = await Promise.all([
    Event.findById(req.params.id),
    TiktokProduct.find().sort({ title: 1 }),
  ]);
  if (!event) return res.redirect('/admin/events');
  res.render('admin/events/form', { event, tiktokProducts, error: req.flash('error') });
};

exports.update = async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.redirect('/admin/events');

  const { title, status, useThisEvent } = req.body;
  if (!title || !title.trim()) {
    req.flash('error', 'Tiêu đề event không được để trống.');
    return res.redirect(`/admin/events/${event._id}/edit`);
  }

  const isActive = useThisEvent === '1';
  if (isActive) {
    await Event.updateMany({ _id: { $ne: event._id } }, { useThisEvent: 0 });
  }

  event.title = title.trim();
  event.tiktokIds = parseTiktokIds(req.body.tiktokIds);
  event.status = status === '1' ? 1 : 0;
  event.useThisEvent = isActive ? 1 : 0;
  if (req.file) event.image = `/uploads/${req.file.filename}`;

  await event.save();
  req.flash('success', 'Đã cập nhật event.');
  res.redirect('/admin/events');
};

exports.remove = async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  req.flash('success', 'Đã xóa event.');
  res.redirect('/admin/events');
};
