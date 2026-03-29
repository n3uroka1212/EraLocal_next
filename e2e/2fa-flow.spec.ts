import { test, expect } from "@playwright/test";

test.describe("Two-factor authentication (2FA) setup and login", () => {
  const merchant = {
    email: "shop-2fa@test.local",
    password: "Secure2FA@Pass!",
  };

  test("should navigate to 2FA setup page", async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/dashboard/parametres/securite");

    await expect(page.getByText(/double authentification|2FA|authentification/i)).toBeVisible();
  });

  test("should display QR code for TOTP setup", async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/dashboard/parametres/securite");

    await page.getByRole("button", { name: /activer|configurer|2FA/i }).click();

    // QR code should be displayed
    await expect(page.locator("canvas, img[alt*='QR'], [data-testid='qr-code']")).toBeVisible();

    // Secret key should be displayed for manual entry
    await expect(page.getByText(/clé secrète|secret|manual/i)).toBeVisible();
  });

  test("should reject invalid TOTP code", async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/dashboard/parametres/securite");
    await page.getByRole("button", { name: /activer|configurer|2FA/i }).click();

    // Enter an invalid code
    await page.getByLabel(/code/i).fill("000000");
    await page.getByRole("button", { name: /vérifier|valider|confirmer/i }).click();

    await expect(page.getByText(/invalide|incorrect|erreur/i)).toBeVisible();
  });

  test("should prompt for 2FA code on login when enabled", async ({ page }) => {
    // This test assumes 2FA has been previously enabled for this account.
    // In a real test suite, a fixture would set up the account state.

    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Should show the 2FA verification step instead of going to dashboard
    await expect(page.getByText(/code.*vérification|authentification/i)).toBeVisible();
    await expect(page.getByLabel(/code/i)).toBeVisible();
  });

  test("should reject wrong 2FA code on login", async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Enter wrong 2FA code
    await page.getByLabel(/code/i).fill("999999");
    await page.getByRole("button", { name: /vérifier|valider|confirmer/i }).click();

    await expect(page.getByText(/invalide|incorrect|erreur/i)).toBeVisible();
  });

  test("should disable 2FA from settings", async ({ page }) => {
    // Assumes already logged in with 2FA (test would need proper TOTP fixture)
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // If 2FA prompt appears, this test needs a valid TOTP code from a fixture
    // For structure purposes, we proceed assuming login succeeded
    await page.goto("/dashboard/parametres/securite");

    await page.getByRole("button", { name: /désactiver|disable/i }).click();

    // Confirm with password
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /confirmer/i }).click();

    await expect(page.getByText(/désactivé|disabled/i)).toBeVisible();
  });
});
