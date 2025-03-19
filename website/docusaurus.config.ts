import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "sas-portal-framework-for-sas-viya Documentation",
  favicon: "static/sas.png",

  // Set the production url of your site here
  url: "https://sassoftware.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/sas-portal-framework-for-sas-viya/'
  baseUrl: "/sas-portal-framework-for-sas-viya/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "sassoftware", // Usually your GitHub org/user name.
  projectName: "sas-portal-framework-for-sas-viya", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: ["./src/css/custom.css"],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "SAS Portal Framework for SAS Viya Documentation",
      logo: {
        alt: "SAS",
        src: "static/sas.png",
      },
      items: [
        {
          href: "https://github.com/sassoftware/sas-portal-framework-for-sas-viya",
          className: "header-github-link",
          title: "GitHub repository",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Support",
          items: [
            {
              label: "GitHub Repository",
              href: "https://github.com/sassoftware/sas-portal-framework-for-sas-viya",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()}, SAS Institute Inc., Cary, NC, USA. All Rights Reserved. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      // uncomment below to add language support
      // additionalLanguages: ["bash", "json"],
    },
  } satisfies Preset.ThemeConfig,

  // uncomment below for mermaid support
  // markdown: {
  //   mermaid: true,
  // },

  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsRouteBasePath: "/",
        explicitSearchResultPath: true,
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
      },
    ],
    // uncomment below for mermaid support
    // "@docusaurus/theme-mermaid",
  ],
};

export default config;
