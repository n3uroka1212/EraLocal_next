"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminDeleteAllProducts,
  adminImportProducts,
} from "@/actions/admin";

// --- Types ---

interface Shop {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  available: boolean;
}

interface CsvRow {
  name: string;
  description?: string;
  price?: number;
  priceUnit?: string;
  category?: string;
}

type ImportMode = "create" | "upsert" | "replace";

// --- CSV Parser ---

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(";").map((h) => h.trim().toLowerCase());
  const nameIdx = headers.indexOf("name");
  if (nameIdx === -1) return [];

  const descIdx = headers.indexOf("description");
  const priceIdx = headers.indexOf("price");
  const unitIdx = headers.indexOf("priceunit");
  const catIdx = headers.indexOf("category");

  return lines.slice(1).map((line) => {
    const cols = line.split(";").map((c) => c.trim());
    const row: CsvRow = { name: cols[nameIdx] || "" };
    if (descIdx >= 0 && cols[descIdx]) row.description = cols[descIdx];
    if (priceIdx >= 0 && cols[priceIdx]) {
      const p = parseFloat(cols[priceIdx].replace(",", "."));
      if (!isNaN(p)) row.price = p;
    }
    if (unitIdx >= 0 && cols[unitIdx]) row.priceUnit = cols[unitIdx];
    if (catIdx >= 0 && cols[catIdx]) row.category = cols[catIdx];
    return row;
  }).filter((r) => r.name);
}

// --- Main Component ---

