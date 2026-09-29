import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { config } from "./config";

const cookieName = "cirecon-data-manager-session";
const signature = (value: string) =>
  createHmac("sha256", config.sessionSecret).update(value).digest("base64url");

export function validCredentials(username: string, password: string): boolean {
  const expectedUser = Buffer.from(config.adminUsername);
  const actualUser = Buffer.from(username);
  const expectedPassword = Buffer.from(config.adminPassword);
  const actualPassword = Buffer.from(password);
  return (
    actualUser.length === expectedUser.length &&
    actualPassword.length === expectedPassword.length &&
    timingSafeEqual(actualUser, expectedUser) &&
    timingSafeEqual(actualPassword, expectedPassword)
  );
}

export function sessionValue(): string {
  const payload = `${config.adminUsername}:${Date.now()}`;
  return `${payload}.${signature(payload)}`;
}

export async function isAuthenticated(): Promise<boolean> {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const split = value.lastIndexOf(".");
  if (split < 1) return false;
  const payload = value.slice(0, split);
  const received = value.slice(split + 1);
  const expected = signature(payload);
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export const sessionCookieName = cookieName;
