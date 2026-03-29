"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PermissionsGrid, PERMISSION_KEYS, type PermissionsState } from "./PermissionsGrid";

export interface EmployeeFormData {
  name: string;
  email: string;
  role: string;
  permissions: PermissionsState;
}

interface EmployeeFormProps {
  initialData?: EmployeeFormData;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const ROLE_OPTIONS = [
  { value: "employee", label: "Employe" },
  { value: "manager", label: "Manager" },
];

function buildDefaultPermissions(initial?: PermissionsState): PermissionsState {
  const perms: PermissionsState = {};
  for (const key of PERMISSION_KEYS) {
    perms[key] = initial?.[key] ?? false;
  }
  return perms;
}

export function EmployeeForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = "Enregistrer",
}: EmployeeFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState(initialData?.role ?? "employee");
  const [permissions, setPermissions] = useState<PermissionsState>(
    buildDefaultPermissions(initialData?.permissions),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Le nom est requis";
    if (!email.trim()) {
      errs.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Email invalide";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), email: email.trim(), role, permissions });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de l'employe"
        error={errors.name}
        required
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@exemple.com"
        error={errors.email}
        required
      />

      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        options={ROLE_OPTIONS}
      />

      <PermissionsGrid
        permissions={permissions}
        onChange={setPermissions}
        disabled={loading}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
