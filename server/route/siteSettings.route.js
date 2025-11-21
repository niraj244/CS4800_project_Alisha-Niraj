import { Router } from 'express'
import auth from '../middlewares/auth.js';
import { getSiteSettingsController, updateSiteSettingsController } from '../controllers/siteSettings.controller.js';

const siteSettingsRouter = Router();

siteSettingsRouter.get('/', getSiteSettingsController);
siteSettingsRouter.put('/update', auth, updateSiteSettingsController);

export default siteSettingsRouter;

