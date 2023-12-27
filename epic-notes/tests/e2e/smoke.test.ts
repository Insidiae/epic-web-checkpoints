import { test, expect } from "@playwright/test";

test("can visit the home page", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByText("Hello World")).toBeVisible();
});
