/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Control builders for the JSON prompt renderer.
 * Each builder creates a Bootstrap 5 form element from a PromptControl definition.
 */

import { ensureSession, notifyListeners, addListener } from './prompt-renderer';
import { sanitizeUrl } from './dom-helpers';
import { getLibraries, getTables, getColumns, getUniqueColumnValues } from '../api/compute-data-api';
import type {
  PromptControl,
  PromptState,
  PromptItem,
  PromptDynamicItems,
  ColumnInfo,
} from '../types';

type ControlBuilder = (control: PromptControl, state: PromptState) => HTMLElement;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createFormGroup(control: PromptControl): HTMLElement {
  const group = document.createElement('div');
  group.className = 'mb-3';
  if (control.indent) {
    group.style.marginLeft = `${control.indent * 1.5}rem`;
  }
  return group;
}

function createLabel(control: PromptControl, forId: string): HTMLElement {
  const label = document.createElement('label');
  label.className = 'form-label';
  label.setAttribute('for', forId);
  label.textContent = control.label ?? control.id;
  if (control.required) {
    const asterisk = document.createElement('span');
    asterisk.className = 'text-danger ms-1';
    asterisk.textContent = '*';
    label.appendChild(asterisk);
  }
  return label;
}

function isStaticItems(items: unknown): items is PromptItem[] {
  return Array.isArray(items);
}

function isDynamicItems(items: unknown): items is PromptDynamicItems {
  return typeof items === 'object' && items !== null && 'ref' in items;
}

// ---------------------------------------------------------------------------
// Display-only controls
// ---------------------------------------------------------------------------

function buildText(control: PromptControl): HTMLElement {
  const group = createFormGroup(control);
  const p = document.createElement('p');
  p.className = 'form-text';
  p.textContent = control.text ?? '';
  group.appendChild(p);
  return group;
}

function buildLink(control: PromptControl): HTMLElement {
  const group = createFormGroup(control);
  const a = document.createElement('a');
  a.href = sanitizeUrl(control.url ?? '#');
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = control.label ?? control.url ?? 'Link';
  group.appendChild(a);
  return group;
}

// ---------------------------------------------------------------------------
// Basic input controls
// ---------------------------------------------------------------------------

function buildTextfield(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-control';
  input.id = inputId;
  if (control.placeholder) input.placeholder = control.placeholder;
  if (control.required) input.required = true;
  if (control.regexp) input.pattern = control.regexp;
  input.value = (state.values[control.id] as string) ?? '';

  input.addEventListener('input', () => {
    state.values[control.id] = input.value;
    notifyListeners(state, control.id, input.value);
  });

  group.appendChild(input);
  return group;
}

function buildTextarea(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const textarea = document.createElement('textarea');
  textarea.className = 'form-control';
  textarea.id = inputId;
  textarea.rows = 4;
  if (control.placeholder) textarea.placeholder = control.placeholder;
  if (control.required) textarea.required = true;
  textarea.value = (state.values[control.id] as string) ?? '';

  textarea.addEventListener('input', () => {
    state.values[control.id] = textarea.value;
    notifyListeners(state, control.id, textarea.value);
  });

  group.appendChild(textarea);
  return group;
}

function buildNumberfield(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'form-control';
  input.id = inputId;
  if (control.min != null) input.min = String(control.min);
  if (control.max != null) input.max = String(control.max);
  if (control.integer) input.step = '1';
  if (control.placeholder) input.placeholder = control.placeholder;
  if (control.required) input.required = true;

  const currentVal = state.values[control.id];
  if (currentVal != null) input.value = String(currentVal);

  input.addEventListener('change', () => {
    const val = input.value === '' ? null : Number(input.value);
    // Validate excludemin/excludemax
    if (val != null && control.excludemin && control.min != null && val <= Number(control.min)) {
      input.setCustomValidity(`Value must be greater than ${control.min}`);
    } else if (val != null && control.excludemax && control.max != null && val >= Number(control.max)) {
      input.setCustomValidity(`Value must be less than ${control.max}`);
    } else {
      input.setCustomValidity('');
    }
    state.values[control.id] = val;
    notifyListeners(state, control.id, val);
  });

  group.appendChild(input);
  return group;
}

