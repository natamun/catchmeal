import { useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight, Filter, Search } from 'lucide-react';

import { BaseDialog } from '../ui/BaseDialog';
import { DropdownPanel } from '../ui/DropdownPanel';
import { Input } from '../ui/Input';
import { SelectDropdown } from '../ui/SelectDropdown';
import {
  EMPTY_ADMIN_FILTER,
  type AdminFilterCriteria,
  type AdminSortOption,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS: {
  value: string;
  label: string;
  option: AdminSortOption;
}[] = [
  {
    value: 'name-asc',
    label: 'Nom (A → Z)',
    option: { field: 'name', direction: 'asc' },
  },
  {
    value: 'name-desc',
    label: 'Nom (Z → A)',
    option: { field: 'name', direction: 'desc' },
  },
  {
    value: 'createdAt-desc',
    label: 'Date de création (récent)',
    option: { field: 'createdAt', direction: 'desc' },
  },
  {
    value: 'createdAt-asc',
    label: 'Date de création (ancien)',
    option: { field: 'createdAt', direction: 'asc' },
  },
  {
    value: 'role-asc',
    label: 'Rôle (A → Z)',
    option: { field: 'role', direction: 'asc' },
  },
  {
    value: 'role-desc',
    label: 'Rôle (Z → A)',
    option: { field: 'role', direction: 'desc' },
  },
];

const ROLE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'USER', label: 'User' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Actif' },
  { value: 'deleted', label: 'Supprimé' },
];

const ONLINE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'online', label: 'En ligne' },
  { value: 'offline', label: 'Hors ligne' },
];

const OAUTH_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'local', label: 'Local' },
  { value: 'google', label: 'Google' },
  { value: 'github', label: 'GitHub' },
  { value: '42', label: '42' },
];

// ─── Main component ───────────────────────────────────────────────────────────

interface AdminSearchBarProps {
  criteria: AdminFilterCriteria;
  onFilterChange: (criteria: AdminFilterCriteria) => void;
}

export default function AdminSearchBar({
  criteria,
  onFilterChange,
}: AdminSearchBarProps) {
  const [draft, setDraft] = useState<AdminFilterCriteria>(EMPTY_ADMIN_FILTER);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);
  const filterDialogRef = useRef<HTMLDialogElement>(null);

  const hasActiveFilters =
    criteria.role !== 'all' ||
    criteria.status !== 'all' ||
    criteria.online !== 'all' ||
    criteria.oauth !== 'all' ||
    criteria.sort.field !== 'name' ||
    criteria.sort.direction !== 'asc';

  const currentSortValue = `${draft.sort.field}-${draft.sort.direction}`;

  const openFilterDialog = () => {
    setDraft({ ...criteria });
    filterDialogRef.current?.showModal();
  };

  const applyFilters = () => {
    onFilterChange({ ...draft, query: criteria.query });
    filterDialogRef.current?.close();
  };

  const resetFilters = () => {
    setDraft({ ...EMPTY_ADMIN_FILTER, query: criteria.query });
  };

  const updateQuery = (query: string) => {
    onFilterChange({ ...criteria, query });
  };

  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-green-400" />
      <Input
        type="text"
        placeholder="Rechercher par identifiant, nom ou email..."
        className="pr-10 pl-9"
        value={criteria.query}
        onChange={(e) => updateQuery(e.target.value)}
      />
      <button
        type="button"
        onClick={openFilterDialog}
        aria-label="Trier et filtrer"
        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-green-400 transition-colors hover:text-green-600"
      >
        <Filter
          className={`h-4 w-4 ${hasActiveFilters ? 'fill-green-400' : ''}`}
        />
      </button>

      <BaseDialog
        dialogRef={filterDialogRef}
        title="Trier et filtrer"
        maxWidth="sm"
        onClose={() => setIsSortOpen(false)}
        onDialogNode={setDialogNode}
      >
        {/* Sort */}
        <Popover.Root open={isSortOpen} onOpenChange={setIsSortOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Trier par"
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm text-green-800 transition-colors hover:bg-green-50"
            >
              {SORT_OPTIONS.find((o) => o.value === currentSortValue)?.label}
              <ChevronRight
                className={`h-4 w-4 text-green-400 transition-transform ${isSortOpen ? 'rotate-90' : ''}`}
              />
            </button>
          </Popover.Trigger>
          <DropdownPanel container={dialogNode} matchAnchorWidth>
            {SORT_OPTIONS.map(({ value, label, option }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setDraft((prev) => ({ ...prev, sort: option }));
                  setIsSortOpen(false);
                }}
                className={`cursor-pointer border-t border-green-100 px-4 py-2 text-left text-sm transition-colors first:border-t-0 hover:bg-green-50 ${
                  value === currentSortValue
                    ? 'font-semibold text-green-800'
                    : 'text-green-600'
                }`}
              >
                {label}
              </button>
            ))}
          </DropdownPanel>
        </Popover.Root>

        {/* Filters */}
        <div className="flex flex-col gap-4 border-t border-green-100 pt-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-medium text-green-700">
                Rôle
              </span>
              <SelectDropdown
                value={draft.role}
                options={ROLE_OPTIONS}
                onChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    role: v as AdminFilterCriteria['role'],
                  }))
                }
                container={dialogNode}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-medium text-green-700">
                Statut
              </span>
              <SelectDropdown
                value={draft.status}
                options={STATUS_OPTIONS}
                onChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: v as AdminFilterCriteria['status'],
                  }))
                }
                container={dialogNode}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-medium text-green-700">
                En ligne
              </span>
              <SelectDropdown
                value={draft.online}
                options={ONLINE_OPTIONS}
                onChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    online: v as AdminFilterCriteria['online'],
                  }))
                }
                container={dialogNode}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs font-medium text-green-700">
                OAuth
              </span>
              <SelectDropdown
                value={draft.oauth}
                options={OAUTH_OPTIONS}
                onChange={(v) =>
                  setDraft((prev) => ({
                    ...prev,
                    oauth: v as AdminFilterCriteria['oauth'],
                  }))
                }
                container={dialogNode}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="cursor-pointer self-start text-xs font-medium text-green-500 underline-offset-2 hover:underline"
          >
            Réinitialiser
          </button>
        </div>

        <button
          type="button"
          onClick={applyFilters}
          className="w-full cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
        >
          Appliquer
        </button>
      </BaseDialog>
    </div>
  );
}
