'use strict';

const Setting = require('../models/setting.model');
const apiResponse = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');

// ---------------------------------------------------------------------------
// getAllSettings — admin only
// ---------------------------------------------------------------------------

const getAllSettings = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const settings = await Setting.find(filter).sort({ category: 1, key: 1 });
    return apiResponse.success(res, settings, 'Settings');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// updateSetting — admin only
// ---------------------------------------------------------------------------

const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) throw AppError.badRequest('value is required');

    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id, ...(description ? { description } : {}) },
      { new: true, runValidators: true }
    );

    if (!setting) throw AppError.notFound(`Setting "${key}" not found`);

    return apiResponse.success(res, setting, 'Setting updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllSettings, updateSetting };
