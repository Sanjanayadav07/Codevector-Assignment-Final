const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    // we manage createdAt/updatedAt ourselves so seeded data can have
    // realistic backdated timestamps; timestamps:false avoids Mongoose
    // overwriting them.
    timestamps: false,
    versionKey: false,
  }
);


ProductSchema.index({ createdAt: -1, _id: -1 });

// Same idea, but scoped per category, for the filtered browse case.
ProductSchema.index({ category: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Product', ProductSchema);
