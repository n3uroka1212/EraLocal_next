"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";
import { StockProductForm } from "./StockProductForm";
import { StockAlerts } from "./StockAlerts";
import {
  deleteStockProduct,
  adjustQuantity,
} from "@/actions/stock";

type StockProduct = {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  category: string | null;
  minStock: number | null;
  expiryDate: string | null;
  barcode: string | null;
  supplier: string | null;
  description: string | null;
};

type CatalogProduct = {
  id: number;
  name: string;
  linkedProductId: number | null;
};

export function StockManagementClient({
  products: initialProducts,
  catalogProducts,
}: {
  products: StockProduct[];
  catalogProducts: CatalogProduct[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockProduct | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [adjustingId, setAdjustingId] = useState<number | null>(null);

  // Computed stats
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const stats = useMemo(() => {
    const lowStock = products.filter(
      (p) => p.minStock != null && p.quantity < p.minStock,
    );
    const expiring = products.filter(
      (p) => p.expiryDate && new Date(p.expiryDate) < sevenDaysFromNow,
    );
    const totalValue = products.reduce(
      (sum, p) => sum + (p.price ?? 0) * p.quantity,
      0,
    );
    return { lowStock, expiring, totalValue };
  }, [products, sevenDaysFromNow]);

  // Unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function handleAdjust(productId: number, delta: number) {
    setAdjustingId(productId);
    startTransition(async () => {
      const result = await adjustQuantity(productId, delta);
      setAdjustingId(null);
      if (result.error) {
        toast("error", result.error);
        return;
      }
      // Optimistic local update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, quantity: p.quantity + delta } : p,
        ),
      );
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteStockProduct(deleteTarget.id);
      if (result.error) {
        toast("error", result.error);
        return;
      }
      toast("success", "Produit supprime");
      setDeleteTarget(null);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      router.refresh();
    });
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProduct(null);
    // Refresh data from server after form close
    router.refresh();
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function getStockBadge(product: StockProduct) {
    if (product.minStock != null && product.quantity === 0) {
      return <Badge variant="red">Rupture</Badge>;
    }
    if (product.minStock != null && product.quantity < product.minStock) {
      return <Badge variant="orange">Stock bas</Badge>;
    }
    return <Badge variant="green">OK</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-serif text-text">
            Gestion du stock
          </h1>
          <p className="text-sm text-text2 mt-1">
            Suivez et gerez votre inventaire en temps reel
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          + Nouveau produit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-card border border-border bg-bg2 p-4">
          <div className="text-xs text-text3 uppercase tracking-wide font-semibold">
            Total produits
          </div>
          <div className="text-2xl font-bold text-text mt-1">
            {products.length}
          </div>
        </div>
        <div className="rounded-card border border-border bg-bg2 p-4">
          <div className="text-xs text-text3 uppercase tracking-wide font-semibold">
            Stock bas
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${stats.lowStock.length > 0 ? "text-red" : "text-green"}`}
          >
            {stats.lowStock.length}
          </div>
        </div>
        <div className="rounded-card border border-border bg-bg2 p-4">
          <div className="text-xs text-text3 uppercase tracking-wide font-semibold">
            Expirant bientot
          </div>
          <div
            className={`text-2xl font-bold mt-1 ${stats.expiring.length > 0 ? "text-orange" : "text-green"}`}
          >
            {stats.expiring.length}
          </div>
        </div>
        <div className="rounded-card border border-border bg-bg2 p-4">
          <div className="text-xs text-text3 uppercase tracking-wide font-semibold">
            Valeur du stock
          </div>
          <div className="text-2xl font-bold text-text mt-1">
            {stats.totalValue.toFixed(2)} \u20AC
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats.lowStock.length > 0 || stats.expiring.length > 0) && (
        <div>
          <h2 className="text-lg font-semibold font-serif text-text mb-3">
            Alertes
          </h2>
          <StockAlerts
            lowStockProducts={stats.lowStock}
            expiringProducts={stats.expiring}
          />
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, code-barres, fournisseur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {categories.length > 0 && (
          <select
            className="bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none transition-all duration-200 focus:border-terra focus:ring-1 focus:ring-terra/20"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Toutes categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Product Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="Aucun produit"
          description={
            products.length === 0
              ? "Ajoutez votre premier produit pour commencer a gerer votre stock."
              : "Aucun produit ne correspond a votre recherche."
          }
          action={
            products.length === 0 ? (
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
              >
                + Nouveau produit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-bg2 rounded-card border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg3/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2">
                    Produit
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2">
                    Quantite
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2 hidden md:table-cell">
                    Unite
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2 hidden md:table-cell">
                    Prix
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2 hidden lg:table-cell">
                    Categorie
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2 hidden lg:table-cell">
                    Seuil min
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2 hidden lg:table-cell">
                    Expiration
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2">
                    Statut
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text2">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => {
                  const isLow =
                    product.minStock != null &&
                    product.quantity < product.minStock;
                  const isExpiring =
                    product.expiryDate &&
                    new Date(product.expiryDate) < sevenDaysFromNow;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-bg3/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-text">{product.name}</p>
                        {product.barcode && (
                          <p className="text-xs text-text3">
                            {product.barcode}
                          </p>
                        )}
                        {product.supplier && (
                          <p className="text-xs text-text3">
                            {product.supplier}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAdjust(product.id, -1)}
                            disabled={
                              isPending ||
                              adjustingId === product.id ||
                              product.quantity <= 0
                            }
                            className="w-7 h-7 rounded-small bg-bg3 text-text hover:bg-bg4 transition-colors flex items-center justify-center text-sm font-bold disabled:opacity-40"
                            aria-label="Diminuer la quantite"
                          >
                            -
                          </button>
                          <span
                            className={`w-12 text-center font-semibold ${isLow ? "text-red" : "text-text"}`}
                          >
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => handleAdjust(product.id, 1)}
                            disabled={isPending || adjustingId === product.id}
                            className="w-7 h-7 rounded-small bg-bg3 text-text hover:bg-bg4 transition-colors flex items-center justify-center text-sm font-bold disabled:opacity-40"
                            aria-label="Augmenter la quantite"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-text2 hidden md:table-cell">
                        {product.unit ?? "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-right text-text hidden md:table-cell">
                        {product.price != null
                          ? `${product.price.toFixed(2)} \u20AC`
                          : "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {product.category ? (
                          <Badge variant="default">{product.category}</Badge>
                        ) : (
                          <span className="text-text3">{"\u2014"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-text2 hidden lg:table-cell">
                        {product.minStock ?? "\u2014"}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        {product.expiryDate ? (
                          <span
                            className={
                              isExpiring ? "text-orange" : "text-text2"
                            }
                          >
                            {formatDate(product.expiryDate)}
                          </span>
                        ) : (
                          <span className="text-text3">{"\u2014"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStockBadge(product)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded-small text-text2 hover:bg-bg3 hover:text-terra transition-colors"
                            aria-label="Modifier"
                            title="Modifier"
                          >
                            &#x270E;
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-small text-text2 hover:bg-red-light hover:text-red transition-colors"
                            aria-label="Supprimer"
                            title="Supprimer"
                          >
                            &#x1F5D1;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={handleFormClose}
          />
          <div className="relative bg-bg2 rounded-modal p-6 shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[scaleIn_0.3s_ease]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold font-serif text-text">
                {editingProduct
                  ? "Modifier le produit"
                  : "Nouveau produit stock"}
              </h2>
              <button
                onClick={handleFormClose}
                className="w-8 h-8 flex items-center justify-center rounded-small text-text3 hover:text-text hover:bg-bg3 transition-colors"
                aria-label="Fermer"
              >
                &#x2715;
              </button>
            </div>
            <StockProductForm
              product={editingProduct}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le produit"
        message={`Etes-vous sur de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isPending}
      />
    </div>
  );
}