function buildNumstepper(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'form-control';
  input.id = inputId;
  if (control.min != null) input.min = String(control.min);
  if (control.max != null) input.max = String(control.max);
  input.step = String(control.stepsize ?? 1);
  if (control.required) input.required = true;

  const currentVal = state.values[control.id];
  if (currentVal != null) input.value = String(currentVal);

  input.addEventListener('change', () => {
    state.values[control.id] = input.value === '' ? null : Number(input.value);
    notifyListeners(state, control.id, state.values[control.id]);
  });

  group.appendChild(input);
  return group;
}

function buildCheckbox(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'form-check';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'form-check-input';
  input.id = inputId;
  input.checked = Boolean(state.values[control.id]);

  input.addEventListener('change', () => {
    state.values[control.id] = input.checked;
    notifyListeners(state, control.id, input.checked);
  });

  const label = document.createElement('label');
  label.className = 'form-check-label';
  label.setAttribute('for', inputId);
  label.textContent = control.label ?? control.id;

  wrapper.appendChild(input);
  wrapper.appendChild(label);
  group.appendChild(wrapper);
  return group;
}

function buildColorpicker(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const input = document.createElement('input');
  input.type = 'color';
  input.className = 'form-control form-control-color';
  input.id = inputId;
  input.value = (state.values[control.id] as string) ?? '#000000';

  input.addEventListener('input', () => {
    state.values[control.id] = input.value;
    notifyListeners(state, control.id, input.value);
  });

  group.appendChild(input);
  return group;
}

function buildPath(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group';

  const icon = document.createElement('span');
  icon.className = 'input-group-text';
  icon.textContent = control.pathtype === 'folder' ? '\u{1F4C1}' : '\u{1F4C4}';
  inputGroup.appendChild(icon);

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-control';
  input.id = inputId;
  if (control.placeholder) input.placeholder = control.placeholder;
  if (control.required) input.required = true;
  input.value = (state.values[control.id] as string) ?? '';

  input.addEventListener('input', () => {
    state.values[control.id] = input.value;
    notifyListeners(state, control.id, input.value);
  });

  inputGroup.appendChild(input);
  group.appendChild(inputGroup);
  return group;
}

function buildDatetime(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const input = document.createElement('input');
  input.className = 'form-control';
  input.id = inputId;

  // Map subtype to HTML input type
  switch (control.subtype) {
    case 'time':
      input.type = 'time';
      break;
    case 'month':
      input.type = 'month';
      break;
    case 'datetime':
      input.type = 'datetime-local';
      break;
    default:
      input.type = 'date';
  }

  if (control.min) input.min = String(control.min);
  if (control.max) input.max = String(control.max);
  if (control.required) input.required = true;
  input.value = (state.values[control.id] as string) ?? '';

  input.addEventListener('change', () => {
    state.values[control.id] = input.value;
    notifyListeners(state, control.id, input.value);
  });

  group.appendChild(input);
  return group;
}

// ---------------------------------------------------------------------------
// Selection controls
// ---------------------------------------------------------------------------

