const success = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const created = (res, data, message = 'Created successfully') =>
  success(res, data, message, 201);

const paginated = (res, data, { page, limit, total }) =>
  success(res, data, 'Success', 200, {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  });

const noContent = (res) => res.status(204).send();

module.exports = { success, created, paginated, noContent };
