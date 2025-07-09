function requireTenant(req, res, next) {
    const exemptRoutes = [
        // POS
        '/api/backoffice',
        '/api/create_store',
        '/api/log_error',
        '/api/website_login',
        '/api/pos_login',
        '/api/check_username_email',
        '/api/stripe_webhook',
        '/api/support',
        '/api/view_ticket_thread',

        // DEVOPS
        '/api/devops_error_logs',

        '/api/devops_get_stores',
        '/api/devops_get_store',
        '/api/devops_submit_ticket',
        '/api/devops_get_tickets',
        '/api/devops_get_ticket_thread',
        '/api/devops_reply_ticket',
        '/api/devops_get_user_tickets',
        '/api/devops_update_ticket_status'
    ]


    if (exemptRoutes.some(route => req.originalUrl.startsWith(route))) {
        return next()
    }

    const tenantId = req.headers['x-tenant-id']

    if (!tenantId) {
        console.log("requireTenant.js -> 🚫 Missing x-tenant-id header")
        return res.status(400).json({ error: 'Missing tenant ID' })
    }

    req.tenant_id = tenantId
    next()
}

module.exports = requireTenant

