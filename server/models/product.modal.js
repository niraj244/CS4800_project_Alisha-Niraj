import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, default: '', index: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    brand: { type: String, default: '' },
    price: { type: Number, default: 0, index: true },
    oldPrice: { type: Number, default: 0 },
    catName: { type: String, default: '' },
    catId: { type: String, default: '' },
    subCatId: { type: String, default: '' },
    subCat: { type: String, default: '' },
    thirdsubCat: { type: String, default: '' },
    thirdsubCatId: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, required: true },
    sale: { type: Number, default: 0 },
    size: [{ type: String, default: null }],
    color: [{ type: String, default: '' }],
    bannerimages: [{ type: String }],
    bannerTitleName: { type: String, default: '' },
    isDisplayOnHomeBanner: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index for shop page filtering
productSchema.index({ category: 1, price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ slug: 1 }, { unique: true, sparse: true });

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
