const express = require('express');
const router = express.Router();
const db = require('../../database/knex');

// GET /api/v1/documents - Master Document Vault
router.get('/', async (req, res, next) => {
  try {
    const { organizationId } = req.tenant;
    const { documentType } = req.query;

    let query = db('staff_documents')
      .join('staff', 'staff_documents.staff_id', 'staff.id')
      .join('staff_profiles', 'staff.id', 'staff_profiles.staff_id')
      .where('staff.organization_id', organizationId)
      .select(
        'staff_documents.*',
        'staff_profiles.first_name',
        'staff_profiles.last_name',
        'staff_profiles.official_email',
        'staff.employee_code'
      );

    if (documentType) {
      query = query.where('staff_documents.document_type', documentType);
    }

    const docs = await query.orderBy('staff_documents.created_at', 'desc');
    res.json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
