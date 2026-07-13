/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/** Top-level JSON prompt definition structure */
export interface PromptDefinition {
  syntaxversion?: string;
  showPageContentOnly?: boolean;
  pages: PromptPage[];
  values: Record<string, unknown>;
}

/** A page in the prompt definition (creates a tab) */
export interface PromptPage {
  id: string;
  type: 'page';
  label: string;
  children: PromptControl[];
}

/** A collapsible section within a page */
export interface PromptSection {
  id: string;
  type: 'section';
  label?: string;
  open?: boolean;
  visible?: string | boolean;
  children: PromptControl[];
}

/** Static item used in dropdown, list, radiogroup */
export interface PromptItem {
  label?: string;
  value: string | number;
}

/** Dynamic item reference (dropdown/list referencing a columnselector) */
export interface PromptDynamicItems {
  ref: string;
}

/** Column definition for optiontable */
export interface OptionTableColumn {
  id: string;
  type: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: unknown;
  integer?: boolean;
  max?: number | null;
  min?: number | null;
  excludemax?: boolean;
  excludemin?: boolean;
  items?: PromptItem[];
}

/** Union control type — uses optional fields rather than discriminated union for simplicity */
export interface PromptControl {
  id: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  visible?: string | boolean;
  indent?: number;
  // textfield
  regexp?: string;
  // numberfield / numstepper
  min?: number | string | null;
  max?: number | string | null;
  excludemin?: boolean;
  excludemax?: boolean;
  integer?: boolean;
  stepsize?: number;
  // datetime
  subtype?: string;
  // path
  pathtype?: string;
  // link
  url?: string;
  // text
  text?: string;
  // dropdown, list, radiogroup
  items?: PromptItem[] | PromptDynamicItems;
  // columnselector
  table?: string;
  include?: string | null;
  columntype?: string;
  order?: boolean;
  // newcolumn
  hideproperties?: boolean;
  readonly?: boolean;
  // optiontable
  tabletype?: string;
  initialrowcount?: number;
  showcolumnlabels?: boolean;
  columns?: OptionTableColumn[];
  repeatref?: string | null;
  // inputtable
  filter?: boolean;
  // section children
  children?: PromptControl[];
  open?: boolean;
}

/** Column info returned from compute data-access API */
export interface ColumnInfo {
  name: string;
  type?: string;
  length?: number;
  label?: string;
  index?: number;
}

/** Table info returned from compute data-access API */
export interface TableInfo {
  name: string;
}

/** Library info returned from compute data-access API */
export interface LibraryInfo {
  name: string;
}

/** Mutable state shared across all prompt controls */
export interface PromptState {
  values: Record<string, unknown>;
  sessionId: string | null;
  contextName: string;
  libraries: string[] | null;
  tableCache: Map<string, string[]>;
  columnCache: Map<string, ColumnInfo[]>;
  listeners: Map<string, Set<(value: unknown) => void>>;
  i18n: Record<string, string>;
  /** Control definitions indexed by ID — used for cross-control lookups */
  controlDefs: Map<string, PromptControl>;
}
