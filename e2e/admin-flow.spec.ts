import { test, expect } from "@playwright/test";

test.describe("Admin dashboard and shop verification", () => {
  const admin = {
    email: "admin@eralocal.fr",
    password: "AdminP@ss789!",
  };

  test("should login to admin dashboard", async ({ page }) => {
    await page.goto("/admin/connexion");

    await page.getByLabel(/email/i).fill(admin.email);
    await page.getByLabel(/mot de passe/i).fill(admin.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await expect(page).toHaveURL(/admin/);
    await expect(page.getByText(/tableau de bord|dashboard/i)).toBeVisible();
  });

  test("should list pending shops for verification", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel(/email/i).fill(admin.email);
    await page.getByLabel(/mot de passe/i).fill(admin.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/admin/verifications");

    await expect(page.getByText(/en attente|pending/i)).toBeVisible();
    await expect(page.locator("[data-testid='shop-verification-row']").first()).toBeVisible();
  });

  test("should verify a shop", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel(/email/i).fill(admin.email);
    await page.getByLabel(/mot de passe/i).fill(admin.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/admin/verifications");

    // Click on first pending shop
    await page.locator("[data-testid='shop-verification-row']").first().click();

    // Review documents
    await expect(page.getByText(/documents|pièces/i)).toBeVisible();

    // Approve the shop
    await page.getByRole("button", { name: /approuver|valider|vérifier/i }).click();

    // Confirm the action
    await page.getByRole("button", { name: /confirmer/i }).click();

    await expect(page.getByText(/vérifié|approuvé/i)).toBeVisible();
  });

  test("should reject a shop with reason", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel(/email/i).fill(admin.email);
    await page.getByLabel(/mot de passe/i).fill(admin.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/admin/verifications");
    await page.locator("[data-testid='shop-verification-row']").first().click();

    await page.getByRole("button", { name: /rejeter|refuser/i }).click();

    await page.getByLabel(/raison|motif/i).fill("Documents illisibles, veuillez renvoyer.");
    await page.getByRole("button", { name: /confirmer/i }).click();

    await expect(page.getByText(/rejeté|refusé/i)).toBeVisible();
  });

  test("should view analytics overview", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel(/email/i).fill(admin.email);
    await page.getByLabel(/mot de passe/i).fill(admin.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/admin/analytics");

    await expect(page.getByText(/statistiques|analytics/i)).toBeVisible();
    await expect(page.getByText(/commerces|shops/i)).toBeVisible();
  });
});
