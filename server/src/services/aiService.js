/**
 * Rule-based mock AI service.
 *
 * No external AI APIs are called. All logic lives in this file so it can be
 * swapped for a real provider (OpenAI / Claude / etc.) later without touching
 * controllers, routes, or the frontend.
 */

const FOLLOW_UP_PURPOSES = [
  'First contact',
  'After quotation',
  'Payment reminder',
  'Meeting reminder',
  'Re-engagement',
  'Thank you message',
];

const HOT_STATUSES = new Set(['Qualified', 'Quoted', 'Negotiating']);
const COLD_STATUSES = new Set(['Lost']);

const STRONG_TIMELINE_KEYWORDS = [
  'asap', 'urgent', 'gấp', 'ngay', 'this week', 'tuần này',
  'tuần tới', 'next week', 'tháng này', 'this month', '1 month', '1 tháng',
];
const SLOW_TIMELINE_KEYWORDS = [
  '6 tháng', '6 months', '1 year', '1 năm', 'năm sau', 'next year',
  'chưa rõ', 'unknown', 'tbd', 'sometime',
];

const STRONG_SOURCES = new Set(['Referral', 'Event']);
const COLD_SOURCES = new Set(['Other']);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeLower(value) {
  return typeof value === 'string' ? value.toLowerCase() : '';
}

function lastNoteText(lead) {
  if (!lead?.notes?.length) return '';
  const sorted = [...lead.notes].sort((a, b) => {
    const aT = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bT = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bT - aT;
  });
  return sorted[0]?.body || '';
}

/**
 * Score a lead based on budget / timeline / need / status / source / notes.
 * Returns { score: 'Hot'|'Warm'|'Cold', reason, suggestedAction, points }.
 */
function scoreLead(lead) {
  const reasons = [];
  let points = 0;

  // --- Budget (0–40 pts) ---
  const budget = Number(lead?.budget) || 0;
  if (budget >= 50000) {
    points += 40;
    reasons.push(`ngân sách lớn (${budget.toLocaleString()})`);
  } else if (budget >= 10000) {
    points += 25;
    reasons.push(`ngân sách khá (${budget.toLocaleString()})`);
  } else if (budget > 0) {
    points += 10;
    reasons.push(`có ngân sách (${budget.toLocaleString()})`);
  } else {
    reasons.push('chưa rõ ngân sách');
  }

  // --- Status (0–25 pts) ---
  if (HOT_STATUSES.has(lead?.status)) {
    points += 25;
    reasons.push(`đang ở giai đoạn "${lead.status}"`);
  } else if (lead?.status === 'Contacted') {
    points += 10;
    reasons.push('đã liên hệ');
  } else if (COLD_STATUSES.has(lead?.status)) {
    points -= 30;
    reasons.push('đã đánh dấu Lost');
  } else if (lead?.status === 'Won') {
    points += 20;
    reasons.push('đã chốt deal');
  }

  // --- Timeline (0–15 pts) ---
  const timeline = safeLower(lead?.timeline);
  if (timeline) {
    if (STRONG_TIMELINE_KEYWORDS.some((k) => timeline.includes(k))) {
      points += 15;
      reasons.push('timeline gấp');
    } else if (SLOW_TIMELINE_KEYWORDS.some((k) => timeline.includes(k))) {
      points -= 5;
      reasons.push('timeline xa');
    } else {
      points += 5;
      reasons.push('có timeline cụ thể');
    }
  }

  // --- Need description (0–10 pts) ---
  const need = safeLower(lead?.needDescription);
  if (need && need.length >= 30) {
    points += 10;
    reasons.push('mô tả nhu cầu chi tiết');
  } else if (need) {
    points += 4;
  }

  // --- Source (0–10 pts) ---
  if (STRONG_SOURCES.has(lead?.source)) {
    points += 10;
    reasons.push(`nguồn chất lượng (${lead.source})`);
  } else if (COLD_SOURCES.has(lead?.source)) {
    points -= 5;
  } else if (lead?.source) {
    points += 3;
  }

  // --- Notes engagement (0–10 pts) ---
  const noteCount = Array.isArray(lead?.notes) ? lead.notes.length : 0;
  if (noteCount >= 3) {
    points += 10;
    reasons.push('đã có nhiều ghi chú tương tác');
  } else if (noteCount >= 1) {
    points += 4;
  }

  const final = clamp(points, 0, 100);

  let score = 'Warm';
  if (final >= 60) score = 'Hot';
  else if (final < 30) score = 'Cold';

  // Special case: explicit Lost always Cold, regardless of points.
  if (lead?.status === 'Lost') score = 'Cold';

  const reason = `Điểm ${final}/100 — ${reasons.join(', ') || 'không có dữ liệu nổi bật'}.`;

  const suggestedAction = (() => {
    if (score === 'Hot') {
      return 'Liên hệ trong vòng 24 giờ. Gửi báo giá chi tiết hoặc lên lịch họp chốt deal.';
    }
    if (score === 'Cold') {
      return 'Bổ sung thông tin (ngân sách, nhu cầu, timeline) trước khi tiếp tục đầu tư thời gian.';
    }
    return 'Tiếp tục nuôi dưỡng: gửi tài liệu tham khảo, hỏi rõ ngân sách và timeline trong 3–5 ngày tới.';
  })();

  return { score, reason, suggestedAction, points: final };
}

