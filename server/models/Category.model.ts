import db from "../db";

export interface CategoryRow {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

const table = () => db("categories");

export const CategoryModel = {
  async findAll() {
    // include live product count for each category
    return db("categories as c")
      .leftJoin("products as p", "p.category_id", "c.id")
      .groupBy("c.id")
      .select("c.id", "c.name")
      .count("p.id as productCount")
      .orderBy("c.id", "asc");
  },

  async findById(id: number) {
    return table().where({ id }).first();
  },

  async findByName(name: string) {
    return table().where({ name }).first();
  },

  async create(name: string) {
    const [id] = await table().insert({ name });
    return this.findById(id);
  },

  async update(id: number, name: string) {
    await table().where({ id }).update({ name, updated_at: db.fn.now() });
    return this.findById(id);
  },

  async remove(id: number) {
    return table().where({ id }).del();
  },
};
