import dotenv from "dotenv";

dotenv.config();


const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,

  clientUrl: process.env.CLIENT_URL,

  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
  },
};



export default env;