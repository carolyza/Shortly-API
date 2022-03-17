import { Router } from "express";
import { createUrl, getUrl } from "../controllers/urlController.js";
import { validateSchemaMiddleware } from "../middlewares/validateSchemaMiddleware.js";
import { validateTokenMiddleware } from "../middlewares/validateTokenMiddleware.js";
import urlSchema from "../schemas/urlSchema.js";

const urlRouter = Router();
urlRouter.post(
  "/url/shorten",
  validateSchemaMiddleware(urlSchema),
  validateTokenMiddleware,
  createUrl
);
urlRouter.get("/url/:shortUrl", validateTokenMiddleware, getUrl);
export default urlRouter;
