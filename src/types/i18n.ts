/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PortalBuilderText {
  editExistingPages: string;
  editSelectPage: string;
  editDefaultOrder: string;
  editDefaultOrderHeader: string;
  createDefaultOrder: string;
  createDefaultOrderHeader: string;
  createNewPage: string;
  close: string;
  save: string;
  create: string;
  enterPageName: string;
  enterPageShorthand: string;
  enterPageVisible: string;
  enterPageShowName: string;
  enterPageNumCols: string;
  enterPageContact: string;
  savePage: string;
  deletePage: string;
  pageAlreadyExistsAlert: string;
  pageCreatedMessage: string;
  invalidName: string;
  invalidShorthand: string;
  pageUpdatedMessage: string;
  addObjectButton: string;
  editObjectButton: string;
  editSelectObject: string;
  enterObjectName: string;
  enterObjectID: string;
  selectObjectWidthDropdownText: string;
  selectObjectWidth: string[];
  enterObjectHeight: string;
  objectBorderLabel: string;
  selectObjectTypeDropdownText: string;
  enterObjectTextContent: string;
  linkListTabBehavior: string[];
  linkListText: string;
  linkListAddLinkButton: string;
  linkListDisplayTextPlaceholder: string;
  linkListLinkPlaceholder: string;
  viyaCheckboxLabel: string;
  icHeightPlaceholder: string;
  icWidthPlaceholder: string;
  vaReportURIPlaceholder: string;
  vaReportPartPlaceholder: string;
  saveObjectButton: string;
  createObjectButton: string;
  deleteObjectButton: string;
  noFurtherConfigurationText: string;
  runCustomCodeComputeContextPlaceholder: string;
  runCustomCodeCodeExplainer: string;
  runCustomCodeCodePlaceholder: string;
  customCodeActionBehavior: string[];
  runCustomCodeActionExplainer: string;
  runCustomCodeActionElementPlaceholder: string;
  runCustomCodeUnloadCodePlaceholder: string;
  dateProductSchemaURIExplainer: string;
  dataProductSchemaURI: string;
  dataProductFolderURI: string;
  dataProductOwnerFolderURI: string;
  dataProductHeaderAttributesPlaceholder: string;
  copyContentExplainer: string;
  copyContentAddingButton: string;
  copyContentURIPlaceholder: string;
}

export interface MasScoreText {
  moduleSelect: string;
  stepSelect: string;
  moduleInfo: string;
  moduleInfoAttribute: string;
  moduleInfoValue: string;
  moduleCode: string;
  moduleCodeClipboard: string;
  stepInputs: string;
  stepOutputs: string;
  scoreButton: string;
  downloadButton: string;
}

export interface ScrScoreText {
  [key: string]: string;
}

export interface ClientAdministratorText {
  [key: string]: string;
}

export interface DataProductRegistryText {
  [key: string]: string;
}

export interface DataProductMarketplaceText {
  [key: string]: string;
}

export interface PromptBuilderText {
  [key: string]: string | string[];
}

export interface RagBuilderText {
  [key: string]: string | string[];
}

export interface SasContentVAReportText {
  [key: string]: string;
}

export interface SasContentJobText {
  [key: string]: string;
}

export interface JobDefinitionText {
  [key: string]: string;
}

export interface InterfaceText {
  logOutText: string;
  goToViyaText: string;
  contactMessage: string;
  undefinedObjectText: string;
  portalBuilder: PortalBuilderText;
  masScore: MasScoreText;
  scrScore: ScrScoreText;
  clientAdministrator: ClientAdministratorText;
  dataProductRegistry: DataProductRegistryText;
  dataProductMarketplace: DataProductMarketplaceText;
  promptBuilder: PromptBuilderText;
  ragBuilder: RagBuilderText;
  sasContentVAReport: SasContentVAReportText;
  sasContentJob: SasContentJobText;
  jobDefinition: JobDefinitionText;
  [key: string]: unknown;
}
