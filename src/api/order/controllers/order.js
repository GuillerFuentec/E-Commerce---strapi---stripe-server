'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({strapi}) => ({
    async paymentOrder(ctx) {
        ctx.body = "Payment has been successfully processed"
    },
}));
