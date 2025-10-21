import { SignJWT, jwtVerify, JWTPayload } from "jose";

const RAW_SECRET = process.env.JWT_SECRET;
if (!RAW_SECRET) throw new Error("Falta JWT_SECRET");

const secretKey = new TextEncoder().encode(RAW_SECRET);
const ACCESS_EXPIRES = "30d";

interface JwtPayload extends JWTPayload {
  id: string;
  admin: boolean;
}

export const generateToken = async (payload: JwtPayload): Promise<string> => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES)
    .sign(secretKey);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const { payload } = await jwtVerify<JwtPayload>(token, secretKey);
  return payload;
};

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();