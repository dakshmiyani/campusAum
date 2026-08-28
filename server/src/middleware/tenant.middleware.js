/**
 * Tenant Isolation Middleware for CampusAUM
 * Enforces organization_id, campus_id, institute_id context on all database operations.
 */
function tenantResolver(req, res, next) {
  // Extract tenant scope from headers or query parameters (with fallback to default seed tenant)
  const organizationId = req.headers['x-organization-id'] || req.query.organization_id || 'org-apex-01';
  const campusId = req.headers['x-campus-id'] || req.query.campus_id || 'campus-main-01';
  const instituteId = req.headers['x-institute-id'] || req.query.institute_id || 'inst-iet-01';

  req.tenant = {
    organizationId,
    campusId,
    instituteId,
  };

  next();
}

module.exports = tenantResolver;
