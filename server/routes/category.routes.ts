import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", CategoryController.list);
router.get("/:id", CategoryController.get);
router.post("/", requireAdmin, CategoryController.create);
router.put("/:id", requireAdmin, CategoryController.update);
router.delete("/:id", requireAdmin, CategoryController.remove);

export default router;