function buildDropdown(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = inputId;
  if (control.required) select.required = true;

  // Placeholder option
  if (control.placeholder) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = control.placeholder;
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
  }

  if (isStaticItems(control.items)) {
    // Static items
    for (const item of control.items) {
      const opt = document.createElement('option');
      opt.value = String(item.value);
      opt.textContent = item.label ?? String(item.value);
      select.appendChild(opt);
    }
    // Set initial value
    const currentVal = state.values[control.id] as { value?: string } | string | null;
    if (currentVal != null) {
      select.value = typeof currentVal === 'object' ? String(currentVal.value ?? '') : String(currentVal);
    }
  } else if (isDynamicItems(control.items)) {
    // Dynamic items — subscribe to referenced control.
    // If the ref points to a columnselector, fetch unique row values from the
    // selected column in the referenced table. Otherwise treat as column names.
    const refName = control.items.ref;

    const clearOptions = () => {
      while (select.options.length > (control.placeholder ? 1 : 0)) {
        select.remove(select.options.length - 1);
      }
    };

    const populateFromValues = (values: string[]) => {
      clearOptions();
      for (const val of values) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
      }
    };

    addListener(state, refName, async (columns: unknown) => {
      clearOptions();

      if (!Array.isArray(columns) || columns.length === 0) return;

      // Check if the referenced control is a columnselector
      const refDef = state.controlDefs.get(refName);
      if (refDef?.type === 'columnselector' && refDef.table) {
        // Fetch unique values from the selected column in the inputtable
        const tableVal = state.values[refDef.table] as { library?: string; table?: string } | null;
        if (tableVal?.library && tableVal?.table) {
          const colName = typeof columns[0] === 'string'
            ? columns[0]
            : ((columns[0] as Record<string, unknown>).value as string) ?? '';
          if (colName) {
            // Show a loading indicator
            const loadOpt = document.createElement('option');
            loadOpt.value = '';
            loadOpt.textContent = state.i18n.loadingValues ?? 'Loading values...';
            loadOpt.disabled = true;
            loadOpt.selected = true;
            select.appendChild(loadOpt);

            try {
              const sessionId = await ensureSession(state);
              const uniqueValues = await getUniqueColumnValues(
                sessionId, tableVal.library, tableVal.table, colName
              );
              populateFromValues(uniqueValues);
            } catch (e) {
              console.log('[promptRenderer] Failed to load unique column values:', e);
              clearOptions();
            }
            return;
          }
        }
      }

      // Fallback: list the values directly (e.g. column names)
      for (const col of columns as Array<{ value?: string } | string>) {
        const opt = document.createElement('option');
        const val = typeof col === 'string' ? col : (col.value ?? '');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
      }
    });
  }

  select.addEventListener('change', () => {
    state.values[control.id] = select.value || null;
    notifyListeners(state, control.id, state.values[control.id]);
  });

  group.appendChild(select);
  return group;
}

function buildRadiogroup(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);

  if (control.label) {
    const legend = document.createElement('label');
    legend.className = 'form-label';
    legend.textContent = control.label;
    group.appendChild(legend);
  }

  const items = isStaticItems(control.items) ? control.items : [];
  const currentVal = state.values[control.id] as { value?: string } | string | null;
  const currentStr = currentVal != null
    ? (typeof currentVal === 'object' ? String(currentVal.value ?? '') : String(currentVal))
    : '';

  for (const item of items) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-check';

    const input = document.createElement('input');
    input.type = 'radio';
    input.className = 'form-check-input';
    input.name = `prompt-radio-${control.id}`;
    input.id = `prompt-${control.id}-${item.value}`;
    input.value = String(item.value);
    if (String(item.value) === currentStr) input.checked = true;

    input.addEventListener('change', () => {
      state.values[control.id] = { value: input.value, label: item.label ?? input.value };
      notifyListeners(state, control.id, state.values[control.id]);
    });

    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.setAttribute('for', input.id);
    label.textContent = item.label ?? String(item.value);

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    group.appendChild(wrapper);
  }

  return group;
}

