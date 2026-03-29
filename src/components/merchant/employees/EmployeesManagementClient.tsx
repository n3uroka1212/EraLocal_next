"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { EmployeeForm, type EmployeeFormData } from "./EmployeeForm";
import { PinDisplay } from "./PinDisplay";
import { PERMISSION_LABELS, PERMISSION_KEYS } from "./PermissionsGrid";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  regeneratePin,
} from "@/actions/employees";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permStockView: boolean;
  permStockEdit: boolean;
  permScanFacture: boolean;
  permScanTicket: boolean;
  permAlertsView: boolean;
  permSettingsView: boolean;
  permEmployeesManage: boolean;
  permShopEdit: boolean;
  createdAt: string;
}

interface EmployeesManagementClientProps {
  employees: Employee[];
}

function employeeToPermissions(emp: Employee): Record<string, boolean> {
  return {
    permStockView: emp.permStockView,
    permStockEdit: emp.permStockEdit,
    permScanFacture: emp.permScanFacture,
    permScanTicket: emp.permScanTicket,
    permAlertsView: emp.permAlertsView,
    permSettingsView: emp.permSettingsView,
    permEmployeesManage: emp.permEmployeesManage,
    permShopEdit: emp.permShopEdit,
  };
}

function buildFormData(data: EmployeeFormData): FormData {
  const fd = new FormData();
  fd.set("name", data.name);
  fd.set("email", data.email);
  fd.set("role", data.role);
  for (const key of PERMISSION_KEYS) {
    fd.set(key, data.permissions[key] ? "true" : "false");
  }
  return fd;
}

