class QueryProducts {
  products = [];
  query = {};
  constructor(products, query) {
    this.products = products;
    this.query = query;
  }
  categoryQuery = () => {
    this.products = this.query.category
      ? this.products.filter((p) => p.category === this.query.category)
      : this.products;
    return this;
  };
  ratingQuery = () => {
    this.products = this.query.rating
      ? this.products.filter(
          (p) =>
            parseInt(this.query.rating) <= p.rating &&
            p.rating < parseInt(this.query.rating) + 1
        )
      : this.products;
    return this;
  };
  priceQuery = () => {
    const { lowPrice, highPrice } = this.query;
    this.products =
      lowPrice || highPrice
        ? this.products.filter(
            (p) =>
              (lowPrice ? p.price >= lowPrice : true) &&
              (highPrice ? p.price <= highPrice : true)
          )
        : this.products;
    return this;
  };
  sortingQuery = () => {
    const { sort } = this.query;
    if (sort === "high-to-low") {
      this.products.sort((a, b) => b.price - a.price);
    } else if (sort === "low-to-high") {
      this.products.sort((a, b) => a.price - b.price);
    }
    return this;
  };
  skip = () => {
    let { pageNumber, parPage } = this.query;
    const skipPage = (+pageNumber - 1) * parPage;
    let skipProduct = [];
    for (let i = skipPage; i < this.products.length; i++) {
      skipProduct.push(this.products[i]);
    }
    this.products = skipProduct;
    return this;
  };
  limit = () => {
    const { parPage } = this.query;
    if (this.products.length > parPage) {
      this.products = this.products.slice(0, parPage);
    }
    return this;
  };
  getProducts() {
    return this.products;
  }
  countProducts() {
    return this.products.length;
  }
}

module.exports = QueryProducts;