function buildList(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = inputId;
  select.multiple = true;
  select.size = 5;

  function populateOptions(items: PromptItem[]) {
    select.innerHTML = '';
    for (const item of items) {
      const opt = document.createElement('option');
      opt.value = String(item.value);
      opt.textContent = item.label ?? String(item.value);
      select.appendChild(opt);
    }
    // Restore selected values
    const currentVal = state.values[control.id];
    if (Array.isArray(currentVal)) {
      for (const opt of Array.from(select.options)) {
        opt.selected = currentVal.some(
          (v: unknown) => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>).value : v) === opt.value
        );
      }
    }
  }

  if (isStaticItems(control.items)) {
    populateOptions(control.items);
  } else if (isDynamicItems(control.items)) {
    const refName = control.items.ref;
    addListener(state, refName, async (columns: unknown) => {
      if (!Array.isArray(columns) || columns.length === 0) return;

      // Check if the referenced control is a columnselector → fetch unique row values
      const refDef = state.controlDefs.get(refName);
      if (refDef?.type === 'columnselector' && refDef.table) {
        const tableVal = state.values[refDef.table] as { library?: string; table?: string } | null;
        if (tableVal?.library && tableVal?.table) {
          const colName = typeof columns[0] === 'string'
            ? columns[0]
            : ((columns[0] as Record<string, unknown>).value as string) ?? '';
          if (colName) {
            try {
              const sessionId = await ensureSession(state);
              const uniqueValues = await getUniqueColumnValues(
                sessionId, tableVal.library, tableVal.table, colName
              );
              populateOptions(uniqueValues.map((v) => ({ value: v })));
            } catch (e) {
              console.log('[promptRenderer] Failed to load unique column values for list:', e);
            }
            return;
          }
        }
      }

      // Fallback: list the values directly
      const items: PromptItem[] = columns.map((c: unknown) => ({
        value: typeof c === 'string' ? c : ((c as Record<string, unknown>).value as string) ?? '',
      }));
      populateOptions(items);
    });
  }

  select.addEventListener('change', () => {
    const selected = Array.from(select.selectedOptions).map((o) => ({
      value: o.value,
    }));
    state.values[control.id] = selected;
    notifyListeners(state, control.id, selected);
  });

  group.appendChild(select);
  return group;
}

// ---------------------------------------------------------------------------
// Data-connected controls
// ---------------------------------------------------------------------------

