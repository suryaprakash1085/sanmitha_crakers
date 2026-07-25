import { Request, Response } from "express";
import { CategoryModel } from "../models/Category.model";

export const CategoryController = {
  async list(_req: Request, res: Response) {
    const items = await CategoryModel.findAll();
    res.json({ success: true, data: items });
  },

  async get(req: Request, res: Response) {
    const item = await CategoryModel.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: "Category not found" });
    res.json({ success: true, data: item });
  },

  async create(req: Request, res: Response) {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "Name is required" });
    const existing = await CategoryModel.findByName(name);
    if (existing) return res.status(409).json({ success: false, error: "Category already exists" });
    const item = await CategoryModel.create(name.trim());
    res.status(201).json({ success: true, data: item });
  },

  async update(req: Request, res: Response) {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "Name is required" });
    const item = await CategoryModel.update(Number(req.params.id), name.trim());
    res.json({ success: true, data: item });
  },

  async remove(req: Request, res: Response) {
    await CategoryModel.remove(Number(req.params.id));
    res.json({ success: true });
  },
};
