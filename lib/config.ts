const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const config = {
  get adminUsername() { return required("ADMIN_USERNAME"); },
  get adminPassword() { return required("ADMIN_PASSWORD"); },
  get mongoUri() { return required("MONGODB_URI"); },
  get mongoDbName() { return process.env.MONGO_DB_NAME ?? "CirEcon"; },
  get sessionSecret() { return required("SESSION_SECRET"); },
};