function buildInputtable(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const row = document.createElement('div');
  row.className = 'row g-2';

  // Library dropdown
  const libCol = document.createElement('div');
  libCol.className = 'col-6';
  const libSelect = document.createElement('select');
  libSelect.className = 'form-select';
  libSelect.id = `${inputId}-lib`;
  const libPlaceholder = document.createElement('option');
  libPlaceholder.value = '';
  libPlaceholder.textContent = state.i18n.selectLibrary ?? 'Select Library...';
  libPlaceholder.disabled = true;
  libPlaceholder.selected = true;
  libSelect.appendChild(libPlaceholder);
  libCol.appendChild(libSelect);

  // Table dropdown
  const tblCol = document.createElement('div');
  tblCol.className = 'col-6';
  const tblSelect = document.createElement('select');
  tblSelect.className = 'form-select';
  tblSelect.id = `${inputId}-tbl`;
  const tblPlaceholder = document.createElement('option');
  tblPlaceholder.value = '';
  tblPlaceholder.textContent = state.i18n.selectTable ?? 'Select Table...';
  tblPlaceholder.disabled = true;
  tblPlaceholder.selected = true;
  tblSelect.appendChild(tblPlaceholder);
  tblCol.appendChild(tblSelect);

  row.appendChild(libCol);
  row.appendChild(tblCol);
  group.appendChild(row);

  // Set initial values from state
  const currentVal = state.values[control.id] as { library?: string; table?: string } | null;

  // Load libraries asynchronously
  ensureSession(state)
    .then(async (sessionId) => {
      if (!state.libraries) {
        const libs = await getLibraries(sessionId);
        state.libraries = libs.map((l) => l.name);
      }
      for (const lib of state.libraries) {
        const opt = document.createElement('option');
        opt.value = lib;
        opt.textContent = lib;
        libSelect.appendChild(opt);
      }
      // Restore initial library selection
      if (currentVal?.library) {
        libSelect.value = currentVal.library;
        libSelect.dispatchEvent(new Event('change'));
      }
    })
    .catch((e) => console.log('[promptRenderer] Failed to load libraries:', e));

  // Library change -> load tables
  libSelect.addEventListener('change', async () => {
    const lib = libSelect.value;
    // Clear table dropdown
    tblSelect.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = state.i18n.loadingTables ?? 'Loading tables...';
    ph.disabled = true;
    ph.selected = true;
    tblSelect.appendChild(ph);

    try {
      const sessionId = await ensureSession(state);
      let tables = state.tableCache.get(lib);
      if (!tables) {
        const tblData = await getTables(sessionId, lib);
        tables = tblData.map((t) => t.name);
        state.tableCache.set(lib, tables);
      }
      tblSelect.innerHTML = '';
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = state.i18n.selectTable ?? 'Select Table...';
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      tblSelect.appendChild(defaultOpt);

      for (const tbl of tables) {
        const opt = document.createElement('option');
        opt.value = tbl;
        opt.textContent = tbl;
        tblSelect.appendChild(opt);
      }

      // Restore initial table selection
      if (currentVal?.library === lib && currentVal?.table) {
        tblSelect.value = currentVal.table;
        tblSelect.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.log('[promptRenderer] Failed to load tables:', e);
    }
  });

  // Table change -> update value and notify
  tblSelect.addEventListener('change', () => {
    const val = { library: libSelect.value, table: tblSelect.value };
    state.values[control.id] = val;
    console.log(`[promptRenderer] inputtable ${control.id} changed:`, val);
    notifyListeners(state, control.id, val);
  });

  return group;
}

function buildColumnselector(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = inputId;
  select.multiple = true;
  select.size = 5;

  async function loadColumns(tableVal: unknown) {
    const tblObj = tableVal as { library?: string; table?: string } | null;
    if (!tblObj?.library || !tblObj?.table) return;

    const cacheKey = `${tblObj.library}.${tblObj.table}`;
    let columns: ColumnInfo[];

    if (state.columnCache.has(cacheKey)) {
      columns = state.columnCache.get(cacheKey)!;
    } else {
      try {
        const sessionId = await ensureSession(state);
        columns = await getColumns(sessionId, tblObj.library, tblObj.table);
        state.columnCache.set(cacheKey, columns);
      } catch (e) {
        console.log('[promptRenderer] Failed to load columns:', e);
        return;
      }
    }

    // Filter by columntype
    const ct = control.columntype ?? 'a';
    const filtered = columns.filter((col) => {
      if (ct === 'a') return true;
      if (ct === 'c') return col.type === 'char' || col.type === 'varchar';
      if (ct === 'n') return col.type === 'num' || col.type === 'double';
      return true;
    });

    select.innerHTML = '';
    for (const col of filtered) {
      const opt = document.createElement('option');
      opt.value = col.name;
      opt.textContent = col.label ? `${col.name} (${col.label})` : col.name;
      select.appendChild(opt);
    }

    // Restore selections and notify listeners (important for hidden controls with defaults)
    const currentVal = state.values[control.id];
    if (Array.isArray(currentVal)) {
      for (const opt of Array.from(select.options)) {
        opt.selected = currentVal.some(
          (v: unknown) => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>).value : v) === opt.value
        );
      }
      notifyListeners(state, control.id, currentVal);
    }
  }

  // Subscribe to the referenced inputtable
  if (control.table) {
    addListener(state, control.table, loadColumns);
    // Try loading immediately if inputtable already has a value
    const existingVal = state.values[control.table];
    if (existingVal) {
      loadColumns(existingVal);
    }
  }

  select.addEventListener('change', () => {
    const selected = Array.from(select.selectedOptions).map((o) => ({
      value: o.value,
    }));
    state.values[control.id] = selected;
    notifyListeners(state, control.id, selected);
  });

  group.appendChild(select);
  return group;
}

function buildLibraryselector(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const select = document.createElement('select');
  select.className = 'form-select';
  select.id = inputId;
  if (control.required) select.required = true;

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = state.i18n.selectLibrary ?? 'Select Library...';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  // Load libraries asynchronously
  ensureSession(state)
    .then(async (sessionId) => {
      if (!state.libraries) {
        const libs = await getLibraries(sessionId);
        state.libraries = libs.map((l) => l.name);
      }
      for (const lib of state.libraries) {
        const opt = document.createElement('option');
        opt.value = lib;
        opt.textContent = lib;
        select.appendChild(opt);
      }
      const currentVal = state.values[control.id];
      if (Array.isArray(currentVal) && currentVal.length > 0) {
        const first = currentVal[0] as { value?: string } | string;
        select.value = typeof first === 'object' ? (first.value ?? '') : first;
      }
    })
    .catch((e) => console.log('[promptRenderer] Failed to load libraries:', e));

  select.addEventListener('change', () => {
    state.values[control.id] = [{ value: select.value }];
    notifyListeners(state, control.id, state.values[control.id]);
  });

  group.appendChild(select);
  return group;
}

