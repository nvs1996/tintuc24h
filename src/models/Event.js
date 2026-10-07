const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    tiktokIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TiktokProduct' }],

    // General enable/disable for the event record.
    status: { type: Number, enum: [0, 1], default: 1 },

    // Exclusive "live on FE" flag - only one event should have this = 1 at a
    // time (enforced in eventController on create/update).
    useThisEvent: { type: Number, enum: [0, 1], default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
