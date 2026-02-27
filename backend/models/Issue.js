import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Pothole',
        'Streetlight',
        'Garbage',
        'Drainage',
        'Water Leakage',
        'Others',
      ],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: String,
      default: '',
    },
    governmentRemarks: {
      type: String,
      default: '',
    },
    statusHistory: [
      {
        status: String,
        remark: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Clustering ──────────────────────────────────────────────────
    // The "primary" issue that represents this cluster.
    // Null means this issue is the primary (or standalone).
    clusterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
    },
    // Only populated on the cluster-primary issue.
    // Contains refs to all duplicate nearby issues.
    clusterMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
    // Quick flag — true when at least one duplicate is linked.
    isCluster: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Geo index for location-based queries
issueSchema.index({ location: '2dsphere' });

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
