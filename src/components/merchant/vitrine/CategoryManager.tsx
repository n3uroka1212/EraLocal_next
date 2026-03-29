"use client";

interface CategoryManagerProps {
  categories: string[];
  featured: string[];
  onFeaturedChange: (featured: string[]) => void;
  onClose: () => void;
}

export function CategoryManager({
  categories,
  featured,
  onFeaturedChange,
  onClose,
}: CategoryManagerProps) {
  function toggleFeatured(cat: string) {
    if (featured.includes(cat)) {
      onFeaturedChange(featured.filter((c) => c !== cat));
    } else {
      onFeaturedChange([...featured, cat]);
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-bg2 rounded-t-sheet p-6 space-y-4 animate-[slideUp_0.2s_ease-out]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">
            Gerer les categories
          </h3>
          <button
            onClick={onClose}
            className="text-text3 hover:text-text transition-colors"
          >
            &#x2715;
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-text3">
            Aucune categorie. Ajoutez des categories a vos produits.
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => {
              const isFeatured = featured.includes(cat);
              return (
                <div
                  key={cat}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-input border transition-colors ${
                    isFeatured
                      ? "border-terra bg-terra-light/50"
                      : "border-border"
                  }`}
                >
                  <span className="text-sm text-text">{cat}</span>
                  <button
                    onClick={() => toggleFeatured(cat)}
                    className={`text-lg transition-transform ${
                      isFeatured
                        ? "text-[goldenrod] animate-[heartbeat_0.3s]"
                        : "text-text3 hover:text-[goldenrod]"
                    }`}
                    title={
                      isFeatured
                        ? "Retirer de la mise en avant"
                        : "Mettre en avant"
                    }
                  >
                    {isFeatured ? "★" : "☆"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
