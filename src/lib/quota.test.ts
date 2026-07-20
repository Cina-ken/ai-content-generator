import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpcMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ rpc: rpcMock })),
}));

const { fromMock, chainable, chainResult } = vi.hoisted(() => {
  const chainResult: { current: { data: unknown; error?: unknown } } = {
    current: { data: null },
  };
  const chainable: Record<string, ReturnType<typeof vi.fn>> = {};
  chainable.select = vi.fn(() => chainable);
  chainable.eq = vi.fn(() => chainable);
  chainable.maybeSingle = vi.fn(() => Promise.resolve(chainResult.current));
  // Supabase query builders are thenable, so `await supabase.from(...).select(...).eq(...)`
  // resolves without an explicit terminal call.
  (chainable as { then?: unknown }).then = (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown
  ) => Promise.resolve(chainResult.current).then(resolve, reject);
  const fromMock = vi.fn(() => chainable);
  return { fromMock, chainable, chainResult };
});
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

const { checkAndIncrementQuota, getQuotaStatus, getCurrentMonthKey, FREE_MONTHLY_QUOTA } =
  await import("./quota");

beforeEach(() => {
  rpcMock.mockReset();
  chainResult.current = { data: null };
  fromMock.mockClear();
  Object.values(chainable).forEach((fn) => {
    if (typeof fn === "function" && "mockClear" in fn) fn.mockClear();
  });
});

describe("getCurrentMonthKey", () => {
  it("formats as YYYY-MM", () => {
    expect(getCurrentMonthKey(new Date("2026-07-20T00:00:00Z"))).toBe("2026-07");
  });

  it("pads single-digit months", () => {
    expect(getCurrentMonthKey(new Date("2026-01-05T00:00:00Z"))).toBe("2026-01");
  });
});

describe("checkAndIncrementQuota", () => {
  it("allows the request when the RPC returns a count", async () => {
    rpcMock.mockResolvedValue({ data: 3, error: null });
    expect(await checkAndIncrementQuota("user-1")).toEqual({
      allowed: true,
      count: 3,
    });
  });

  it("blocks the request when the RPC returns null — quota exhausted", async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    expect(await checkAndIncrementQuota("user-1")).toEqual({
      allowed: false,
      count: null,
    });
  });

  it("fails closed — throws rather than silently allowing — when the RPC errors", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "connection reset" },
    });
    await expect(checkAndIncrementQuota("user-1")).rejects.toThrow(
      "connection reset"
    );
  });

  it("calls the RPC with the current month and the free quota limit", async () => {
    rpcMock.mockResolvedValue({ data: 1, error: null });
    await checkAndIncrementQuota("user-1");
    expect(rpcMock).toHaveBeenCalledWith("increment_quota", {
      p_user_id: "user-1",
      p_month: expect.stringMatching(/^\d{4}-\d{2}$/),
      p_limit: FREE_MONTHLY_QUOTA,
    });
  });
});

describe("getQuotaStatus", () => {
  it("defaults to 0 when no row exists yet", async () => {
    chainResult.current = { data: null };
    expect(await getQuotaStatus("user-1")).toEqual({
      count: 0,
      limit: FREE_MONTHLY_QUOTA,
    });
  });

  it("returns the stored count", async () => {
    chainResult.current = { data: { count: 4 } };
    expect(await getQuotaStatus("user-1")).toEqual({
      count: 4,
      limit: FREE_MONTHLY_QUOTA,
    });
  });
});
