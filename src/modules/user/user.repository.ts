import { User, UserModel } from "./user.model";

export const UserRepository = {

  findAll: async () => {
    return UserModel.find().lean<User[]>();
  },

  findById: async (id: string) => {
    return UserModel.findById(id).lean<User | null>();
  },

  findByEmail: async (email: string) => {
    return UserModel.findOne({ email }).lean<User | null>();
  },

  update: async (id: string, data: Partial<User>) => {
    return UserModel.findByIdAndUpdate(id, data, {
      new: true,
    }).lean<User | null>();
  },

  search: async (
    q: string,
    limit = 10
  ): Promise<(User & { _id: string })[]> => {
    const regex = new RegExp(q, "i");
    const users = await UserModel.find({
      $or: [{ username: regex }, { nombre: regex }],
    })
      .select("_id username nombre email")
      .limit(limit)
      .lean();

    // ⚙️ Convertimos explícitamente _id a string
    return users.map((u) => ({
      ...u,
      _id: u._id.toString(),
    }));
  },
};