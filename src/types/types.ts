import { Request } from "express";
import { Types } from "mongoose";

export type ValidatedRequest<
  Params = any,
  Body = any,
  Query = any
> = Request<Params, any, Body, Query> & {
  validated?: Body;
  validatedParams?: Params;
  validatedQuery?: Query;
};

export type ObjectIdLike = string | Types.ObjectId;