import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values and supports conditional objects", () => {
    expect(cn("a", false, null, undefined, { b: true, c: false })).toBe("a b");
  });

  it("lets later Tailwind classes override conflicting earlier ones", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("keeps non-conflicting Tailwind classes", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });
});
