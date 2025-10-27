const DemandResponse = require('../models/demandResponses.model');
const Demand = require('../models/demands.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { notifyDemandResponse, notifyResponseStatus } = require('../utils/notificationHelpers');
const { notifyNewDemandResponse, notifyDemandResponseStatusUpdate } = require('../socket');

/**
 * إنشاء رد جديد على طلب رحلة
 * POST /api/demand-responses
 * للسائقين فقط
 */
const createDemandResponse = asyncHandler(async (req, res) => {
  const { demandId, offerPrice, availableSeats, message } = req.body;
  const driverId = req.user.id;

  // التحقق من وجود الطلب
  const demand = await Demand.findById(demandId);
  if (!demand) {
    throw new AppError('الطلب غير موجود', 404);
  }

  // التحقق من أن الطلب لا يزال نشطاً
  if (!demand.isActive) {
    throw new AppError('هذا الطلب غير نشط حالياً', 400);
  }

  // التحقق من أن السائق لا يرد على طلبه الخاص (في حالة خطأ)
  if (demand.passengerId === driverId) {
    throw new AppError('لا يمكنك الرد على طلبك الخاص', 400);
  }

  // التحقق من عدم وجود رد سابق من نفس السائق
  const existingResponse = await DemandResponse.existsByDemandAndDriver(
    demandId,
    driverId
  );

  if (existingResponse) {
    throw new AppError('لقد قمت بالرد على هذا الطلب من قبل', 400);
  }

  // التحقق من أن السعر المقترح معقول
  if (demand.budgetMax && offerPrice > demand.budgetMax) {
    // تحذير فقط، لكن نسمح بالإنشاء
    console.log(`السائق ${driverId} قدم سعر ${offerPrice} أعلى من الميزانية ${demand.budgetMax}`);
  }

  // التحقق من أن المقاعد المتاحة كافية
  if (availableSeats < demand.seats) {
    throw new AppError(
      `عدد المقاعد المتاحة غير كافٍ. الطلب يحتاج ${demand.seats} مقعد/مقاعد`,
      400
    );
  }

  // إنشاء الرد
  const response = await DemandResponse.create({
    demandId,
    driverId,
    offerPrice,
    availableSeats,
    message
  });

  // إرسال إشعار للراكب
  await notifyDemandResponse(demandId, driverId, req.user.name);

  // Send real-time notification to passenger via Socket.io
  const io = req.app.get('io');
  if (io) {
    notifyNewDemandResponse(io, demand.passengerId, {
      ...response.toJSON(),
      fromCity: demand.fromCity,
      toCity: demand.toCity,
      driverName: req.user.name || `${req.user.firstName} ${req.user.lastName}`
    });
  }

  res.status(201).json({
    success: true,
    message: 'تم إرسال عرضك بنجاح',
    data: {
      response: response.toJSON()
    }
  });
});

/**
 * جلب جميع الردود على طلب معين
 * GET /api/demand-responses/demand/:demandId
 * للراكب صاحب الطلب أو السائقين
 */
const getResponsesByDemand = asyncHandler(async (req, res) => {
  const { demandId } = req.params;

  // التحقق من وجود الطلب
  const demand = await Demand.findById(demandId);
  if (!demand) {
    throw new AppError('الطلب غير موجود', 404);
  }

  // التحقق من الصلاحيات: صاحب الطلب أو السائق الذي لديه رد
  const isOwner = demand.passengerId === req.user.id;
  const isDriver = req.user.isDriver || req.user.is_driver;

  if (!isOwner && !isDriver) {
    throw new AppError('ليس لديك صلاحية لعرض هذه الردود', 403);
  }

  // جلب جميع الردود
  const responses = await DemandResponse.findByDemandId(demandId);

  // إذا كان المستخدم سائق وليس صاحب الطلب، أظهر له رده فقط
  let filteredResponses = responses;
  if (!isOwner && isDriver) {
    filteredResponses = responses.filter(r => r.driverId === req.user.id);
  }

  // عد الردود حسب الحالة
  const statusCounts = await DemandResponse.countByStatus(demandId);

  res.json({
    success: true,
    data: {
      demand: {
        id: demand.id,
        fromCity: demand.fromCity,
        toCity: demand.toCity,
        passengerId: demand.passengerId
      },
      responses: filteredResponses.map(r => r.toJSON()),
      stats: statusCounts
    }
  });
});

/**
 * جلب ردود السائق الحالي على جميع الطلبات
 * GET /api/demand-responses/my-responses
 * للسائقين فقط
 */
const getMyResponses = asyncHandler(async (req, res) => {
  const driverId = req.user.id;

  // جلب جميع ردود السائق
  const responses = await DemandResponse.findByDriverId(driverId);

  // تجميع الردود حسب الحالة
  const groupedByStatus = {
    pending: responses.filter(r => r.status === 'pending'),
    accepted: responses.filter(r => r.status === 'accepted'),
    rejected: responses.filter(r => r.status === 'rejected'),
    cancelled: responses.filter(r => r.status === 'cancelled')
  };

  res.json({
    success: true,
    data: {
      responses: responses.map(r => r.toJSON()),
      groupedByStatus: {
        pending: groupedByStatus.pending.map(r => r.toJSON()),
        accepted: groupedByStatus.accepted.map(r => r.toJSON()),
        rejected: groupedByStatus.rejected.map(r => r.toJSON()),
        cancelled: groupedByStatus.cancelled.map(r => r.toJSON())
      },
      stats: {
        total: responses.length,
        pending: groupedByStatus.pending.length,
        accepted: groupedByStatus.accepted.length,
        rejected: groupedByStatus.rejected.length,
        cancelled: groupedByStatus.cancelled.length
      }
    }
  });
});

/**
 * تحديث حالة رد (قبول أو رفض)
 * PATCH /api/demand-responses/:id/status
 * للراكب صاحب الطلب فقط
 */
const updateResponseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // التحقق من صحة الحالة
  const validStatuses = ['accepted', 'rejected', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('حالة غير صالحة', 400);
  }

  // جلب الرد
  const response = await DemandResponse.findById(id);
  if (!response) {
    throw new AppError('الرد غير موجود', 404);
  }

  // جلب الطلب للتحقق من الصلاحيات
  const demand = await Demand.findById(response.demandId);
  if (!demand) {
    throw new AppError('الطلب غير موجود', 404);
  }

  // التحقق من الصلاحيات
  // القبول/الرفض: فقط صاحب الطلب
  // الإلغاء: السائق صاحب الرد
  if (status === 'cancelled') {
    if (response.driverId !== req.user.id) {
      throw new AppError('يمكنك فقط إلغاء ردودك الخاصة', 403);
    }
  } else {
    if (demand.passengerId !== req.user.id) {
      throw new AppError('يمكن لصاحب الطلب فقط قبول أو رفض الردود', 403);
    }
  }

  // التحقق من أن الرد لا يزال قيد الانتظار
  if (response.status !== 'pending') {
    throw new AppError(`هذا الرد ${response.status === 'accepted' ? 'مقبول' : response.status === 'rejected' ? 'مرفوض' : 'ملغي'} بالفعل`, 400);
  }

  // تحديث الحالة
  const updatedResponse = await DemandResponse.updateStatus(id, status);

  // إذا تم قبول الرد، رفض جميع الردود الأخرى
  if (status === 'accepted') {
    const rejectedCount = await DemandResponse.rejectOtherResponses(
      response.demandId,
      id
    );
    console.log(`تم رفض ${rejectedCount} رد/ردود أخرى على الطلب ${response.demandId}`);

    // يمكن أيضاً تعطيل الطلب نفسه (اختياري)
    await Demand.update(response.demandId, { is_active: false });
  }

  // إرسال إشعار للسائق عند قبول/رفض رده (ليس عند الإلغاء)
  if (status === 'accepted' || status === 'rejected') {
    await notifyResponseStatus(id, status === 'accepted');
  }

  // Send real-time notification to driver via Socket.io
  const io = req.app.get('io');
  if (io && (status === 'accepted' || status === 'rejected')) {
    notifyDemandResponseStatusUpdate(io, response.driverId, {
      ...updatedResponse.toJSON(),
      fromCity: demand.fromCity,
      toCity: demand.toCity,
      status: status
    });
  }

  res.json({
    success: true,
    message: status === 'accepted'
      ? 'تم قبول العرض بنجاح'
      : status === 'rejected'
        ? 'تم رفض العرض'
        : 'تم إلغاء عرضك',
    data: {
      response: updatedResponse.toJSON()
    }
  });
});

