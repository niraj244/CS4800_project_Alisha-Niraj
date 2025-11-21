import SiteSettingsModel from '../models/siteSettings.model.js';

// Get site settings (only one document should exist)
export const getSiteSettingsController = async (request, response) => {
    try {
        let settings = await SiteSettingsModel.findOne();

        // If no settings exist, create default one
        if (!settings) {
            settings = new SiteSettingsModel();
            await settings.save();
        }

        return response.status(200).json({
            data: settings,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// Update site settings
export const updateSiteSettingsController = async (request, response) => {
    try {
        const { popularProductsSubtitle } = request.body;

        // Find existing settings or create new one
        let settings = await SiteSettingsModel.findOne();

        if (!settings) {
            settings = new SiteSettingsModel();
        }

        // Update fields
        if (popularProductsSubtitle !== undefined) {
            settings.popularProductsSubtitle = popularProductsSubtitle;
        }

        const updatedSettings = await settings.save();

        return response.status(200).json({
            data: updatedSettings,
            message: "Site settings updated successfully",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

