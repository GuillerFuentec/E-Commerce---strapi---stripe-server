"use strict";
// @ts-ignore
const stripe = require("stripe")(
  "sk_test_51PZwalK8fe8HkvYDFTZUCMGwAshpryEPxWARY7omvmfEYnPAqaAtQyHJ0a6yAZksX15r5VZLgIrSsMDeTEqio7co00cLvJBq2g"
);

const calcDiscount = (discount, price) => {
  if (!discount) return price;

  const discountAmount = (price * discount) / 100;
  const result = price - discountAmount;

  return result.toFixed(2);
};

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async paymentOrder(ctx) {
    // @ts-ignore
    const { token, products, idUser, addressShipping } = ctx.request.body;

    // Calculo de Payment
    let totalPayment = 0;
    products.forEach((product) => {
      const priceTemp = calcDiscount(
        product.attributes.discount,
        product.attributes.price
      );

      totalPayment += Number(priceTemp) * product.quantity;
    });

    // Payment config
    const charge = await stripe.charges.create({
      amount: Math.round(totalPayment * 100),
      currency: "usd",
      source: token.id,
      description: `User ID: ${idUser}`,
    });
    // Datos de la orden
    const data = {
      products,
      user: idUser,
      totalPayment,
      idPayment: charge.id,
      addressShipping,
    };
      // Verificacion de datos de orden
      const model = strapi.contentTypes["api::order.order"];
      const validData = await strapi.entityValidator.validateEntityCreation(
        model,
        // @ts-ignore
        data
      );
      // Save data en la DB
      const entry = await strapi.db
          .query("api::order.order")
          .create({data: validData});

      return entry;
  },
}));
