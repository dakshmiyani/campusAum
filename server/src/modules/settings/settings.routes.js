const express = require('express');
const router = express.Router();
const db = require('../../database/knex');

// GET /api/v1/settings/users
router.get('/users', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const users = await db('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .where('users.organization_id', organizationId)
      .select('users.id', 'users.email', 'users.is_active', 'users.last_login_at', 'users.created_at', 'roles.name as role_name');

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/settings/roles - Roles & RBAC Permission Matrix
router.get('/roles', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const roles = await db('roles').where(function () {
      this.where('organization_id', organizationId).orWhereNull('organization_id');
    });

    const permissions = await db('permissions');

    for (const r of roles) {
      const rp = await db('role_permissions').where('role_id', r.id).select('permission_id');
      r.permissionIds = rp.map((p) => p.permission_id);
    }

    res.json({ success: true, data: { roles, permissions } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/settings/audit-logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const logs = await db('audit_logs')
      .where('organization_id', organizationId)
      .orderBy('created_at', 'desc')
      .limit(50);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
