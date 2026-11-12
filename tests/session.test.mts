import assert from "node:assert/strict";
process.env.ADMIN_SESSION_SECRET = "x".repeat(32);
process.env.ADMIN_PASSWORD = "pw-admin";
process.env.ROMO_PASSWORD = "pw-romo";
const { createSession, verifySession, checkPassword } = await import("../lib/session.ts");

assert.equal(await verifySession(await createSession("romo")), "romo");
assert.equal(await verifySession(await createSession("admin")), "admin");
assert.equal(await verifySession(undefined), null);
assert.equal(await verifySession("sampah"), null);

const a = await createSession("admin");
const [, exp, sig] = a.split(".");
assert.equal(await verifySession(`romo.${exp}.${sig}`), null, "ganti peran harus gagal");
assert.equal(await verifySession(`admin.${Number(exp) - 1}.${sig}`), null, "ubah masa berlaku harus gagal");
assert.equal(await verifySession(`admin.${Date.now() - 1000}.${sig}`), null);

assert.deepEqual(await checkPassword("pw-romo"), { role: "romo" });
assert.deepEqual(await checkPassword("pw-admin"), { role: "admin" });
assert.equal(await checkPassword("salah"), "wrong");
console.log("session tests OK");
