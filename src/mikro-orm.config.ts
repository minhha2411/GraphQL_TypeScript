import { UserResolver } from "./resolvers/user";
import { User } from "./entities/User";
import { __prod__ } from "../constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import path from "path";

export default {
  metadataProvider: TsMorphMetadataProvider,
  dbName: "postgres",
  debug: !__prod__,
  type: "postgresql",
  entities: [Post, User, UserResolver],
  migrations: {
    path: path.join(__dirname, "./migrations"),
  },
  user: "postgres",
  password: process.env.PASSWORD || "",
  allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0];