export function EmployeesManagementClient({ employees: initial }: EmployeesManagementClientProps) {
  const [employees, setEmployees] = useState<Employee[]>(initial);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [pinData, setPinData] = useState<{ pin: string; name: string } | null>(null);
  const [regenEmployee, setRegenEmployee] = useState<Employee | null>(null);

  const [isPending, startTransition] = useTransition();
  const [actionLoading, setActionLoading] = useState(false);

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  async function handleCreate(data: EmployeeFormData) {
    setActionLoading(true);
    try {
      const fd = buildFormData(data);
      const result = await createEmployee(null, fd);

      if (result.error) {
        toast("error", result.error);
        return;
      }

      if (result.success && result.id && result.pin) {
        const newEmployee: Employee = {
          id: result.id,
          name: data.name,
          email: data.email,
          role: data.role,
          active: true,
          permStockView: data.permissions.permStockView ?? false,
          permStockEdit: data.permissions.permStockEdit ?? false,
          permScanFacture: data.permissions.permScanFacture ?? false,
          permScanTicket: data.permissions.permScanTicket ?? false,
          permAlertsView: data.permissions.permAlertsView ?? false,
          permSettingsView: data.permissions.permSettingsView ?? false,
          permEmployeesManage: data.permissions.permEmployeesManage ?? false,
          permShopEdit: data.permissions.permShopEdit ?? false,
          createdAt: new Date().toISOString(),
        };
        setEmployees((prev) => [newEmployee, ...prev]);
        setShowCreateModal(false);
        setPinData({ pin: result.pin, name: data.name });
        toast("success", "Employe cree avec succes");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdate(data: EmployeeFormData) {
    if (!editingEmployee) return;
    setActionLoading(true);
    try {
      const fd = buildFormData(data);
      const result = await updateEmployee(editingEmployee.id, null, fd);

      if (result.error) {
        toast("error", result.error);
        return;
      }

      if (result.success) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployee.id
              ? {
                  ...emp,
                  name: data.name,
                  email: data.email,
                  role: data.role,
                  permStockView: data.permissions.permStockView ?? false,
                  permStockEdit: data.permissions.permStockEdit ?? false,
                  permScanFacture: data.permissions.permScanFacture ?? false,
                  permScanTicket: data.permissions.permScanTicket ?? false,
                  permAlertsView: data.permissions.permAlertsView ?? false,
                  permSettingsView: data.permissions.permSettingsView ?? false,
                  permEmployeesManage: data.permissions.permEmployeesManage ?? false,
                  permShopEdit: data.permissions.permShopEdit ?? false,
                }
              : emp,
          ),
        );
        setEditingEmployee(null);
        toast("success", "Employe mis a jour");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!deletingEmployee) return;
    setActionLoading(true);
    try {
      const result = await deleteEmployee(deletingEmployee.id);

      if (result.error) {
        toast("error", result.error);
        return;
      }

      if (result.success) {
        setEmployees((prev) => prev.filter((emp) => emp.id !== deletingEmployee.id));
        setDeletingEmployee(null);
        toast("success", "Employe supprime");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRegeneratePin() {
    if (!regenEmployee) return;
    setActionLoading(true);
    try {
      const result = await regeneratePin(regenEmployee.id);

      if (result.error) {
        toast("error", result.error);
        return;
      }

      if (result.success && result.pin) {
        setRegenEmployee(null);
        setPinData({ pin: result.pin, name: regenEmployee.name });
        toast("success", "PIN regenere avec succes");
      }
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Employes</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Nouvel employe
        </Button>
      </div>

      {/* Employees list */}
      {employees.length === 0 ? (
        <div className="text-center py-12 bg-bg2 rounded-card border border-border">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-text2 text-sm">Aucun employe pour le moment.</p>
          <p className="text-text3 text-xs mt-1">
            Ajoutez votre premier employe pour commencer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-bg2 rounded-card border border-border overflow-hidden transition-colors hover:border-terra/40"
            >
              {/* Row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleExpand(emp.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-terra-light flex items-center justify-center text-terra font-semibold text-sm shrink-0">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{emp.name}</p>
                    <p className="text-xs text-text3 truncate">{emp.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={emp.role === "manager" ? "purple" : "default"}>
                    {emp.role === "manager" ? "Manager" : "Employe"}
                  </Badge>
                  <Badge variant={emp.active ? "green" : "red"}>
                    {emp.active ? "Actif" : "Inactif"}
                  </Badge>
                  <span
                    className={`text-text3 transition-transform duration-200 text-xs ${
                      expandedId === emp.id ? "rotate-180" : ""
                    }`}
                  >
                    &#9660;
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === emp.id && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                  {/* Permissions */}
                  <div>
                    <p className="text-xs font-semibold text-text2 uppercase tracking-wide mb-2">
                      Permissions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {PERMISSION_KEYS.map((key) => {
                        const enabled = emp[key as keyof Employee] as boolean;
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                enabled ? "bg-green" : "bg-bg4"
                              }`}
                            />
                            <span className={enabled ? "text-text" : "text-text3"}>
                              {PERMISSION_LABELS[key]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEmployee(emp);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRegenEmployee(emp);
                      }}
                    >
                      Regenerer PIN
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingEmployee(emp);
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel employe"
        className="max-w-lg"
      >
        <EmployeeForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={actionLoading}
          submitLabel="Creer"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Modifier l'employe"
        className="max-w-lg"
      >
        {editingEmployee && (
          <EmployeeForm
            initialData={{
              name: editingEmployee.name,
              email: editingEmployee.email,
              role: editingEmployee.role,
              permissions: employeeToPermissions(editingEmployee),
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingEmployee(null)}
            loading={actionLoading}
            submitLabel="Mettre a jour"
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDelete}
        title="Supprimer l'employe"
        message={`Etes-vous sur de vouloir supprimer ${deletingEmployee?.name} ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={actionLoading}
      />

      {/* Regenerate PIN Confirmation */}
      <ConfirmDialog
        open={!!regenEmployee}
        onClose={() => setRegenEmployee(null)}
        onConfirm={handleRegeneratePin}
        title="Regenerer le PIN"
        message={`Generer un nouveau PIN pour ${regenEmployee?.name} ? L'ancien PIN ne fonctionnera plus.`}
        confirmLabel="Regenerer"
        variant="primary"
        loading={actionLoading}
      />

      {/* PIN Display */}
      {pinData && (
        <PinDisplay
          open={true}
          onClose={() => setPinData(null)}
          pin={pinData.pin}
          employeeName={pinData.name}
        />
      )}
    </div>
  );
}
