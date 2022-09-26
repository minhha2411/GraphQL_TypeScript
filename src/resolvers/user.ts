import { User } from "./../entities/User";
import { MyContext } from "./../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}
@InputType()
class UsernamePasswordInput {
  @Field(() => String)
  userName!: string;
  @Field(() => String)
  passWord!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  error?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class FieldError {
  @Field(() => String)
  field!: string;
  @Field(() => String, { nullable: true })
  message!: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    const { userName, passWord } = options;
    const hashedPassword = await argon2.hash(passWord);
    const user = em.create(User, {
      userName,
      createdAt: new Date(),
      updatedAt: new Date(),
      passWord: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ) {
    const user = await em.findOne(User, {
      userName: options.userName,
    });

    if (!user) {
      return {
        error: [{ field: "username", message: "username doesn't exists" }],
      };
    }
    const valid = await argon2.verify(user.passWord, options.passWord);

    if (!valid) {
      return {
        error: [{ field: "password", message: "incorrect password" }],
      };
    }
    req.session.userId = user.id;
    console.log("req", req.session);
    return { user };
  }
}
