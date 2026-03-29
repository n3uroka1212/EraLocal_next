import { test, expect } from "@playwright/test";

test.describe("Merchant registration and onboarding", () => {
  const merchant = {
    name: "Boulangerie du Centre",
    email: `merchant-${Date.now()}@test.local`,
    password: "SecureP@ss123!",
    siret: "12345678901234",
    address: "12 Rue de la Paix",
    city: "Lyon",
    postalCode: "69001",
    phone: "0612345678",
  };

  test("should register a new merchant account", async ({ page }) => {
    await page.goto("/inscription-commercant");

    await page.getByLabel(/nom/i).fill(merchant.name);
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).first().fill(merchant.password);
    await page.getByLabel(/confirmer/i).fill(merchant.password);

    await page.getByRole("button", { name: /créer|inscription/i }).click();

    await expect(page).toHaveURL(/onboarding|dashboard/);
  });

  test("should complete onboarding steps", async ({ page }) => {
    // Login first
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();
    await expect(page).toHaveURL(/dashboard|onboarding/);

    // Step: Business info
    await page.goto("/dashboard/onboarding");
    await page.getByLabel(/siret/i).fill(merchant.siret);
    await page.getByLabel(/adresse/i).fill(merchant.address);
    await page.getByLabel(/ville/i).fill(merchant.city);
    await page.getByLabel(/code postal/i).fill(merchant.postalCode);
    await page.getByLabel(/téléphone/i).fill(merchant.phone);
    await page.getByRole("button", { name: /suivant|continuer/i }).click();

    // Step: Upload documents (skip in e2e, just verify the step exists)
    await expect(page.getByText(/document|pièce/i)).toBeVisible();
  });

  test("should create a product from the dashboard", async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/dashboard/produits");
    await page.getByRole("button", { name: /ajouter|nouveau/i }).click();

    await page.getByLabel(/nom/i).fill("Pain au levain");
    await page.getByLabel(/prix/i).fill("3.50");
    await page.getByLabel(/catégorie/i).fill("Pains");
    await page.getByLabel(/quantité/i).fill("25");

    await page.getByRole("button", { name: /enregistrer|créer/i }).click();

    await expect(page.getByText("Pain au levain")).toBeVisible();
  });

  test("should edit shop profile information", async ({ page }) => {
    await page.goto("/connexion-commercant");
    await page.getByLabel(/email/i).fill(merchant.email);
    await page.getByLabel(/mot de passe/i).fill(merchant.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/dashboard/parametres");
    await page.getByLabel(/description/i).fill("Boulangerie artisanale depuis 1985");
    await page.getByRole("button", { name: /enregistrer|sauvegarder/i }).click();

    await expect(page.getByText(/sauvegardé|succès/i)).toBeVisible();
  });
});
