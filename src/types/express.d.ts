import type { ZodTypeAny } from "zod";
import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      validated?: any;
      validatedParams?: any;
      validatedQuery?: any;
      user?: {
        id: string;
        admin: boolean;
        [key: string]: any;
      };
    }
  }
}