/* ----------------------------- Follow-up messages ----------------------------- */

function pickRandom(list) {
  if (!list.length) return '';
  return list[Math.floor(Math.random() * list.length)];
}

function formatBudget(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toLocaleString('vi-VN');
}

function buildTemplates({
  name,
  needBlock,
  budgetBlock,
  noteBlock,
  quotationBlock,
}) {
  const safeName = name || 'Quý khách';

  return {
    'First contact': [
      `Xin chào ${safeName}, tôi liên hệ từ LeadFlow để hỗ trợ${needBlock ? ` về ${needBlock}` : ''}. ${budgetBlock ? `Với ngân sách dự kiến ${budgetBlock}, ` : ''}tôi xin phép gửi anh/chị thông tin sơ bộ và sắp xếp một cuộc trao đổi ngắn 15 phút để hiểu rõ hơn nhu cầu. Anh/chị thuận tiện trao đổi vào khung giờ nào ạ?`,
      `Chào ${safeName}, rất vui được kết nối với anh/chị. ${needBlock ? `Tôi thấy nhu cầu của bên mình về ${needBlock} rất phù hợp với giải pháp của chúng tôi. ` : ''}Anh/chị có thể cho tôi xin 10 phút trong tuần này để chia sẻ thêm và giải đáp các câu hỏi ban đầu không ạ?`,
    ],

    'After quotation': [
      `Xin chào ${safeName}, tôi muốn theo dõi lại báo giá đã gửi${quotationBlock ? ` (trạng thái hiện tại: ${quotationBlock})` : ''}. Anh/chị đã có dịp xem qua chưa và có điểm nào cần tôi làm rõ hoặc điều chỉnh để phù hợp hơn với ngân sách${budgetBlock ? ` ${budgetBlock}` : ''} của mình không ạ?`,
      `Chào ${safeName}, chúc anh/chị một ngày tốt lành. Em xin phép follow-up báo giá đã gửi tuần trước. Nếu cần em hỗ trợ chỉnh sửa hạng mục, áp dụng thêm ưu đãi, hoặc demo lại sản phẩm, anh/chị cứ phản hồi giúp em ạ.`,
    ],

    'Payment reminder': [
      `Xin chào ${safeName}, em xin phép gửi nhắc nhẹ về khoản thanh toán theo báo giá đã được duyệt. Anh/chị vui lòng xác nhận lịch chuyển khoản giúp em để bên em chủ động triển khai phần tiếp theo ạ. Em rất cảm ơn anh/chị!`,
      `Chào ${safeName}, em theo dõi thấy hóa đơn vẫn chưa được hoàn tất. Anh/chị có gặp khó khăn nào trong quá trình thanh toán không ạ? Nếu cần em hỗ trợ chia đợt hoặc gửi lại thông tin tài khoản, anh/chị nhắn lại giúp em.`,
    ],

    'Meeting reminder': [
      `Xin chào ${safeName}, em xin nhắc lịch họp đã hẹn của chúng ta. Em sẽ chuẩn bị thêm các tài liệu liên quan${needBlock ? ` đến ${needBlock}` : ''} để buổi trao đổi hiệu quả nhất. Anh/chị xác nhận giúp em là buổi họp vẫn diễn ra như kế hoạch nhé!`,
      `Chào ${safeName}, em gửi nhắc lịch họp sắp tới giữa hai bên. Nếu anh/chị cần đổi giờ hoặc bổ sung nội dung trao đổi, anh/chị phản hồi giúp em trước 2 tiếng để em sắp xếp chu đáo ạ.`,
    ],

    'Re-engagement': [
      `Xin chào ${safeName}, đã một thời gian từ lần trao đổi gần nhất${noteBlock ? ` (${noteBlock})` : ''}. Bên em vừa cập nhật một số chính sách và tính năng mới có thể phù hợp với nhu cầu của anh/chị. Anh/chị có muốn em gửi bản tóm tắt 1 trang để xem qua không ạ?`,
      `Chào ${safeName}, lâu rồi mình chưa có dịp trao đổi. Nếu hiện tại bên anh/chị vẫn đang cân nhắc giải pháp${needBlock ? ` cho ${needBlock}` : ''}, em xin phép book lại 15 phút để cập nhật các phương án mới nhất cho anh/chị.`,
    ],

    'Thank you message': [
      `Cảm ơn ${safeName} rất nhiều vì đã tin tưởng và đồng hành cùng chúng tôi. Bên em sẽ tiếp tục hỗ trợ chu đáo trong các bước tiếp theo. Nếu anh/chị có bất kỳ phản hồi nào để bên em phục vụ tốt hơn, anh/chị cứ chia sẻ thoải mái ạ.`,
      `Em xin gửi lời cảm ơn chân thành đến ${safeName} vì đã lựa chọn giải pháp của chúng em. Em hy vọng sản phẩm/dịch vụ mang lại giá trị thực tế cho anh/chị. Em luôn sẵn sàng hỗ trợ khi anh/chị cần thêm thông tin.`,
    ],
  };
}

