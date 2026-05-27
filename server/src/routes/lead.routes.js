const express = require('express');
const leadController = require('../controllers/lead.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  createLeadRules,
  updateLeadRules,
  statusRules,
  noteRules,
  idParamRules,
  listQueryRules,
  handleValidation,
} = require('../validators/lead.validator');

const router = express.Router();

router.use(protect);

router.get('/', listQueryRules, handleValidation, leadController.listLeads);
router.get('/minimal', leadController.listLeadsMinimal);
router.post('/', createLeadRules, handleValidation, leadController.createLead);
router.get('/:id', idParamRules, handleValidation, leadController.getLead);
router.put('/:id', updateLeadRules, handleValidation, leadController.updateLead);
router.patch('/:id/status', statusRules, handleValidation, leadController.updateStatus);
router.post('/:id/notes', noteRules, handleValidation, leadController.addNote);
router.post('/:id/analyze', idParamRules, handleValidation, leadController.analyzeLead);
router.delete('/:id', idParamRules, handleValidation, leadController.deleteLead);

module.exports = router;
