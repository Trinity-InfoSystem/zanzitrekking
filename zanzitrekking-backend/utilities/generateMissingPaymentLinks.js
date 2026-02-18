const Order = require("../models/order");
const logger = require('./logger');
const Trip = require("../models/trip");
const weTravelService = require("./wetravelService");
const {
  isTripDateInPast,
  checkBookingRestriction,
} = require("./bookingRestrictions");

/**
 * Find orders without payment links and generate them
 */
const generateMissingPaymentLinks = async () => {
  try {
    logger.info("[Payment Links] Starting missing payment links generation...");

    // Find all orders with processing payment status but no payment link
    const ordersWithoutLinks = await Order.find({
      "payment.status": "processing",
      $or: [
        { "payment.weTravelPaymentLink": { $exists: false } },
        { "payment.weTravelPaymentLink": "" },
        { "payment.weTravelPaymentLink": null },
      ],
    }).lean();

    logger.info(
      `[Payment Links] Found ${ordersWithoutLinks.length} orders without payment links`
    );

    let linksGenerated = 0;
    let linksFailed = 0;
    let linksSkipped = 0;

    for (const order of ordersWithoutLinks) {
      try {
        // TESTING: Check if this is the test order
        const isTestOrder = order.orderNumber === "ZT-20251008-0004";

        if (isTestOrder) {
          logger.info(`[Payment Links] 🧪 TESTING ORDER: ${order.orderNumber}`);
          logger.info(`[Payment Links] 🧪 Order details:`, {
            orderNumber: order.orderNumber,
            cartItemsCount: order.cartItems?.length || 0,
            paymentStatus: order.payment?.status,
          });
        }

        if (!isTestOrder) {
          logger.info(
            `[Payment Links] Generating link for order ${order.orderNumber}...`
          );
        }

        // Check if all trips in cartItems still exist in the database
        if (order.cartItems && order.cartItems.length > 0) {
          // Verify all trips exist
          const tripIds = order.cartItems
            .map((item) => item.tripId)
            .filter((id) => id); // Filter out null/undefined

          if (tripIds.length > 0) {
            const existingTrips = await Trip.find({
              _id: { $in: tripIds },
            }).select("_id");

            const existingTripIds = new Set(
              existingTrips.map((trip) => trip._id.toString())
            );
            const missingTripIds = tripIds.filter(
              (id) => !existingTripIds.has(id.toString())
            );

            if (missingTripIds.length > 0) {
              linksSkipped++;
              if (isTestOrder) {
                logger.info(
                  `[Payment Links] 🧪 ⏭️  Skipping test order: Some trips no longer exist in database (tripIds: ${missingTripIds.join(", ")})`
                );
              } else {
                logger.info(
                  `[Payment Links] ⏭️  Skipping order ${order.orderNumber}: Some trips no longer exist in database (tripIds: ${missingTripIds.join(", ")})`
                );
              }
              continue;
            }
          }

          let hasRestrictionIssue = false;
          let restrictionDetails = [];

          for (const cartItem of order.cartItems) {
            if (isTestOrder) {
              logger.info(
                `[Payment Links] 🧪 Checking booking restrictions for cart item: ${cartItem.mainTitle}`
              );
              logger.info(`[Payment Links] 🧪 Cart Item:`, {
                mainTitle: cartItem.mainTitle,
                selectedCategory: cartItem.selectedCategory,
                startingDate: cartItem.startingDate,
                tripId: cartItem.tripId,
              });
            }

            // Only enable verbose logging for test order ZT-20251008-0004
            const restriction = await checkBookingRestriction(
              cartItem,
              null,
              isTestOrder
            );
            restrictionDetails.push({
              itemTitle: cartItem.mainTitle,
              selectedCategory: cartItem.selectedCategory,
              restriction,
            });

            if (isTestOrder) {
              logger.info(`[Payment Links] 🧪 Booking Restriction Result:`, {
                allowed: restriction.allowed,
                warning: restriction.warning,
                daysUntilTrip: restriction.daysUntilTrip,
              });
            }

            if (!restriction.allowed) {
              hasRestrictionIssue = true;
              if (isTestOrder) {
                logger.info(
                  `[Payment Links] 🧪 ⚠️  Booking restriction failed for item "${cartItem.mainTitle}": ${restriction.warning}`
                );
              }
            } else if (restriction.warning) {
              if (isTestOrder) {
                logger.info(
                  `[Payment Links] 🧪 ⚠️  Booking restriction warning for item "${cartItem.mainTitle}": ${restriction.warning}`
                );
              }
            }
          }

          // If any item has a restriction that disallows booking, skip this order
          if (hasRestrictionIssue) {
            linksSkipped++;
            if (isTestOrder) {
              logger.info(
                `[Payment Links] 🧪 ⏭️  Skipping test order: Booking restrictions not met`
              );
              logger.info(
                `[Payment Links] 🧪 Restriction details:`,
                JSON.stringify(restrictionDetails, null, 2)
              );
            }
            continue;
          }
        }

        // Format order data for WeTravel
        const orderData = weTravelService.formatOrderForPaymentLink(order);

        if (isTestOrder) {
          logger.info(`[Payment Links] 🧪 Formatted order data:`, {
            tripTitle: orderData.tripTitle,
            startDate: orderData.startDate,
            endDate: orderData.endDate,
            totalAmount: orderData.totalAmount,
            daysBeforeDeparture: orderData.daysBeforeDeparture,
          });
        }

        // Check if trip date is in the past - skip if so
        if (isTripDateInPast(orderData.startDate)) {
          linksSkipped++;
          if (isTestOrder) {
            logger.info(
              `[Payment Links] 🧪 ⏭️  Skipping test order: Trip start date (${orderData.startDate}) is in the past`
            );
          }
          continue;
        }

        // Create payment link
        if (isTestOrder) {
          logger.info(
            `[Payment Links] 🧪 Creating payment link for test order...`
          );
        }

        const weTravelResponse = await weTravelService.createPaymentLink(
          orderData
        );

        // Update order with payment link
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            "payment.weTravelPaymentLink": weTravelResponse.trip.url,
            "payment.weTravelTripUuid": weTravelResponse.trip.uuid,
            "payment.weTravelTripUrl": weTravelResponse.trip.url,
          },
        });

        linksGenerated++;
        if (isTestOrder) {
          logger.info(
            `[Payment Links] 🧪 ✅ Link generated for test order ${order.orderNumber}: ${weTravelResponse.trip.url}`
          );
          logger.info(`[Payment Links] 🧪 Payment link details:`, {
            url: weTravelResponse.trip.url,
            uuid: weTravelResponse.trip.uuid,
          });
        }
      } catch (error) {
        linksFailed++;
        logger.error(
          `[Payment Links] ❌ Failed to generate link for order ${order.orderNumber}:`,
          error.message
        );
      }
    }

    logger.info(
      `[Payment Links] Job complete. Generated: ${linksGenerated}, Failed: ${linksFailed}, Skipped: ${linksSkipped}`
    );

    return {
      success: true,
      linksGenerated,
      linksFailed,
      linksSkipped,
      totalOrders: ordersWithoutLinks.length,
    };
  } catch (error) {
    logger.error("[Payment Links] Error in missing payment links job:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  generateMissingPaymentLinks,
};
