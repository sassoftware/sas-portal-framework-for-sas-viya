# SAS Portal Framework for SAS Viya

## Overview
The SAS Portal Framework for SAS® Viya® enables you to build your portal to share reports, texts, link list, jobs and more in a structured way.
This project builds on top of the SAS® Viya® SDKs and the SAS® Viya® APIs.

Find a video walking you through the setup and the general UI [here](https://youtu.be/ZifDM_n20p0).

This is what the example portal that is included in this repository looks like:

![Example Portal](https://raw.githubusercontent.com/sassoftware/sas-portal-framework-for-sas-viya/refs/heads/main/img/example-portal.png)

For a better documentation expierence check out the [SAS Portal Framework for SAS Viya documentation page](https://sassoftware.github.io/sas-portal-framework-for-sas-viya/).

## Installation

### Prerequisites
Ensure that you have followed the setup guides of the [SAS Visual Analytics SDK](https://developer.sas.com/sdk/va/docs/guides/viya-setup/) and the [SAS Content SDK](https://developer.sas.com/sdk/content/docs/getting-started/#sas-viya-setup) before proceeding.

If you want to use this SAS Portal as a hybrid solution with SAS 9.4 content, you must remove the option _Header set X-Frame-Options SAMEORIGIN_ from the SAS Webserver configuration.
See the [SAS documentation](https://go.documentation.sas.com/doc/en/bicdc/9.4/vaicg/p1gi7u7b71vwbxn1rt9tu0h61f5t.htm).

Changes to the SAS Portal are documented in the [CHANGELOG.md](./CHANGELOG.md).

You will need [Node.js](https://nodejs.org/) (v18 or later) installed for building the project.

### Getting Started

#### Building the Portal

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/sassoftware/sas-portal-framework-for-sas-viya.git
cd sas-portal-framework-for-sas-viya
npm install
```

2. Configure the portal by editing `src/config.ts`:
   - Set `viyaHost` to your SAS Viya host URL (only needed if the portal is not hosted under the same URL as the Viya host)
   - Set `portalFolderUri` to the UUID of your portal content folder
   - Set `portalName` to the name displayed in the portal navbar

3. Build the portal:

```bash
npm run build
```

This will type-check, bundle, and create a `sas-portal.zip` file ready for deployment.

#### Deploying the Portal

Unzip `sas-portal.zip` onto your web server. The zip contains all static files needed to run the portal, including the bundled application, CSS, and static assets.

The SAS SDKs (sas-auth-browser, content-components, va-report-components), Bootstrap, and zero-md are loaded via CDN at runtime from within the `index.html`.

#### Development

For local development with hot-reload:

```bash
npm run dev
```

Update the proxy targets in `vite.config.ts` to point to your SAS Viya host for API calls during development.

## Running

### Sample Content
If you want to use the sample content, then import the [Portal-Content-EM.json](./Portal-Content-EM.json) and [Content-EM.json](./Content-EM.json) using SAS Environment Manager or the viya-admin CLI. 
The examples include also static links to SAS Jobs.
This applies to `Use Case 1/interactiveContent-example.json` where you will need to replace the URL with your Viya host.
If you replace the file, you will need to update the `portal-page-layout.json` accordingly with the new file URI.
The `VA Test` page also requires an additional setup: run the `Load-HMEQ.sas` file in `Content/VA Reports`, which will load the hmeq table from sampsio to public.

### Configuration

Edit `src/config.ts` to configure the portal:

```typescript
export const config: AppConfig = {
  // SAS Viya host URL - change if your web server is not under the same URL as Viya
  viyaHost: window.location.origin,
  // UUID of the portal content folder in SAS Viya
  portalFolderUri: '68384628-8305-4285-9f16-0cdc57d13dc5',
  // Name displayed in the portal navbar
  portalName: 'SAS Portal',
};
```

If you imported the sample content you can skip changing the `portalFolderUri`. If you created your own portal folder, replace the value with the URI of your folder (go to the folder in SAS Environment Manager, select it and copy just the URI ID — everything after `/folders/folders/`).

### Multi-Language Support

The baseline interface comes with native multi language support. 
The displayed language is determined by the users browsers language. 
Then a file from the languages folder is loaded. The portal comes with English and German support, if you want to add an additional language just copy the `public/language/en.json` file, rename it to the desired lowercase [ISO-639-1 language code](https://en.wikipedia.org/wiki/ISO_639-1) and then translate the values of the attributes.

## Contributing
Maintainers are accepting patches and contributions to this project.
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details about submitting contributions to this project.

## License
Except for the the contents of the `/static` folder, this project is licensed under the [Apache 2.0 License](LICENSE).
Elements in the `/static` folder are owned by SAS and are not released under an open source license.
This project uses the Bootstrap library, which is under the MIT license. It also uses the Zero-MD library, which is under the ICS license.
SAS and all other SAS Institute Inc. product or service names are registered trademarks or trademarks of SAS Institute Inc. in the USA and other countries. 
® indicates USA registration.

## Additional Resources

* [SAS Visual Analytics SDK](https://developer.sas.com/sdk/va/docs/guides/viya-setup/)
* [SAS Content SDK](https://developer.sas.com/sdk/content/docs/getting-started/#sas-viya-setup)
* [SAS Auth Browser](https://github.com/sassoftware/sas-viya-sdk-js/tree/main/sdk/sas-auth-browser)
* [SAS Viya API documentation](https://developer.sas.com/rest-apis)
