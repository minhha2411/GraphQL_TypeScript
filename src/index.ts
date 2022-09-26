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
import session from "express-session";
import connectToRedis from "connect-redis";
import { createClient } from "redis";

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

  let RedisStore = connectToRedis(session);
  // redis@v4
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  app.use(
    session({
      name: "cookieName",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? ".codeponder.com" : undefined,
      },
      saveUninitialized: false,
      secret: "yoyoyoyoyoy",
      resave: false,
    })
  );

  const server = new ApolloServer({
    typeDefs,
    schema,
    playground: true,
    introspection: true,
    context: ({ req, res }) => ({ em: orm.em, req, res }),
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
