"use client";

import { Checkbox } from "@/components/ui/Checkbox";

const PERMISSION_LABELS: Record<string, string> = {
  permStockView: "Voir le stock",
  permStockEdit: "Modifier le stock",
  permScanFacture: "Scanner des factures",
  permScanTicket: "Scanner des tickets",
  permAlertsView: "Voir les alertes",
  permSettingsView: "Voir les reglages",
  permEmployeesManage: "Gerer les employes",
  permShopEdit: "Modifier la boutique",
};

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS);

export type PermissionsState = Record<string, boolean>;

interface PermissionsGridProps {
  permissions: PermissionsState;
  onChange: (permissions: PermissionsState) => void;
  disabled?: boolean;
}

export function PermissionsGrid({
  permissions,
  onChange,
  disabled,
}: PermissionsGridProps) {
  function toggle(key: string, checked: boolean) {
    onChange({ ...permissions, [key]: checked });
  }

  const left = PERMISSION_KEYS.slice(0, 4);
  const right = PERMISSION_KEYS.slice(4);

  return (
    <div className="space-y-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
        Permissions
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2.5">
          {left.map((key) => (
            <Checkbox
              key={key}
              label={PERMISSION_LABELS[key]}
              checked={permissions[key] ?? false}
              onChange={(checked) => toggle(key, checked)}
              disabled={disabled}
            />
          ))}
        </div>
        <div className="space-y-2.5">
          {right.map((key) => (
            <Checkbox
              key={key}
              label={PERMISSION_LABELS[key]}
              checked={permissions[key] ?? false}
              onChange={(checked) => toggle(key, checked)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { PERMISSION_KEYS, PERMISSION_LABELS };
