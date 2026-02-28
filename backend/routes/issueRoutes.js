
import express from 'express';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';
const restrictToGovt = restrictTo('government');
import upload from '../middleware/uploadMiddleware.js';
import {
  createIssue,
  getMyIssues,
  getAllIssues,
  getIssueById,
  updateIssueStatus,
  deleteIssue,
  upvoteIssue,
  getStats,
  getMapIssues,
  getGovtClusters,
  getIssueCluster,
} from '../controllers/issueController.js';

const router = express.Router();

router.get('/clusters', protect, restrictToGovt, getGovtClusters);
router.get('/map', protect, getMapIssues);
router.get('/stats', protect, restrictToGovt, getStats);
router.get('/my', protect, getMyIssues);
router.get('/', protect, restrictToGovt, getAllIssues);

router.post('/', protect, upload.single('image'), createIssue);

router.put('/:id/status', protect, restrictToGovt, updateIssueStatus);
router.post('/:id/upvote', protect, upvoteIssue);
router.get('/:id/cluster', protect, getIssueCluster);
router.get('/:id', protect, getIssueById);
router.delete('/:id', protect, restrictToGovt, deleteIssue);

export default router;
