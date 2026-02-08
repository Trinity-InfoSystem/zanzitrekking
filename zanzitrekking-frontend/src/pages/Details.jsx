"use client";

import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useEffect, useState } from "react";
import Rating from "../components/products/Rating";
import { FaFacebook, FaGithub, FaHeart, FaLinkedin, FaTwitter } from "react-icons/fa";
import Reviews from "../components/products/Reviews";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useDispatch, useSelector } from "react-redux";
import { product_details } from "../store/reducers/homeReducer";
import BreadCrumb from "../components/common/BreadCrumb";

const Details = () => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 6,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 6,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 4,
    },
    mdtablet: {
      breakpoint: { max: 991, min: 464 },
      items: 4,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 3,
    },
    smmobile: {
      breakpoint: { max: 640, min: 0 },
      items: 2,
    },
    xsmobile: {
      breakpoint: { max: 440, min: 0 },
      items: 1,
    },
  };
  const { categories } = useSelector((state) => state.home);
  const { product } = useSelector((state) => state.home);
  const dispatch = useDispatch();

  const [state, setState] = useState("reviews");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const changeImg = (img) => {
    setImage(img);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const { productId } = useParams();

  useEffect(() => {
    if (product?.images?.length > 0) {
      setImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    dispatch(product_details(productId));
  }, [productId, dispatch]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header categories={categories} />
      <BreadCrumb title='Product Details' />

      {/* Breadcrumbs */}
      {/* <section className="py-3 border-b border-gray-200">
        <div className="md:px-12 px-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Link to="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
            <span className="pt-1">
              <IoIosArrowForward className="text-xs" />
            </span>
            <Link to="/category" className="hover:text-teal-600 transition-colors">
              Category
            </Link>
            <span className="pt-1">
              <IoIosArrowForward className="text-xs" />
            </span>
            <span className="font-medium text-black">{product.name}</span>
          </div>
        </div>
      </section> */}

      {/* Product Details */}
      <section className="py-10">
        <div className="md:px-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Product Images */}
            <div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  className="h-[400px] w-full object-contain p-4"
                  src={image || "/placeholder.svg"}
                  alt={product.name}
                />
              </div>
              <div className="mt-4">
                {product?.images && (
                  <Carousel
                    responsive={responsive}
                    autoPlay={true}
                    infinite={true}
                    transitionDuration={500}
                    containerClass="pb-5"
                  >
                    {product?.images?.map((img, i) => (
                      <div key={i} onClick={() => changeImg(img)} className="px-1">
                        <img
                          className="h-[100px] w-full object-cover rounded-md cursor-pointer border-2 hover:border-teal-500 transition-all duration-200"
                          src={img || "/placeholder.svg"}
                          alt=""
                        />
                      </div>
                    ))}
                  </Carousel>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    <Rating ratings={product.rating} />
                  </div>
                  <span className="text-teal-600">(24 reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 text-2xl font-bold">
                {product?.discount !== 0 ? (
                  <>
                    <h2 className="line-through text-gray-400">${product.price}</h2>
                    <h2 className="text-rose-600">
                      ${product.price - Math.floor((product?.price * product?.discount) / 100)}
                    </h2>
                    <span className="ml-2 text-sm font-normal px-2 py-1 bg-rose-100 text-rose-600 rounded-full">
                      {product?.discount}% OFF
                    </span>
                  </>
                ) : (
                  <h2 className="text-black">${product.price}</h2>
                )}
              </div>

              {/* Description */}
              <div className="text-gray-600 leading-relaxed">
                <p>
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Delectus distinctio, sit reiciendis
                  aspernatur autem deserunt quasi deleniti perspiciatis, quia est ea quidem maiores, officia earum
                  laborum veritatis dicta rerum natus?
                </p>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 py-6 border-b border-gray-200">
                {product?.stock ? (
                  <>
                    <div className="flex h-12 items-center rounded-lg overflow-hidden border border-gray-300">
                      <button
                        onClick={decreaseQuantity}
                        className="w-12 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                      >
                        -
                      </button>
                      <div className="w-12 h-full flex items-center justify-center font-medium">{quantity}</div>
                      <button
                        onClick={increaseQuantity}
                        className="w-12 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                      >
                        +
                      </button>
                    </div>
                    <button className="h-12 px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg">
                      Add To Cart
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">Out of Stock</div>
                )}
                <button className="h-12 w-12 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-600 transition-all duration-200">
                  <FaHeart />
                </button>
              </div>

              {/* Product Meta */}
              <div className="grid grid-cols-[120px_1fr] gap-4 py-4">
                <span className="font-medium text-black">Availability</span>
                <span className={`${product?.stock ? "text-teal-600" : "text-rose-600"}`}>
                  {product?.stock ? `In Stock (${product?.stock})` : "Out of Stock"}
                </span>

                <span className="font-medium text-black">Share On</span>
                <ul className="flex items-center gap-2">
                  <li>
                    <a
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-teal-600 transition-colors"
                      href="#"
                      aria-label="Share on Facebook"
                    >
                      <FaFacebook />
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-teal-600 transition-colors"
                      href="#"
                      aria-label="Share on Twitter"
                    >
                      <FaTwitter />
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-teal-600 transition-colors"
                      href="#"
                      aria-label="Share on LinkedIn"
                    >
                      <FaLinkedin />
                    </a>
                  </li>
                  <li>
                    <a
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-teal-600 transition-colors"
                      href="#"
                      aria-label="Share on GitHub"
                    >
                      <FaGithub />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {product?.stock ? (
                  <button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                    Buy Now
                  </button>
                ) : (
                  ""
                )}
                <Link
                  to="#"
                  className="h-12 px-8 bg-emerald-600 hover:bg-black text-white rounded-lg transition-all duration-200 font-medium flex items-center shadow-md hover:shadow-lg"
                >
                  Chat Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews and Description */}
      <section className="py-10 bg-white">
        <div className="md:px-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-10">
            <div>
              {/* Tabs */}
              <div className="flex mb-6 border-b">
                <button
                  onClick={() => setState("reviews")}
                  className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                    state === "reviews"
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-600 hover:text-teal-600"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setState("description")}
                  className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                    state === "description"
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-600 hover:text-teal-600"
                  }`}
                >
                  Description
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {state === "reviews" ? (
                  <Reviews />
                ) : (
                  <div className="prose max-w-none text-gray-600">
                    <p>
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium voluptatum ad sed quidem
                      laborum nostrum odio iste sit voluptatem nisi maxime perferendis aliquam ab omnis deserunt
                      temporibus ipsa, commodi dolor!
                    </p>
                    <p>
                      Nihil alias laborum necessitatibus laudantium accusamus, et eligendi velit amet dignissimos
                      officiis minima doloribus quia suscipit porro, iure quis ut qui eos? Delectus iusto quis eveniet
                      voluptatem tempore a id!
                    </p>
                    <p>
                      Sequi accusamus delectus porro provident cum veritatis, fugit architecto tempore nobis culpa
                      veniam nisi assumenda officia ullam minima nam modi ratione odit tenetur minus rerum aliquam
                      mollitia eligendi. Quia, aut!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* From Easy Shop */}
            <div>
              <div className="bg-gray-100 rounded-t-lg px-4 py-3">
                <h2 className="font-bold text-black">From Easy Shop</h2>
              </div>
              <div className="bg-white rounded-b-lg shadow-sm p-4 grid gap-6">
                {[1, 2, 3].map((ele, i) => (
                  <div key={i} className="group">
                    <Link className="block">
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          className="h-[200px] w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          src={`/images/products/${ele}.webp`}
                          alt=""
                        />
                        {product?.discount !== 0 && (
                          <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-xs font-semibold text-white">
                            {product?.discount}%
                          </div>
                        )}
                      </div>
                      <h2 className="mt-2 font-medium text-black group-hover:text-teal-600 transition-colors">
                        Product Name
                      </h2>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex">
                          <Rating ratings="4.5" />
                        </div>
                        <span className="font-bold text-black">$434</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-10 bg-gray-50">
        <div className="md:px-12 px-4">
          <h2 className="text-2xl font-bold text-black mb-8">Related Products</h2>

          <Swiper
            slidesPerView="auto"
            breakpoints={{
              1280: {
                slidesPerView: 4,
              },
              768: {
                slidesPerView: 3,
              },
              640: {
                slidesPerView: 2,
              },
            }}
            spaceBetween={24}
            loop={true}
            pagination={{
              clickable: true,
              el: ".custom_bullet",
            }}
            modules={[Pagination]}
            className="pb-12 emerald-pagination"
          >
            {[1, 2, 3, 4, 5, 6].map((p, i) => (
              <SwiperSlide key={i}>
                <div className="bg-white border border-gray-100  rounded-lg  overflow-hidden group h-full">
                  <Link className="block h-full">
                    <div className="relative h-[220px] overflow-hidden">
                      <img
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={`/images/products/${p}.webp`}
                        alt=""
                      />
                      {product?.discount !== 0 && (
                        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-xs font-semibold text-white">
                          {product?.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-black group-hover:text-teal-600 transition-colors">
                        Product Name
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex">
                          <Rating ratings={4.5} />
                        </div>
                        <span className="font-bold text-black">$434</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="pt-12 flex w-full items-center justify-center">
            <div className="custom_bullet !w-auto flex justify-center gap-2"></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Details;
