import { sign, verify, JwtPayload } from "jsonwebtoken";

export const jwt = {
  sign: (payload: any, key: string) => {
    const secretKey = process.env.JWT_SECRET || "secret";
    const expiresIn = process.env.JWT_EXPIRE || "1h"; 

    return sign(payload, secretKey, {
      expiresIn, 
    });
  },
  
  verify: (token: string) => {
    try {
      const secretKey = process.env.JWT_SECRET || "secret";
      const decoded = verify(token, secretKey) as JwtPayload;
      return decoded; 
    } catch (error) {
      console.error("JWT verification error:", error);
      throw new Error("Token verification failed");
    }
  },
};
