import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Brew Haven/i);
  await expect(
    page.getByRole("link", { name: "Chat with AI Barista" }),
  ).toBeVisible();
});

test("admin menu page loads", async ({ page }) => {
  await page.goto("/admin/menu");
  await expect(page).toHaveURL(/\/signin$/);
  await expect(
    page.getByRole("heading", { name: /welcome back/i }),
  ).toBeVisible();
});

test("payment success page handles missing orderId", async ({ page }) => {
  await page.goto("/payment/success");
  await expect(page.getByText("Invalid Link")).toBeVisible();
});
