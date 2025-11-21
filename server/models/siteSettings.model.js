import mongoose from "mongoose";

const siteSettingsSchema = mongoose.Schema({
    popularProductsSubtitle: {
        type: String,
        default: "Do not miss the current offers until the end of March."
    }
},
    { timestamps: true }
)

const SiteSettingsModel = mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettingsModel

