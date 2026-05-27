const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', dashboardController.getDashboard);
router.get('/summary', dashboardController.getSummary);
router.get('/lead-by-status', dashboardController.getLeadByStatus);
router.get('/lead-by-source', dashboardController.getLeadBySource);
router.get('/quotation-status', dashboardController.getQuotationStatusStats);
router.get('/revenue-forecast', dashboardController.getRevenueForecast);
router.get('/top-hot-leads', dashboardController.getTopHotLeads);
router.get('/follow-ups/today', dashboardController.getTodayFollowUps);
router.get('/follow-ups/overdue', dashboardController.getOverdueFollowUps);

module.exports = router;
