const { Schema, model, mongo, default: mongoose } = require("mongoose");

const mealSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
mealSchema.index({
  name: "text",
});
module.exports = mongoose.model("Meal", mealSchema);
