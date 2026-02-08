const formidable = require("formidable");
const Seller = require("../../models/seller");
const { responseReturn } = require("../../utilities/response");

class SellerControllers {
  request_seller_get = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    const skipPage = +parPage * (+page - 1);
    try {
      if (searchValue) {
      } else {
        const sellers = await Seller.find({ status: "pending" })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalSeller = await Seller.find({
          status: "pending",
        }).countDocuments();
        responseReturn(res, 200, {
          totalSeller,
          sellers,
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  seller_get = async (req, res) => {
    const { sellerId: id } = req.params;
    try {
      if (id) {
        const seller = await Seller.findById(id);
        responseReturn(res, 200, { seller });
      } else {
        responseReturn(res, 404, { error: "No Id was provided" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
  seller_status_update = async (req, res) => {
    const { sellerId, sellerStatus } = req.body;
    try {
      const seller = await Seller.findByIdAndUpdate(sellerId, {
        status: sellerStatus,
      });
      if (seller) {
        responseReturn(res, 200, {
          seller,
          message: "Seller Status Update Successfull",
        });
      } else {
        responseReturn(res, 400, {
          error: "Seller Status Update not Successfull",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
}

module.exports = new SellerControllers();
