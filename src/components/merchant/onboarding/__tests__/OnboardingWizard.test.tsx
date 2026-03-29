import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingWizard } from "../OnboardingWizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/actions/shop", () => ({
  updateOnboarding: vi.fn().mockResolvedValue({ success: true }),
}));

const defaultProps = {
  initialData: {
    shopName: "Ma Boutique",
    businessType: "",
    category: "",
    logoEmoji: "",
  },
};

describe("OnboardingWizard", () => {
  it("renders step 1 by default", () => {
    render(<OnboardingWizard {...defaultProps} />);
    expect(screen.getByText("Type d'activite")).toBeInTheDocument();
    expect(screen.getByText("Etape 1 sur 2")).toBeInTheDocument();
  });

  it("shows business type cards", () => {
    render(<OnboardingWizard {...defaultProps} />);
    expect(screen.getByText("Commercant")).toBeInTheDocument();
    expect(screen.getByText("Producteur")).toBeInTheDocument();
    expect(screen.getByText("Artisan")).toBeInTheDocument();
    expect(screen.getByText("Activite")).toBeInTheDocument();
  });

  it("disables Suivant when type and category not selected", () => {
    render(<OnboardingWizard {...defaultProps} />);
    const suivant = screen.getByText("Suivant");
    expect(suivant).toBeDisabled();
  });

  it("navigates to step 2 after selecting type and category", () => {
    render(<OnboardingWizard {...defaultProps} />);

    fireEvent.click(screen.getByText("Commercant"));
    const input = screen.getByPlaceholderText(
      "Ex: Boulangerie, Fromagerie, Yoga...",
    );
    fireEvent.change(input, { target: { value: "Boulangerie" } });

    fireEvent.click(screen.getByText("Suivant"));
    expect(screen.getByText("Details de votre boutique")).toBeInTheDocument();
    expect(screen.getByText("Etape 2 sur 2")).toBeInTheDocument();
  });

  it("step 2 shows shop name input", () => {
    render(
      <OnboardingWizard
        initialData={{
          shopName: "Ma Boutique",
          businessType: "commercant",
          category: "Boulangerie",
          logoEmoji: "",
        }}
      />,
    );

    fireEvent.click(screen.getByText("Commercant"));
    const input = screen.getByPlaceholderText(
      "Ex: Boulangerie, Fromagerie, Yoga...",
    );
    fireEvent.change(input, { target: { value: "Boulangerie" } });
    fireEvent.click(screen.getByText("Suivant"));

    expect(screen.getByDisplayValue("Ma Boutique")).toBeInTheDocument();
  });

  it("validates step 1 requires type and category", () => {
    render(<OnboardingWizard {...defaultProps} />);

    fireEvent.click(screen.getByText("Commercant"));
    // Category empty → Suivant still disabled
    expect(screen.getByText("Suivant")).toBeDisabled();
  });

  it("validates step 2 requires shop name", () => {
    render(
      <OnboardingWizard
        initialData={{
          shopName: "",
          businessType: "",
          category: "",
          logoEmoji: "",
        }}
      />,
    );

    fireEvent.click(screen.getByText("Commercant"));
    const catInput = screen.getByPlaceholderText(
      "Ex: Boulangerie, Fromagerie, Yoga...",
    );
    fireEvent.change(catInput, { target: { value: "Boulangerie" } });
    fireEvent.click(screen.getByText("Suivant"));

    // Name is empty → Terminer disabled
    expect(screen.getByText("Terminer")).toBeDisabled();
  });
});
