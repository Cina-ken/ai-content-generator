import { describe, expect, it } from "vitest";
import { buildPrompt, CONTENT_TYPES, getContentTypeConfig } from "./generate";

describe("CONTENT_TYPES", () => {
  it("has exactly the four types the product supports", () => {
    expect(CONTENT_TYPES.map((c) => c.value)).toEqual([
      "blog-intro",
      "product",
      "social",
      "email",
    ]);
  });
});

describe("getContentTypeConfig", () => {
  it("returns the matching config", () => {
    expect(getContentTypeConfig("social").label).toBe("Social");
  });

  it("throws for an unknown content type", () => {
    expect(() =>
      // @ts-expect-error - testing the runtime guard against an invalid value
      getContentTypeConfig("nonsense")
    ).toThrow();
  });
});

describe("buildPrompt", () => {
  it("includes the topic and the tone label", () => {
    const prompt = buildPrompt(
      "blog-intro",
      "casual",
      "a coffee shop opening in a college town"
    );
    expect(prompt).toContain("a coffee shop opening in a college town");
    expect(prompt).toContain("Casual");
  });

  it("produces different instructions for different content types", () => {
    const blog = buildPrompt("blog-intro", "professional", "wireless earbuds");
    const product = buildPrompt("product", "professional", "wireless earbuds");
    expect(blog).not.toBe(product);
  });
});