/**
 * حذف رد
 * DELETE /api/demand-responses/:id
 * للسائق صاحب الرد فقط
 */
const deleteDemandResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // جلب الرد
  const response = await DemandResponse.findById(id);
  if (!response) {
    throw new AppError('الرد غير موجود', 404);
  }

  // التحقق من الصلاحيات
  if (response.driverId !== req.user.id) {
    throw new AppError('يمكنك فقط حذف ردودك الخاصة', 403);
  }

  // لا يمكن حذف رد مقبول
  if (response.status === 'accepted') {
    throw new AppError('لا يمكن حذف رد مقبول. يمكنك إلغاؤه بدلاً من ذلك.', 400);
  }

  // حذف الرد
  await DemandResponse.delete(id);

  res.json({
    success: true,
    message: 'تم حذف الرد بنجاح'
  });
});

/**
 * جلب رد واحد بالمعرف
 * GET /api/demand-responses/:id
 */
const getResponseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const response = await DemandResponse.findById(id);
  if (!response) {
    throw new AppError('الرد غير موجود', 404);
  }

  // التحقق من الصلاحيات
  const demand = await Demand.findById(response.demandId);
  const isOwner = demand.passengerId === req.user.id;
  const isResponseOwner = response.driverId === req.user.id;

  if (!isOwner && !isResponseOwner) {
    throw new AppError('ليس لديك صلاحية لعرض هذا الرد', 403);
  }

  res.json({
    success: true,
    data: {
      response: response.toJSON()
    }
  });
});

module.exports = {
  createDemandResponse,
  getResponsesByDemand,
  getMyResponses,
  updateResponseStatus,
  deleteDemandResponse,
  getResponseById
};
