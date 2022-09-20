require("dotenv").config();
import { __prod__ } from "./../constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import Config from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(Config);
  const post = orm.em.create(Post, { title: "my first post" });
  await orm.em.persistAndFlush(post);
};

main().catch((err) => {
  console.log("err", err);
});
