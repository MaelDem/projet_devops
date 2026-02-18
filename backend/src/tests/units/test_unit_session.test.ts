import { expect, test } from "bun:test";
import { createSession, validateSession } from "../../auth/sessions";


test("validateSession expire après le TTL", () => {
  const realDateNow = Date.now;
  
  const token = createSession();
  
  Date.now = () => realDateNow() + (25 * 60 * 60 * 1000);
  
  const isValid = validateSession(token);
  expect(isValid).toBe(false);
  
  Date.now = realDateNow;
});