function buildOutputtable(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  const inputId = `prompt-${control.id}`;
  group.appendChild(createLabel(control, inputId));

  const row = document.createElement('div');
  row.className = 'row g-2';

  const currentVal = state.values[control.id] as { library?: string; table?: string } | null;

  // Library input
  const libCol = document.createElement('div');
  libCol.className = 'col-6';
  const libInput = document.createElement('input');
  libInput.type = 'text';
  libInput.className = 'form-control';
  libInput.placeholder = state.i18n.libraryPlaceholder ?? 'Library (e.g. WORK)';
  libInput.value = currentVal?.library ?? '';
  libCol.appendChild(libInput);

  // Table input
  const tblCol = document.createElement('div');
  tblCol.className = 'col-6';
  const tblInput = document.createElement('input');
  tblInput.type = 'text';
  tblInput.className = 'form-control';
  tblInput.placeholder = control.placeholder || state.i18n.tablePlaceholder || 'Table name';
  tblInput.value = currentVal?.table ?? '';
  tblCol.appendChild(tblInput);

  function updateValue() {
    state.values[control.id] = { library: libInput.value, table: tblInput.value };
    notifyListeners(state, control.id, state.values[control.id]);
  }

  libInput.addEventListener('input', updateValue);
  tblInput.addEventListener('input', updateValue);

  row.appendChild(libCol);
  row.appendChild(tblCol);
  group.appendChild(row);
  return group;
}

// ---------------------------------------------------------------------------
// Complex controls
// ---------------------------------------------------------------------------

function buildNewcolumn(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  group.appendChild(createLabel(control, `prompt-${control.id}`));

  const currentVal = state.values[control.id] as Record<string, unknown> ?? {};

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'border rounded p-2';

  const t = state.i18n;
  const fields = [
    { key: 'value', label: t.columnName ?? 'Column Name', type: 'text' },
    { key: 'label', label: t.columnLabel ?? 'Label', type: 'text' },
    { key: 'type', label: t.columnType ?? 'Type', type: 'select', options: ['c', 'n'] },
    { key: 'length', label: t.columnLength ?? 'Length', type: 'number' },
    { key: 'format', label: t.columnFormat ?? 'Format', type: 'text' },
    { key: 'informat', label: t.columnInformat ?? 'Informat', type: 'text' },
  ];

  function updateValue() {
    state.values[control.id] = { ...currentVal };
    notifyListeners(state, control.id, state.values[control.id]);
  }

  for (const field of fields) {
    if (control.hideproperties && field.key !== 'value') continue;

    const row = document.createElement('div');
    row.className = 'mb-2';

    const label = document.createElement('label');
    label.className = 'form-label form-label-sm';
    label.textContent = field.label;
    row.appendChild(label);

    if (field.type === 'select') {
      const select = document.createElement('select');
      select.className = 'form-select form-select-sm';
      for (const optVal of field.options!) {
        const opt = document.createElement('option');
        opt.value = optVal;
        opt.textContent = optVal === 'c' ? (state.i18n.characterType ?? 'Character') : (state.i18n.numericType ?? 'Numeric');
        select.appendChild(opt);
      }
      select.value = (currentVal[field.key] as string) ?? 'c';
      select.addEventListener('change', () => {
        currentVal[field.key] = select.value;
        updateValue();
      });
      row.appendChild(select);
    } else {
      const input = document.createElement('input');
      input.type = field.type;
      input.className = 'form-control form-control-sm';
      input.value = currentVal[field.key] != null ? String(currentVal[field.key]) : '';
      if (control.readonly) input.readOnly = true;
      input.addEventListener('input', () => {
        currentVal[field.key] = field.type === 'number' ? (input.value ? Number(input.value) : null) : input.value;
        updateValue();
      });
      row.appendChild(input);
    }

    fieldset.appendChild(row);
  }

  group.appendChild(fieldset);
  return group;
}

