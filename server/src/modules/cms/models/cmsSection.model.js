const mongoose = require('mongoose');

const cmsSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: [
        'hero',
        'hod',
        'stats',
        'faculty_showcase',
        'gallery',
        'placements',
        'internships',
        'hackathons',
        'alumni',
        'contact',
        'videos',
        'events',
        'achievements',
        'research',
      ],
    },
    title: { type: String, trim: true },
    data: { type: mongoose.Schema.Types.Mixed },
    isVisible: { type: Boolean, default: true },
    order: { type: Number },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

cmsSectionSchema.index({ isVisible: 1, order: 1 });

module.exports = mongoose.model('CmsSection', cmsSectionSchema);
