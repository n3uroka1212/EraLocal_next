import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AddToCartButton } from "../AddToCartButton";
import { CartProvider } from "@/providers/CartProvider";

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

const defaultProps = {
  productId: 1,
  available: true,
  clickCollectEnabled: true,
  shopId: 1,
  shopName: "Boulangerie",
  productName: "Pain",
  price: 1.5,
};

describe("AddToCartButton", () => {
  it("shows button when C&C enabled and available", () => {
    renderWithCart(<AddToCartButton {...defaultProps} />);
    expect(screen.getByText(/Ajouter au panier/)).toBeInTheDocument();
  });

  it("hides button when C&C disabled", () => {
    renderWithCart(
      <AddToCartButton {...defaultProps} clickCollectEnabled={false} />,
    );
    expect(screen.queryByText(/Ajouter/)).not.toBeInTheDocument();
  });

  it("disables button when not available", () => {
    renderWithCart(
      <AddToCartButton {...defaultProps} available={false} />,
    );
    expect(screen.getByText(/indisponible/)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
