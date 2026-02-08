const { Schema, model, mongo, default: mongoose } = require("mongoose");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);
categorySchema.index({
  name: "text",
});
module.exports = mongoose.model("Category", categorySchema);