export function AdminProductManagerClient({ shops }: { shops: Shop[] }) {
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isPending, startTransition] = useTransition();

  // CSV import state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [importMode, setImportMode] = useState<ImportMode>("create");
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete all confirm
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  // Create product form
  const [showCreateForm, setShowCreateForm] = useState(false);

  const selectedShop = shops.find((s) => s.id === selectedShopId) ?? null;

  const fetchProducts = useCallback(async (shopId: number) => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/health`); // Placeholder: products fetched via server action pattern
      // We reload the page to get fresh data from the server component
      // In practice, use a dedicated API route or server action for fetching
      void res;
    } catch {
      // ignore
    }
    setLoadingProducts(false);
  }, []);

  // Fetch products when shop changes — using direct Prisma call via server action isn't ideal,
  // so we use an inline fetch approach. For now, we re-fetch on actions via revalidatePath.
  const handleShopChange = (shopId: string) => {
    const id = parseInt(shopId, 10);
    setSelectedShopId(id || null);
    setProducts([]);
    setCsvRows([]);
    setShowCsvPreview(false);
    setShowCreateForm(false);
    if (id) fetchProducts(id);
  };

  // --- Create Product ---
  const handleCreateProduct = (formData: FormData) => {
    if (!selectedShopId) return;
    startTransition(async () => {
      const result = await adminCreateProduct(selectedShopId, null, formData);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Produit cree");
        setShowCreateForm(false);
      }
    });
  };

  // --- Delete Product ---
  const handleDeleteProduct = (productId: number) => {
    if (!selectedShopId) return;
    startTransition(async () => {
      const result = await adminDeleteProduct(selectedShopId, productId);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Produit supprime");
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    });
  };

  // --- Delete All Products ---
  const handleDeleteAll = () => {
    if (!selectedShopId) return;
    startTransition(async () => {
      const result = await adminDeleteAllProducts(selectedShopId);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Tous les produits ont ete supprimes");
        setProducts([]);
      }
      setShowDeleteAll(false);
    });
  };

  // --- CSV File Pick ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      setCsvRows(rows);
      setShowCsvPreview(true);
    };
    reader.readAsText(file, "utf-8");
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // --- Import CSV ---
  const handleImport = () => {
    if (!selectedShopId || csvRows.length === 0) return;
    startTransition(async () => {
      const result = await adminImportProducts(
        selectedShopId,
        csvRows,
        importMode,
      );
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", `${csvRows.length} produit(s) importe(s)`);
        setCsvRows([]);
        setShowCsvPreview(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold font-serif text-text">
        Gestion des Produits
      </h1>

      {/* Shop Selector */}
      <Select
        label="Boutique"
        placeholder="Selectionner une boutique"
        options={shops.map((s) => ({
          value: String(s.id),
          label: `${s.name} (${s.slug}) — ${s.productCount} produit(s)`,
        }))}
        value={selectedShopId ? String(selectedShopId) : ""}
        onChange={(e) => handleShopChange(e.target.value)}
      />

      {selectedShop && (
        <>
          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              + Creer un produit
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Importer CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowDeleteAll(true)}
            >
              Supprimer tous les produits
            </Button>
          </div>

          {/* Create Product Form */}
          {showCreateForm && (
            <form
              action={handleCreateProduct}
              className="bg-bg2 border border-border rounded-card p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold text-text">
                Nouveau produit
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
                    Nom *
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none focus:border-terra"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
                    Prix
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    className="w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none focus:border-terra"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
                    Unite de prix
                  </label>
                  <input
                    name="priceUnit"
                    placeholder="ex: /kg"
                    className="w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none focus:border-terra"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
                    Categorie
                  </label>
                  <input
                    name="category"
                    className="w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none focus:border-terra"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none focus:border-terra resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" size="sm" loading={isPending}>
                  Creer
                </Button>
              </div>
            </form>
          )}

          {/* CSV Preview */}
          {showCsvPreview && csvRows.length > 0 && (
            <div className="bg-bg2 border border-border rounded-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text">
                Apercu de l&apos;import ({csvRows.length} produit
                {csvRows.length > 1 ? "s" : ""})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-[0.68rem] font-semibold uppercase text-text2">
                        Nom
                      </th>
                      <th className="text-left py-2 px-3 text-[0.68rem] font-semibold uppercase text-text2">
                        Prix
                      </th>
                      <th className="text-left py-2 px-3 text-[0.68rem] font-semibold uppercase text-text2">
                        Unite
                      </th>
                      <th className="text-left py-2 px-3 text-[0.68rem] font-semibold uppercase text-text2">
                        Categorie
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 20).map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/50 hover:bg-bg3/50"
                      >
                        <td className="py-2 px-3 text-text">{row.name}</td>
                        <td className="py-2 px-3 text-text">
                          {row.price != null ? `${row.price.toFixed(2)} EUR` : "-"}
                        </td>
                        <td className="py-2 px-3 text-text2">
                          {row.priceUnit || "-"}
                        </td>
                        <td className="py-2 px-3 text-text2">
                          {row.category || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvRows.length > 20 && (
                  <p className="text-xs text-text3 mt-2 px-3">
                    ... et {csvRows.length - 20} autres
                  </p>
                )}
              </div>

              {/* Import Mode */}
              <div className="flex flex-wrap items-end gap-4">
                <Select
                  label="Mode d'import"
                  options={[
                    { value: "create", label: "Creer (ajouter)" },
                    { value: "upsert", label: "Upsert (creer ou mettre a jour)" },
                    { value: "replace", label: "Remplacer (supprimer + creer)" },
                  ]}
                  value={importMode}
                  onChange={(e) =>
                    setImportMode(e.target.value as ImportMode)
                  }
                />
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setCsvRows([]);
                      setShowCsvPreview(false);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    loading={isPending}
                    onClick={handleImport}
                  >
                    Importer {csvRows.length} produit
                    {csvRows.length > 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <span className="inline-block w-6 h-6 border-2 border-terra border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="bg-bg2 border border-border rounded-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg3/50">
                      <th className="text-left py-3 px-4 text-[0.68rem] font-semibold uppercase text-text2">
                        Nom
                      </th>
                      <th className="text-left py-3 px-4 text-[0.68rem] font-semibold uppercase text-text2">
                        Prix
                      </th>
                      <th className="text-left py-3 px-4 text-[0.68rem] font-semibold uppercase text-text2">
                        Categorie
                      </th>
                      <th className="text-left py-3 px-4 text-[0.68rem] font-semibold uppercase text-text2">
                        Statut
                      </th>
                      <th className="text-right py-3 px-4 text-[0.68rem] font-semibold uppercase text-text2">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-border/50 hover:bg-bg3/30"
                      >
                        <td className="py-3 px-4 text-text font-medium">
                          {product.name}
                        </td>
                        <td className="py-3 px-4 text-text">
                          {product.price != null
                            ? `${product.price.toFixed(2)} EUR`
                            : "-"}
                          {product.priceUnit && (
                            <span className="text-text2">
                              {" "}
                              {product.priceUnit}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text2">
                          {product.category || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-input text-[0.75rem] font-medium ${
                              product.available
                                ? "bg-green-light text-green"
                                : "bg-red-light text-red"
                            }`}
                          >
                            {product.available ? "Disponible" : "Indisponible"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            loading={isPending}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            selectedShopId && (
              <div className="bg-bg2 border border-border rounded-card p-8 text-center">
                <p className="text-text2 text-sm">
                  Aucun produit pour cette boutique. Creez-en un ou importez un
                  fichier CSV.
                </p>
              </div>
            )
          )}

          {/* Delete All Confirm */}
          <ConfirmDialog
            open={showDeleteAll}
            onClose={() => setShowDeleteAll(false)}
            onConfirm={handleDeleteAll}
            title="Supprimer tous les produits"
            message={`Etes-vous sur de vouloir supprimer tous les produits de "${selectedShop.name}" ? Cette action est irreversible.`}
            confirmLabel="Supprimer tout"
            variant="danger"
            loading={isPending}
          />
        </>
      )}
    </div>
  );
}
