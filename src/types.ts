import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request } from "express";

export interface MyContext {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request;
}
