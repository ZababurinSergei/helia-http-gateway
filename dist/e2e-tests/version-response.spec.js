import { test, expect } from '@playwright/test';
import { RPC_PORT } from '../_src_/constants.js';
function validateResponse(content) {
    expect(() => JSON.parse(content)).not.toThrow();
    const versionObj = JSON.parse(content);
    expect(versionObj).toHaveProperty('Version');
    expect(versionObj).toHaveProperty('Commit');
}
test('GET /api/v0/version', async ({ page }) => {
    const result = await page.goto(`http://localhost:${RPC_PORT}/api/v0/version`);
    expect(result?.status()).toBe(200);
    const maybeContent = await result?.text();
    expect(maybeContent).not.toBe(undefined);
    validateResponse(maybeContent);
});
test('POST /api/v0/version', async ({ page }) => {
    const result = await page.request.post(`http://localhost:${RPC_PORT}/api/v0/version`);
    expect(result?.status()).toBe(200);
    const maybeContent = await result?.text();
    expect(maybeContent).not.toBe(undefined);
    validateResponse(maybeContent);
});
//# sourceMappingURL=version-response.spec.js.map