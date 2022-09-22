require("dotenv").config();
import { UserResolver } from "./resolvers/user";
import { User } from "./entities/User";
import "reflect-metadata";
import { HelloResolver } from "./resolvers/hello";
import { __prod__ } from "./../constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import Config from "./mikro-orm.config";
import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(Config);
  await orm.getMigrator().up();
  const app = express();

  const schema = await buildSchema({
    resolvers: [HelloResolver, PostResolver, UserResolver],
  });

  console.log("********** schema", schema);

  const typeDefs = gql`
    type Book {
      title: String
      author: String
    }
    type Query {
      books: [Book]
    }
  `;

  // console.log("typeDefs", typeDefs);

  // const resolvers = {
  //   Query: {
  //     books: () => [],
  //   },
  // };

  const server = new ApolloServer({
    typeDefs,
    schema,
    playground: true,
    introspection: true,
    context: () => ({ em: orm.em }),
  });
  await server.start();
  server.applyMiddleware({ app });

  app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
  });
  const post = await orm.em.find(Post, {});
  const user = await orm.em.find(User, {});
  console.log("user", user);
  console.log("----------------------------- SQL 2 ----------------------");
};

main().catch((err) => {
  console.log("err", err);
});
