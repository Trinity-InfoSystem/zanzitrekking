const { Schema, model, mongo, default: mongoose } = require("mongoose");

const exclusionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
exclusionSchema.index({
  name: "text",
});
module.exports = mongoose.model("Exclusion", exclusionSchema);
