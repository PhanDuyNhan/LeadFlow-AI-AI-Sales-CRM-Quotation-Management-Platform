const express = require('express');
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const { followUpMessageRules, handleValidation } = require('../validators/ai.validator');

const router = express.Router();

router.use(protect);

router.get('/follow-up-purposes', aiController.purposes);
router.post('/follow-up-message', followUpMessageRules, handleValidation, aiController.followUpMessage);

module.exports = router;
