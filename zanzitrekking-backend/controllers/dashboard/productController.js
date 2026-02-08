const formidable = require("formidable");
const Product = require("../../models/product");
const { responseReturn } = require("../../utilities/response");

class ProductControlller {
  add_product = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "something went wrong" });
      } else {
        let {
          name,
          description,
          discount,
          price,
          brand,
          stock,
          shopName,
          product,
        } = fields;
        name = name.trim();
        const slug = name.split(" ").join("-");
        const { images } = files;

        // cloudinary.config({
        //   cloud_name: process.env.cloud_name,
        //   api_key: process.env.api_key,
        //   api_secret: process.env.api_secret,
        //   secure: true,
        // });

        try {
          let allImageUrl = [];
          if (!Array.isArray(images)) {
            // const result = await cloudinary.uploader.upload(images.filepath, {
            //   folder: "products",
            // });
            // allImageUrl.push(result.url);
          } else {
            for (const image of images) {
              // const result = await cloudinary.uploader.upload(image.filepath, {
              //   folder: "products",
              // });
              // allImageUrl.push(result.url);
            }
          }

          const product = await Product.create({
            sellerId: id,
            name,
            slug,
            shopName,
            product: product.trim(),
            description: description.trim(),
            stock: +stock,
            discount: +discount,
            price: +price,
            images: allImageUrl,
            brand: brand.trim(),
          });
          return responseReturn(res, 202, {
            product,
            message: "Product Added successfully",
          });
        } catch (error) {
          return responseReturn(res, 500, { error: error.message });
        }
      }
    });
  };

  get_products = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }
      if (searchValue && page && parPage) {
        const products = await Product.find({
          $text: { $search: searchValue },
        })
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalProduct = await Product.find({
          $text: { $search: searchValue },
        }).countDocuments();
        responseReturn(res, 200, {
          totalProduct,
          products,
        });
      } else if (searchValue === "" && page && parPage) {
        const products = await Product.find({})
          .skip(skipPage)
          .limit(parPage)
          .sort({ createdAt: -1 });
        const totalProduct = await Product.find({}).countDocuments();
        return responseReturn(res, 200, {
          totalProduct,
          products,
        });
      } else {
        const products = await Product.find({}).sort({ createdAt: -1 });
        const totalProduct = await Product.find({}).countDocuments();
        return responseReturn(res, 200, {
          totalProduct,
          products,
          message: "products successfully fetched",
        });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  get_product = async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return responseReturn(res, 404, { error: "Product Not Found" });
      }
      return responseReturn(res, 200, {
        message: "Product Fetch Successful",
        product,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  update_product = async (req, res) => {
    const newProduct = req.body;

    // Log the incoming product data for debugging purposes

    if (!newProduct.productId) {
      return responseReturn(res, 400, { error: "Product ID is required" });
    }

    try {
      const slug = newProduct.name.trim().split(" ").join("-");
      const oldProduct = await Product.findById(newProduct.productId);

      if (!oldProduct) {
        return responseReturn(res, 404, { error: "Product Not Found" });
      }

      const product = await Product.findByIdAndUpdate(
        newProduct.productId,
        { ...newProduct, images: oldProduct.images, slug },
        { new: true }
      );

      if (!product) {
        return responseReturn(res, 404, { error: "Product Not Found" });
      }

      return responseReturn(res, 200, {
        message: "Product Update Successful",
        product,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  update_product_image = async (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      const { oldImage, productId } = fields;
      const { newImage } = files;

      if (err) {
        return responseReturn(res, 400, { error: err.message });
      } else {
        try {
          // cloudinary.config({
          //   cloud_name: process.env.cloud_name,
          //   api_key: process.env.api_key,
          //   api_secret: process.env.api_secret,
          //   secure: true,
          // });

          // Extract public ID of the old image from the URL
          const oldImagePublicId = oldImage
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          // Delete the old image from Cloudinary
          // await cloudinary.uploader.destroy(oldImagePublicId);

          // Upload the new image
          // const result = await cloudinary.uploader.upload(newImage.filepath, {
          //   folder: "products",
          // });

          if (result) {
            let { images } = await Product.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await Product.findByIdAndUpdate(
              productId,
              { images },
              { new: true }
            );
            const product = await Product.findById(productId);
            return responseReturn(res, 200, {
              product,
              message: "Product Image Updated",
            });
          } else {
            return responseReturn(res, 404, {
              error: "Image Upload Failed",
            });
          }
        } catch (error) {
          return responseReturn(res, 500, { error: error.message });
        }
      }
    });
  };
}

module.exports = new ProductControlller();
