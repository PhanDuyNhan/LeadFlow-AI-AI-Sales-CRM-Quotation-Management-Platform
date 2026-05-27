const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  createTaskRules,
  updateTaskRules,
  idParamRules,
  listQueryRules,
  handleValidation,
} = require('../validators/task.validator');

const router = express.Router();

router.use(protect);

router.get('/', listQueryRules, handleValidation, taskController.listTasks);
router.get('/today', taskController.todayFollowUps);
router.get('/overdue', taskController.overdueFollowUps);
router.post('/', createTaskRules, handleValidation, taskController.createTask);
router.get('/:id', idParamRules, handleValidation, taskController.getTask);
router.put('/:id', updateTaskRules, handleValidation, taskController.updateTask);
router.patch('/:id/complete', idParamRules, handleValidation, taskController.completeTask);
router.delete('/:id', idParamRules, handleValidation, taskController.deleteTask);

module.exports = router;
