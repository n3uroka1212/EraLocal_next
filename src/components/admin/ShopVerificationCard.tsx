"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { DocumentViewer } from "./DocumentViewer";
import { verifyShop } from "@/actions/admin";
import { toast } from "@/components/ui/Toast";
import type { ShopForVerification } from "./ShopVerificationClient";

interface Props {
  shop: ShopForVerification;
}

const STATUS_BADGE: Record<
  string,
  { variant: "orange" | "green" | "red"; label: string }
> = {
  pending: { variant: "orange", label: "En attente" },
  verified: { variant: "green", label: "Verifiee" },
  rejected: { variant: "red", label: "Rejetee" },
};

interface DocEntry {
  label: string;
  url: string | null;
}

export function ShopVerificationCard({ shop }: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const badge = STATUS_BADGE[shop.verificationStatus] ?? STATUS_BADGE.pending;

  const documents: DocEntry[] = [
    { label: "Piece d'identite (recto)", url: shop.docIdRecto },
    { label: "Piece d'identite (verso)", url: shop.docIdVerso },
    { label: "Justificatif de domicile", url: shop.docJustificatif },
    { label: "Kbis", url: shop.docKbis },
  ];

  const availableDocs = documents.filter((d) => d.url);

  function handleApprove() {
    startTransition(async () => {
      const result = await verifyShop(shop.id, "verified");
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", `Boutique "${shop.name}" approuvee`);
      }
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      toast("error", "Veuillez indiquer une raison de rejet");
      return;
    }
    startTransition(async () => {
      const result = await verifyShop(shop.id, "rejected", reason.trim());
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", `Boutique "${shop.name}" rejetee`);
        setRejectOpen(false);
        setReason("");
      }
    });
  }

  const createdDate = new Date(shop.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="bg-bg2 border border-border rounded-card p-5 space-y-4 animate-[cardFadeIn_0.3s_ease]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-text text-base truncate">
                {shop.name}
              </h3>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <p className="text-sm text-text2 mt-0.5">{shop.email}</p>
          </div>
          <p className="text-xs text-text3 whitespace-nowrap">{createdDate}</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Detail label="SIRET" value={shop.siret} />
          <Detail label="Categorie" value={shop.category} />
          <Detail label="Ville" value={shop.city} />
          <Detail label="Slug" value={shop.slug} />
        </div>

        {/* Rejection reason (if rejected) */}
        {shop.verificationStatus === "rejected" && shop.verificationReason && (
          <div className="bg-red-light border border-red/10 rounded-input px-4 py-3">
            <p className="text-xs font-semibold text-red mb-0.5">
              Raison du rejet
            </p>
            <p className="text-sm text-red/80">{shop.verificationReason}</p>
          </div>
        )}

        {/* Documents */}
        {availableDocs.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text2 mb-2">
              Documents
            </p>
            <div className="flex flex-wrap gap-2">
              {availableDocs.map((doc) => (
                <button
                  key={doc.label}
                  onClick={() => setViewingDoc(doc.url)}
                  className="flex items-center gap-2 bg-bg3 border border-border rounded-input px-3 py-2 text-xs text-text2 hover:border-terra/30 hover:text-terra transition-colors cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  {doc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons (pending only) */}
        {shop.verificationStatus === "pending" && (
          <div className="flex gap-3 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              loading={isPending}
            >
              Approuver
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setRejectOpen(true)}
              disabled={isPending}
            >
              Rejeter
            </Button>
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Rejeter la boutique"
      >
        <div className="space-y-4">
          <p className="text-sm text-text2">
            Indiquez la raison du rejet pour{" "}
            <span className="font-semibold text-text">{shop.name}</span>.
          </p>
          <Textarea
            label="Raison du rejet"
            placeholder="Ex: Documents illisibles, SIRET invalide..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={isPending}
              disabled={!reason.trim()}
            >
              Confirmer le rejet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document viewer */}
      <DocumentViewer
        url={viewingDoc}
        onClose={() => setViewingDoc(null)}
      />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-text3">
        {label}
      </p>
      <p className="text-sm text-text truncate">{value ?? "—"}</p>
    </div>
  );
}
