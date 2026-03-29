"use client";

import { useState, useTransition, useCallback, useRef, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";
import { saveScan, applyScan } from "@/actions/scanner";

type ParsedItem = {
  name: string;
  quantity: number;
  price?: number;
  matchedProductId?: number;
};

type ScanRecord = {
  id: number;
  targetType: string | null;
  targetName: string | null;
  extra: { applied?: boolean; parsedItems?: ParsedItem[]; rawText?: string; productCount?: number } | null;
  createdAt: string;
};

type StockProduct = {
  id: number;
  name: string;
  quantity: number;
};

export function ScannerClient({
  recentScans: initialScans,
  stockProducts,
}: {
  recentScans: ScanRecord[];
  stockProducts: StockProduct[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [recentScans, setRecentScans] = useState(initialScans);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR state
  const [dragging, setDragging] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [rawText, setRawText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanType, setScanType] = useState<"facture" | "ticket">("facture");

  // Tab state
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");

  // --- File handling ---

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast("error", "Veuillez selectionner une image (JPG, PNG, etc.)");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Run OCR
      setOcrLoading(true);
      setOcrProgress(0);
      setRawText("");
      setParsedItems([]);

      try {
        const Tesseract = await import("tesseract.js");
        const worker = await Tesseract.createWorker("fra", undefined, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        });

        const {
          data: { text },
        } = await worker.recognize(file);

        await worker.terminate();

        setRawText(text);
        const items = parseOcrText(text, stockProducts);
        setParsedItems(items);

        if (items.length === 0) {
          toast(
            "info",
            "Aucun produit detecte. Vous pouvez ajouter des lignes manuellement.",
          );
        } else {
          toast("success", `${items.length} produit(s) detecte(s)`);
        }
      } catch (err) {
        console.error("OCR error:", err);
        toast("error", "Erreur lors de la reconnaissance de texte");
      } finally {
        setOcrLoading(false);
      }
    },
    [stockProducts],
  );

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // --- OCR text parsing ---

  function parseOcrText(text: string, products: StockProduct[]): ParsedItem[] {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const items: ParsedItem[] = [];

    const skipPatterns =
      /^(total|sous.?total|tva|montant|date|facture|ticket|merci|page|n\u00B0|num|ref|adresse|tel|siret|remise|avoir)/i;

    for (const line of lines) {
      const priceMatch = line.match(/(\d+[.,]\d{2})\s*(?:\u20AC|EUR|eur|euros?)?/);
      const qtyMatch = line.match(
        /(?:^|\s)(\d+)\s*(?:x|X|\*|pcs?|unite?s?|kg|g|L|ml|lot)/i,
      );

      // Need at least a price or quantity pattern to consider this a product line
      if (!priceMatch && !qtyMatch) continue;

      let name = line
        .replace(/\d+[.,]\d{2}\s*(?:\u20AC|EUR|eur|euros?)?/g, "")
        .replace(/(\d+)\s*(?:x|X|\*|pcs?|unite?s?|kg|g|L|ml|lot)/gi, "")
        .replace(/^\s*[-*#]+\s*/, "")
        .trim();

      if (name.length < 2) continue;
      if (skipPatterns.test(name)) continue;

      const price = priceMatch
        ? parseFloat(priceMatch[1].replace(",", "."))
        : undefined;
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

      const matched = products.find(
        (sp) => sp.name.toLowerCase() === name.toLowerCase(),
      );

      items.push({
        name,
        quantity,
        price: price || undefined,
        matchedProductId: matched?.id,
      });
    }

    return items;
  }

  // --- Item editing ---

  function updateItem(
    index: number,
    field: keyof ParsedItem,
    value: string | number,
  ) {
    setParsedItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "name") return { ...item, name: value as string };
        if (field === "quantity")
          return { ...item, quantity: Number(value) || 0 };
        if (field === "price") {
          const num = Number(value);
          return { ...item, price: isNaN(num) || num === 0 ? undefined : num };
        }
        if (field === "matchedProductId") {
          const id = Number(value);
          return { ...item, matchedProductId: id || undefined };
        }
        return item;
      }),
    );
  }

  function removeItem(index: number) {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addEmptyItem() {
    setParsedItems((prev) => [
      ...prev,
      { name: "", quantity: 1, price: undefined },
    ]);
  }

  // --- Save & Apply ---

  function handleSaveAndApply() {
    const validItems = parsedItems.filter((item) => item.name.trim().length > 0);
    if (validItems.length === 0) {
      toast("error", "Aucun produit valide a appliquer");
      return;
    }

    startTransition(async () => {
      const saveResult = await saveScan(scanType, rawText, validItems);
      if (saveResult.error) {
        toast("error", saveResult.error);
        return;
      }

      if (!saveResult.id) {
        toast("error", "Erreur lors de la sauvegarde du scan");
        return;
      }

      const applyResult = await applyScan(saveResult.id);
      if (applyResult.error) {
        toast("error", applyResult.error);
        return;
      }

      toast("success", "Scan applique au stock avec succes");
      resetScan();
      router.refresh();
    });
  }

  function handleSaveOnly() {
    const validItems = parsedItems.filter((item) => item.name.trim().length > 0);
    if (validItems.length === 0) {
      toast("error", "Aucun produit valide a sauvegarder");
      return;
    }

    startTransition(async () => {
      const result = await saveScan(scanType, rawText, validItems);
      if (result.error) {
        toast("error", result.error);
        return;
      }

      toast("success", "Scan sauvegarde");
      resetScan();
      router.refresh();
    });
  }

  function handleApplyExisting(scanId: number) {
    startTransition(async () => {
      const result = await applyScan(scanId);
      if (result.error) {
        toast("error", result.error);
        return;
      }
      toast("success", "Scan applique au stock");
      setRecentScans((prev) =>
        prev.map((s) =>
          s.id === scanId && s.extra
            ? { ...s, extra: { ...s.extra, applied: true } }
            : s,
        ),
      );
      router.refresh();
    });
  }

  function resetScan() {
    setRawText("");
    setParsedItems([]);
    setImagePreview(null);
    setOcrProgress(0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold font-serif text-text">
          Scanner OCR
        </h1>
        <p className="text-sm text-text2 mt-1">
          Scannez vos factures et bons de livraison pour mettre a jour votre
          stock
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg3 rounded-tab p-1 w-fit">
        <button
          className={`px-4 py-2 rounded-tab text-sm font-medium transition-colors ${
            activeTab === "scan"
              ? "bg-bg2 text-text shadow-sm"
              : "text-text2 hover:text-text"
          }`}
          onClick={() => setActiveTab("scan")}
        >
          Nouveau scan
        </button>
        <button
          className={`px-4 py-2 rounded-tab text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "bg-bg2 text-text shadow-sm"
              : "text-text2 hover:text-text"
          }`}
          onClick={() => setActiveTab("history")}
        >
          Historique ({recentScans.length})
        </button>
      </div>

      {activeTab === "scan" && (
        <div className="space-y-6">
          {/* Scan type selector */}
          <div className="flex gap-3">
            <button
              className={`flex-1 py-3 rounded-card border-2 text-sm font-medium transition-all ${
                scanType === "facture"
                  ? "border-terra bg-terra-light/50 text-terra"
                  : "border-border bg-bg2 text-text2 hover:border-terra/50"
              }`}
              onClick={() => setScanType("facture")}
            >
              Facture fournisseur
            </button>
            <button
              className={`flex-1 py-3 rounded-card border-2 text-sm font-medium transition-all ${
                scanType === "ticket"
                  ? "border-terra bg-terra-light/50 text-terra"
                  : "border-border bg-bg2 text-text2 hover:border-terra/50"
              }`}
              onClick={() => setScanType("ticket")}
            >
              Bon de livraison
            </button>
          </div>

          {/* Upload Area */}
          {!imagePreview && !ocrLoading && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 p-12 border-2 border-dashed rounded-card cursor-pointer transition-all ${
                dragging
                  ? "border-terra bg-terra-light/50"
                  : "border-border hover:border-terra bg-bg2"
              }`}
            >
              <span className="text-4xl">&#x1F4F7;</span>
              <p className="text-sm font-medium text-text">
                Deposez votre image ici
              </p>
              <p className="text-xs text-text3">
                ou cliquez pour selectionner un fichier (JPG, PNG)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
            className="hidden"
          />

          {/* OCR Loading */}
          {ocrLoading && (
            <div className="bg-bg2 rounded-card border border-border p-8 text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-sm font-medium text-text">
                Reconnaissance en cours...
              </p>
              <div className="mt-3 w-48 mx-auto bg-bg3 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-terra rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-xs text-text3 mt-2">{ocrProgress}%</p>
            </div>
          )}

          {/* Image Preview + Raw Text */}
          {imagePreview && !ocrLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold font-serif text-text">
                  Resultat du scan
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetScan}>
                    Nouveau scan
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Changer l&#39;image
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div className="bg-bg2 rounded-card border border-border overflow-hidden">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text2">
                      Image scannee
                    </p>
                  </div>
                  <img
                    src={imagePreview}
                    alt="Document scanne"
                    className="w-full max-h-64 object-contain p-2"
                  />
                </div>

                {/* Raw text */}
                <div className="bg-bg2 rounded-card border border-border overflow-hidden">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text2">
                      Texte extrait
                    </p>
                  </div>
                  <div className="p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-text2 whitespace-pre-wrap font-mono">
                      {rawText || "Aucun texte extrait"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Items Table */}
          {(parsedItems.length > 0 || (imagePreview && !ocrLoading)) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold font-serif text-text">
                  Produits detectes ({parsedItems.length})
                </h2>
                <Button variant="ghost" size="sm" onClick={addEmptyItem}>
                  + Ajouter une ligne
                </Button>
              </div>

              {parsedItems.length === 0 ? (
                <div className="bg-bg2 rounded-card border border-border p-6 text-center">
                  <p className="text-sm text-text2">
                    Aucun produit detecte. Ajoutez des lignes manuellement.
                  </p>
                </div>
              ) : (
                <div className="bg-bg2 rounded-card border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-bg3/50">
                          <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text2">
                            Nom
                          </th>
                          <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text2 w-24">
                            Qte
                          </th>
                          <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text2 w-28">
                            Prix
                          </th>
                          <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text2 hidden sm:table-cell">
                            Correspondance
                          </th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parsedItems.map((item, index) => (
                          <tr key={index} className="hover:bg-bg3/20">
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  updateItem(index, "name", e.target.value)
                                }
                                className="w-full bg-transparent border-b border-transparent focus:border-terra text-sm text-text outline-none py-1"
                                placeholder="Nom du produit"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(index, "quantity", e.target.value)
                                }
                                className="w-full bg-transparent border-b border-transparent focus:border-terra text-sm text-text text-center outline-none py-1"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.price ?? ""}
                                onChange={(e) =>
                                  updateItem(index, "price", e.target.value)
                                }
                                className="w-full bg-transparent border-b border-transparent focus:border-terra text-sm text-text text-center outline-none py-1"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="px-3 py-2 hidden sm:table-cell">
                              <select
                                value={item.matchedProductId ?? ""}
                                onChange={(e) =>
                                  updateItem(
                                    index,
                                    "matchedProductId",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent text-xs text-text2 outline-none py-1"
                              >
                                <option value="">Nouveau produit</option>
                                {stockProducts.map((sp) => (
                                  <option key={sp.id} value={sp.id}>
                                    {sp.name} ({sp.quantity})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1 rounded-small text-text3 hover:text-red hover:bg-red-light transition-colors"
                                aria-label="Supprimer la ligne"
                              >
                                &#x2715;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {parsedItems.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button variant="ghost" onClick={resetScan}>
                    Annuler
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSaveOnly}
                    loading={isPending}
                  >
                    Sauvegarder sans appliquer
                  </Button>
                  <Button onClick={handleSaveAndApply} loading={isPending}>
                    Appliquer au stock
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          {recentScans.length === 0 ? (
            <EmptyState
              title="Aucun scan"
              description="Vos scans precedents apparaitront ici."
            />
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => {
                const scanData = scan.extra;
                const isApplied = scanData?.applied === true;
                const itemCount =
                  scanData?.parsedItems?.length ??
                  scanData?.productCount ??
                  0;

                return (
                  <div
                    key={scan.id}
                    className="bg-bg2 rounded-card border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-text">
                            {scan.targetName ?? `Scan #${scan.id}`}
                          </p>
                          {scan.targetType && (
                            <Badge variant="default">
                              {scan.targetType === "facture"
                                ? "Facture"
                                : "Bon de livraison"}
                            </Badge>
                          )}
                          <Badge variant={isApplied ? "green" : "orange"}>
                            {isApplied ? "Applique" : "En attente"}
                          </Badge>
                        </div>
                        <p className="text-xs text-text3 mt-1">
                          {new Date(scan.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}{" "}
                          &middot; {itemCount} produit(s)
                        </p>
                      </div>
                      {!isApplied && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApplyExisting(scan.id)}
                          loading={isPending}
                        >
                          Appliquer
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
