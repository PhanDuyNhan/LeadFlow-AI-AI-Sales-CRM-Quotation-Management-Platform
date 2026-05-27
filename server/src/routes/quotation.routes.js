const express = require('express');
const quotationController = require('../controllers/quotation.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  createRules,
  updateRules,
  statusRules,
  listQueryRules,
  idParamRules,
  leadIdParamRules,
  handleValidation,
} = require('../validators/quotation.validator');

const router = express.Router();

router.use(protect);

router.get('/', listQueryRules, handleValidation, quotationController.listQuotations);
router.get('/generate-code', quotationController.generateCode);
router.get('/by-lead/:leadId', leadIdParamRules, handleValidation, quotationController.listByLead);
router.post('/', createRules, handleValidation, quotationController.createQuotation);
router.get('/:id', idParamRules, handleValidation, quotationController.getQuotation);
router.put('/:id', updateRules, handleValidation, quotationController.updateQuotation);
router.patch('/:id/status', statusRules, handleValidation, quotationController.updateStatus);
router.delete('/:id', idParamRules, handleValidation, quotationController.deleteQuotation);

module.exports = router;