function generateFollowUpMessage(input = {}) {
  const purpose = input.followUpPurpose;
  if (!FOLLOW_UP_PURPOSES.includes(purpose)) {
    const err = new Error(
      `followUpPurpose must be one of: ${FOLLOW_UP_PURPOSES.join(', ')}`
    );
    err.statusCode = 400;
    err.errors = [{ field: 'followUpPurpose', message: err.message }];
    throw err;
  }

  try {
    const name = (input.customerName || '').toString().trim();
    const need = (input.needDescription || '').toString().trim();
    const lastNote = (input.lastNote || '').toString().trim();
    const budgetFormatted = formatBudget(input.budget);
    const quotation = (input.quotationStatus || '').toString().trim();

    const needBlock = need ? need : '';
    const budgetBlock = budgetFormatted ? `${budgetFormatted} VND` : '';
    const noteBlock = lastNote
      ? `gần đây bên mình có chia sẻ: "${lastNote.slice(0, 140)}${lastNote.length > 140 ? '…' : ''}"`
      : '';
    const quotationBlock = quotation ? quotation : '';

    const templates = buildTemplates({
      name,
      needBlock,
      budgetBlock,
      noteBlock,
      quotationBlock,
    });

    const pool = templates[purpose];
    const message = pickRandom(pool);

    if (!message) throw new Error('Empty template pool');

    return {
      message,
      purpose,
      fallback: false,
      meta: {
        language: 'vi',
        usedFields: {
          customerName: !!name,
          needDescription: !!need,
          budget: !!budgetFormatted,
          lastNote: !!lastNote,
          quotationStatus: !!quotation,
          leadStatus: !!input.leadStatus,
        },
      },
    };
  } catch (err) {
    // Fallback: never propagate template-generation failures to the caller.
    const name = (input.customerName || 'Quý khách').toString().trim() || 'Quý khách';
    return {
      message:
        `Xin chào ${name}, em xin phép follow-up về trao đổi gần đây giữa hai bên. ` +
        `Anh/chị có thể cho em biết tiến độ hiện tại và bên em có thể hỗ trợ thêm gì không ạ? Em rất mong nhận được phản hồi.`,
      purpose: FOLLOW_UP_PURPOSES.includes(purpose) ? purpose : null,
      fallback: true,
      error: err.message,
    };
  }
}

module.exports = {
  FOLLOW_UP_PURPOSES,
  scoreLead,
  generateFollowUpMessage,
  lastNoteText,
};
