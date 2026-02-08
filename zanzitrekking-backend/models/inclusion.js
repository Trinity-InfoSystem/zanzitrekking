const { Schema, default: mongoose } = require("mongoose");

const inclusionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
inclusionSchema.index({
  name: "text",
});
module.exports = mongoose.model("Inclusion", inclusionSchema);
