import { test, expect } from "@playwright/test";

test.describe("Merchant order management", () => {
  const merchant = {
    email: "shop@test.local",
    password: "ShopP@ss123!",
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should display list of pending orders", async ({ page }) => {
    await page.goto("/dashboard/commandes");

    await expect(page.getByText(/commandes/i)).toBeVisible();
    await expect(page.locator("[data-testid='order-row']").first()).toBeVisible();
  });

  test("should view order details", async ({ page }) => {
    await page.goto("/dashboard/commandes");

    await page.locator("[data-testid='order-row']").first().click();

    await expect(page.getByText(/détails|commande/i)).toBeVisible();
    await expect(page.getByText(/articles|produits/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();
  });

  test("should mark an order as preparing", async ({ page }) => {
    await page.goto("/dashboard/commandes");
    await page.locator("[data-testid='order-row']").first().click();

    await page.getByRole("button", { name: /préparer|en préparation/i }).click();

    await expect(page.getByText(/en préparation|preparing/i)).toBeVisible();
  });

  test("should mark an order as ready for pickup", async ({ page }) => {
    await page.goto("/dashboard/commandes");

    // Find an order in 'preparing' status
    await page
      .locator("[data-testid='order-row']")
      .filter({ hasText: /préparation/i })
      .first()
      .click();

    await page.getByRole("button", { name: /prêt|ready/i }).click();

    await expect(page.getByText(/prêt|ready/i)).toBeVisible();
  });

  test("should mark an order as collected", async ({ page }) => {
    await page.goto("/dashboard/commandes");

    await page
      .locator("[data-testid='order-row']")
      .filter({ hasText: /prêt/i })
      .first()
      .click();

    await page.getByRole("button", { name: /récupéré|collected/i }).click();

    await expect(page.getByText(/récupéré|collected|terminé/i)).toBeVisible();
  });

  test("should cancel an order with reason", async ({ page }) => {
    await page.goto("/dashboard/commandes");
    await page.locator("[data-testid='order-row']").first().click();

    await page.getByRole("button", { name: /annuler|cancel/i }).click();

    await page.getByLabel(/raison|motif/i).fill("Produit en rupture de stock");
    await page.getByRole("button", { name: /confirmer/i }).click();

    await expect(page.getByText(/annulé|cancelled/i)).toBeVisible();
  });

  test("should filter orders by status", async ({ page }) => {
    await page.goto("/dashboard/commandes");

    // Filter by 'ready' status
    await page.getByRole("button", { name: /prêt|ready/i }).click();

    const orderRows = page.locator("[data-testid='order-row']");
    const count = await orderRows.count();
    for (let i = 0; i < count; i++) {
      await expect(orderRows.nth(i)).toContainText(/prêt|ready/i);
    }
  });
});