function buildOptiontable(control: PromptControl, state: PromptState): HTMLElement {
  const group = createFormGroup(control);
  group.appendChild(createLabel(control, `prompt-${control.id}`));

  const columns = control.columns ?? [];
  const rows: Array<Record<string, unknown>> = (state.values[control.id] as Array<Record<string, unknown>>) ?? [];

  // Initialize with initialrowcount empty rows if no existing data
  if (rows.length === 0 && control.initialrowcount) {
    for (let i = 0; i < control.initialrowcount; i++) {
      const row: Record<string, unknown> = {};
      for (const col of columns) {
        row[col.id] = col.value ?? null;
      }
      rows.push(row);
    }
    state.values[control.id] = rows;
  }

  const tableEl = document.createElement('table');
  tableEl.className = 'table table-sm table-bordered';

  // Header
  if (control.showcolumnlabels !== false) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const col of columns) {
      const th = document.createElement('th');
      th.textContent = col.label ?? col.id;
      headerRow.appendChild(th);
    }
    // Action column
    const thAction = document.createElement('th');
    thAction.style.width = '40px';
    headerRow.appendChild(thAction);
    thead.appendChild(headerRow);
    tableEl.appendChild(thead);
  }

  const tbody = document.createElement('tbody');

  function renderRow(rowData: Record<string, unknown>, rowIndex: number) {
    const tr = document.createElement('tr');
    for (const col of columns) {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.className = 'form-control form-control-sm';
      input.type = col.type === 'numberfield' ? 'number' : 'text';
      input.value = rowData[col.id] != null ? String(rowData[col.id]) : '';
      if (col.placeholder) input.placeholder = col.placeholder;

      input.addEventListener('input', () => {
        rowData[col.id] = col.type === 'numberfield' ? (input.value ? Number(input.value) : null) : input.value;
        state.values[control.id] = rows;
        notifyListeners(state, control.id, rows);
      });

      td.appendChild(input);
      tr.appendChild(td);
    }

    // Remove button
    const tdAction = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-sm btn-outline-danger';
    removeBtn.textContent = '\u00D7';
    removeBtn.addEventListener('click', () => {
      rows.splice(rowIndex, 1);
      state.values[control.id] = rows;
      rebuildBody();
    });
    tdAction.appendChild(removeBtn);
    tr.appendChild(tdAction);

    return tr;
  }

  function rebuildBody() {
    tbody.innerHTML = '';
    for (let i = 0; i < rows.length; i++) {
      tbody.appendChild(renderRow(rows[i], i));
    }
  }

  rebuildBody();
  tableEl.appendChild(tbody);
  group.appendChild(tableEl);

  // Add row button (if tabletype allows)
  if (control.tabletype !== 'authorboth') {
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-sm btn-outline-primary';
    addBtn.textContent = state.i18n.addRowButton ?? '+ Add Row';
    addBtn.addEventListener('click', () => {
      const newRow: Record<string, unknown> = {};
      for (const col of columns) {
        newRow[col.id] = col.value ?? null;
      }
      rows.push(newRow);
      state.values[control.id] = rows;
      rebuildBody();
    });

    if (control.max != null && Number(control.max) > 0) {
      addBtn.addEventListener('click', () => {
        if (rows.length >= Number(control.max)) {
          addBtn.disabled = true;
        }
      });
    }

    group.appendChild(addBtn);
  }

  return group;
}

// ---------------------------------------------------------------------------
// Export the control builders registry
// ---------------------------------------------------------------------------

export const controlBuilders: Record<string, ControlBuilder> = {
  text: buildText,
  link: buildLink,
  textfield: buildTextfield,
  textarea: buildTextarea,
  numberfield: buildNumberfield,
  numstepper: buildNumstepper,
  checkbox: buildCheckbox,
  colorpicker: buildColorpicker,
  path: buildPath,
  datetime: buildDatetime,
  dropdown: buildDropdown,
  radiogroup: buildRadiogroup,
  list: buildList,
  inputtable: buildInputtable,
  columnselector: buildColumnselector,
  libraryselector: buildLibraryselector,
  outputtable: buildOutputtable,
  newcolumn: buildNewcolumn,
  optiontable: buildOptiontable,
};
