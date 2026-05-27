const aiService = require('../services/aiService');
const { successResponse } = require('../utils/response');

async function followUpMessage(req, res, next) {
  try {
    const data = aiService.generateFollowUpMessage(req.body || {});
    return successResponse(res, 200, data.fallback ? 'Fallback message generated' : 'Follow-up message generated', data);
  } catch (err) {
    return next(err);
  }
}

function purposes(req, res) {
  return successResponse(res, 200, 'Follow-up purposes', {
    purposes: aiService.FOLLOW_UP_PURPOSES,
  });
}

module.exports = { followUpMessage, purposes };
