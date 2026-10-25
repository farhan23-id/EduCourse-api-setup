import "dotenv/config";

const required = ["DATABASE_URL", "JWT_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} belum diisi`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  // URL publik backend, tanpa "/" di akhir
  appUrl: (process.env.APP_URL as string).replace(/\/$/, ""),
};
