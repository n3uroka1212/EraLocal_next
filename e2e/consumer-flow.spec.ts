import { test, expect } from "@playwright/test";

test.describe("Consumer browsing, cart, and checkout flow", () => {
  const consumer = {
    email: `consumer-${Date.now()}@test.local`,
    password: "ClientP@ss456!",
    name: "Marie Dupont",
    phone: "0698765432",
  };

  test("should register a new consumer account", async ({ page }) => {
    await page.goto("/inscription");

    await page.getByLabel(/nom/i).fill(consumer.name);
    await page.getByLabel(/email/i).fill(consumer.email);
    await page.getByLabel(/mot de passe/i).first().fill(consumer.password);
    await page.getByLabel(/confirmer/i).fill(consumer.password);

    await page.getByRole("button", { name: /créer|inscription/i }).click();

    await expect(page).toHaveURL(/accueil|\//);
  });

  test("should login and browse shops", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill(consumer.email);
    await page.getByLabel(/mot de passe/i).fill(consumer.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/commerces");
    await expect(page.locator("[data-testid='shop-card']").first()).toBeVisible();
  });

  test("should search for a product", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill(consumer.email);
    await page.getByLabel(/mot de passe/i).fill(consumer.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/recherche");
    await page.getByPlaceholder(/rechercher/i).fill("pain");
    await page.keyboard.press("Enter");

    await expect(page.locator("[data-testid='search-result']").first()).toBeVisible();
  });

  test("should add product to cart and proceed to checkout", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill(consumer.email);
    await page.getByLabel(/mot de passe/i).fill(consumer.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    // Navigate to a shop with click & collect
    await page.goto("/commerces");
    await page.locator("[data-testid='shop-card']").first().click();

    // Add first available product to cart
    await page.getByRole("button", { name: /ajouter au panier/i }).first().click();
    await expect(page.getByTestId("cart-badge")).toContainText("1");

    // Go to cart
    await page.getByTestId("cart-badge").click();
    await expect(page.getByText(/panier/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();

    // Proceed to checkout
    await page.getByRole("button", { name: /commander|payer/i }).click();

    // Fill checkout info
    await page.getByLabel(/téléphone/i).fill(consumer.phone);
    await page.getByRole("button", { name: /confirmer|valider/i }).click();

    // Should reach payment or confirmation page
    await expect(page).toHaveURL(/paiement|confirmation|commande/);
  });

  test("should add a shop to favorites", async ({ page }) => {
    await page.goto("/connexion");
    await page.getByLabel(/email/i).fill(consumer.email);
    await page.getByLabel(/mot de passe/i).fill(consumer.password);
    await page.getByRole("button", { name: /connexion|se connecter/i }).click();

    await page.goto("/commerces");
    await page.locator("[data-testid='shop-card']").first().click();

    await page.getByRole("button", { name: /favori|coeur/i }).click();

    // Verify it appears in favorites
    await page.goto("/favoris");
    await expect(page.locator("[data-testid='favorite-item']").first()).toBeVisible();
  });
});
