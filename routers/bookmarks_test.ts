import { createApp } from "../app.ts";
import { after, before, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { createClient } from "../db.ts";

const db = createClient();
before(async () => await db.connect());
after(async () => await db.end());

describe("GET /bookmarks", () => {
  it("should return bookmarks", async () => {
    const app = createApp(db);
    const result = await app.request("/api/bookmarks");
    await expect(result.json()).resolves.toEqual({
      data: [
        {
          id: "c88d269e-bb0b-4abf-a8f5-7cf00487049f",
          name: "name",
          description: "description",
          url: "url",
        },
      ],
    });
  });
});
