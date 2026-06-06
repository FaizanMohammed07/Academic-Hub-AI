const getPagination = (query) => {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.min(100, parseInt(query.limit, 10) || 20);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

const buildSort = (query, defaultField = 'createdAt', defaultOrder = -1) => {
  const field = query.sortBy || defaultField;
  const order = query.order === 'asc' ? 1 : defaultOrder;
  return { [field]: order };
};

module.exports = { getPagination, buildSort };
