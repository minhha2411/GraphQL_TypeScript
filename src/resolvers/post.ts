import { MyContext } from "./../types";
import { Post } from "./../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext) {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number, @Ctx() { em }: MyContext) {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post, { nullable: true })
  async createPost(
    @Arg("title", () => String) title: string,
    @Arg("id", () => Int) id: number,
    @Arg("createdAt", () => String) createdAt: Date,
    @Arg("updatedAt", () => String) updatedAt: Date,
    @Ctx() { em }: MyContext
  ) {
    const post = await em.persistAndFlush(
      em.create(Post, { id, title, createdAt, updatedAt })
    );
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("title", () => String) title: string,
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ) {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    post.title = title;
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id", () => Int) id: number, @Ctx() { em }: MyContext) {
    try {
      await em.nativeDelete(Post, { id });
    } catch {
      return false;
    }
    return true;
  }
}
