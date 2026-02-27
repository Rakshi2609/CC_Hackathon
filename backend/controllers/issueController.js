import Issue from '../models/Issue.js';

const DEPARTMENT_MAP = {
  Pothole: 'Roads & Infrastructure',
  Streetlight: 'Electricity Department',
  Garbage: 'Solid Waste Management',
  Drainage: 'Water & Sanitation',
  'Water Leakage': 'Water & Sanitation',
  Others: 'General Administration',
};

// Radius in metres used for clustering
const CLUSTER_RADIUS_M = 100;

// ──────────────── CITIZEN ────────────────

// POST /api/issues
export const createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;

    const imageUrl = req.file
      ? `/uploads/issues/${req.file.filename}`
      : '';

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    const issue = await Issue.create({
      title,
      description,
      category,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || '',
      },
      citizen: req.user.id,
      assignedDepartment: DEPARTMENT_MAP[category] || 'General Administration',
      statusHistory: [
        {
          status: 'pending',
          remark: 'Issue submitted',
          updatedBy: req.user.id,
        },
      ],
    });

    // ── Cluster detection ─────────────────────────────────────────
    // Find all existing issues of the same category within 100 m,
    // excluding the one we just created.
    const nearby = await Issue.find({
      _id: { $ne: issue._id },
      category,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: CLUSTER_RADIUS_M,
        },
      },
    }).select('_id clusterId isCluster clusterMembers');

    if (nearby.length > 0) {
      // Prefer an existing cluster primary; otherwise treat the first
      // nearby issue as the primary.
      let primary = nearby.find((i) => i.isCluster && !i.clusterId) || nearby[0];

      // If the found primary is itself a cluster-member, walk up to its primary
      if (primary.clusterId) {
        const realPrimary = await Issue.findById(primary.clusterId);
        if (realPrimary) primary = realPrimary;
      }

      // Link the new issue to the primary
      issue.clusterId = primary._id;
      await issue.save();

      // Update the primary cluster record
      await Issue.findByIdAndUpdate(primary._id, {
        $addToSet: { clusterMembers: issue._id },
        $set: { isCluster: true },
      });
    }
    // ─────────────────────────────────────────────────────────────

    req.io?.emit('new_issue', issue);

    const populated = await issue.populate('citizen', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/my  — citizen's own issues
export const getMyIssues = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const filter = { citizen: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('citizen', 'name email');

    const total = await Issue.countDocuments(filter);
    res.json({ issues, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/issues/:id/upvote
export const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const alreadyUpvoted = issue.upvotedBy.includes(req.user.id);
    if (alreadyUpvoted) {
      issue.upvotes -= 1;
      issue.upvotedBy = issue.upvotedBy.filter(
        (uid) => uid.toString() !== req.user.id
      );
    } else {
      issue.upvotes += 1;
      issue.upvotedBy.push(req.user.id);
    }

    await issue.save();
    res.json({ upvotes: issue.upvotes, upvotedBy: issue.upvotedBy });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ──────────────── GOVERNMENT ────────────────

// GET /api/issues  — all issues (with filters)
export const getAllIssues = async (req, res) => {
  try {
    const { status, category, department, page = 1, limit = 20, lat, lng, radius } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.assignedDepartment = department;

    // Geo filter
    if (lat && lng && radius) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('citizen', 'name email phone');

    const total = await Issue.countDocuments(filter);
    res.json({ issues, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/map  — lightweight, all issues, accessible to any logged-in user
export const getMapIssues = async (req, res) => {
  try {
    const issues = await Issue.find({})
      .select('title category status location upvotes createdAt citizen')
      .populate('citizen', 'name')
      .lean();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/stats
export const getStats = async (req, res) => {
  try {
    const [total, pending, inProgress, resolved] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'pending' }),
      Issue.countDocuments({ status: 'in-progress' }),
      Issue.countDocuments({ status: 'resolved' }),
    ]);

    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ total, pending, inProgress, resolved, categoryStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/:id
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('citizen', 'name email phone');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/issues/:id/status  — government updates status + remark
export const updateIssueStatus = async (req, res) => {
  try {
    const { status, remark, assignedDepartment } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.status = status || issue.status;
    if (remark) issue.governmentRemarks = remark;
    if (assignedDepartment) issue.assignedDepartment = assignedDepartment;

    issue.statusHistory.push({
      status: issue.status,
      remark: remark || '',
      updatedBy: req.user.id,
    });

    await issue.save();

    // ── Cascade status to all cluster members ────────────────────
    if (issue.isCluster && issue.clusterMembers.length > 0) {
      const historyEntry = {
        status: issue.status,
        remark: remark
          ? `[Cluster update] ${remark}`
          : `Status updated via cluster primary`,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      };

      const memberIssues = await Issue.find({ _id: { $in: issue.clusterMembers } });

      for (const member of memberIssues) {
        member.status = issue.status;
        if (remark) member.governmentRemarks = remark;
        if (assignedDepartment) member.assignedDepartment = assignedDepartment;
        member.statusHistory.push(historyEntry);
        await member.save();

        // Notify each member's citizen via socket
        req.io?.to(member.citizen.toString()).emit('issue_updated', {
          issueId: member._id,
          status: member.status,
          remark: historyEntry.remark,
          clusterUpdate: true,
        });
      }
    }
    // ─────────────────────────────────────────────────────────────

    // Emit socket event to primary issue's citizen
    req.io?.to(issue.citizen.toString()).emit('issue_updated', {
      issueId: issue._id,
      status: issue.status,
      remark: remark || '',
    });

    const populated = await issue.populate('citizen', 'name email phone');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/clusters  — all cluster primaries (government)
export const getClusters = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const filter = { isCluster: true };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const clusters = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('citizen', 'name email phone')
      .populate({
        path: 'clusterMembers',
        populate: { path: 'citizen', select: 'name email phone' },
      });

    const total = await Issue.countDocuments(filter);
    res.json({ clusters, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/issues/:id/cluster  — cluster details for a specific issue
// Citizens see anonymised count; government sees full details
export const getIssueCluster = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Resolve the cluster primary
    let primary = null;
    if (issue.isCluster && !issue.clusterId) {
      // This IS the primary
      primary = await Issue.findById(issue._id)
        .populate('citizen', 'name email phone')
        .populate({
          path: 'clusterMembers',
          populate: { path: 'citizen', select: 'name email phone' },
        });
    } else if (issue.clusterId) {
      // This is a member — fetch primary
      primary = await Issue.findById(issue.clusterId)
        .populate('citizen', 'name email phone')
        .populate({
          path: 'clusterMembers',
          populate: { path: 'citizen', select: 'name email phone' },
        });
    }

    if (!primary) {
      return res.json({ isInCluster: false });
    }

    const allReporters = [primary, ...primary.clusterMembers];
    const totalReports = allReporters.length;

    const isGovt = req.user.role === 'government';

    // Citizens only see count (anonymous); government sees full list
    const reporters = isGovt
      ? allReporters.map((i) => ({
          issueId: i._id,
          name: i.citizen?.name,
          email: i.citizen?.email,
          phone: i.citizen?.phone,
          reportedAt: i.createdAt,
          title: i.title,
          description: i.description,
          imageUrl: i.imageUrl,
          status: i.status,
          location: i.location,
        }))
      : null;

    res.json({
      isInCluster: true,
      primaryIssueId: primary._id,
      totalReports,
      category: primary.category,
      location: primary.location,
      status: primary.status,
      reporters, // null for citizens (privacy)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/issues/:id  — government only
export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
