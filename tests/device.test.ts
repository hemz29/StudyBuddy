import { describe, expect, it } from "vitest";
import { deviceOf } from "@/lib/device";

describe("deviceOf", () => {
  it("tells phones, tablets and computers apart from the browser's user-agent", () => {
    expect(deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148")).toBe("phone");
    expect(deviceOf("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0 Mobile Safari/537.36")).toBe("phone");
    expect(deviceOf("Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 Chrome/128.0 Safari/537.36")).toBe("tablet");
    expect(deviceOf("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148")).toBe("tablet");
    expect(deviceOf("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36 Edg/128.0")).toBe("computer");
    expect(deviceOf(null)).toBe("computer");
  });
});
