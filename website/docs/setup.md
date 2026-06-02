---
sidebar_position: 2
---

# Setup

In this setup we will walk-through the requirements to get the SAS Portal up and running for you.

The guide requires someone that can provide a web-server and someone with the assumable SAS Administrator role.

A walkthrough of the main steps of the setups are also detailed in this YouTube video: [SAS Portal Framework for SAS Viya - Open Source Project Overview](https://youtu.be/ZifDM_n20p0).

You can have multiple SAS Portals for one SAS Viya environment, in order to do that you will just have to build the portal with different configurations and deploy them into different folders on your webserver, each with their own base folder in SAS Content.

## Prerequisites

You will need [Node.js](https://nodejs.org/) (v18 or later) installed to build the project.

## Building the Portal

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

## Webserver

You will need a webserver where you deploy the built portal. You can use an Apache HTTP Web Server for this - see the example YAML to deploy it on kubernetes below.

Unzip the `sas-portal.zip` onto your web server. The zip contains all static files needed to run the portal, including the bundled application, CSS, and static assets.

If you run the webserver under the same top level URL as the SAS Viya host, you will not have to change `src/config.ts`. If you don't, please see information in the Sample Content & Configuration section.

Please note your webserver needs to have TLS configured, because SAS Viya will not accepts non-HTTPS request for authentication & authorization requests.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpd-webserver-deployment
  labels:
    app: httpd-webserver
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpd-webserver
  template:
    metadata:
      labels:
        app: httpd-webserver
    spec:
      containers:
        - name: httpd-webserver
          image: httpd:2.4.57
          ports:
            - containerPort: 80
          volumeMounts:
            - name: httpd-webserver-volume
              mountPath: /usr/local/apache2/htdocs/httpd-webserver
      volumes:
        - name: httpd-webserver-volume
          nfs:
            server: <NFS_IP>
            path: "<PATH_FOR_MOUNT>" 
---
apiVersion: v1
kind: Service
metadata:
  name: httpd-webserver-service
spec:
  type: ClusterIP
  selector:
    app: httpd-webserver
  ports:
  - protocol: TCP
    port: 443
    targetPort: 80
---
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: httpd-webserver-ingress
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - <YOUR_HOST_URL>
    secretName: webserver-tls-certs
  rules:
    - host: <YOUR_HOST_URL>
      http:
        paths: 
          - path: /httpd-webserver
            pathType: Prefix
            backend:
              service:
                name: httpd-webserver-service
                port:
                  number: 443
```

## Setup in SAS Environment Manager

As the next step you will have to follow the setup instructions detailed in the SAS Visual Analytics SDK and SAS Content SDK documentation:
- [SAS Visual Analytics SDK documentation](https://developer.sas.com/sdk/va/docs/guides/viya-setup/)
- [SAS Content SDK documentation](https://developer.sas.com/sdk/content/docs/getting-started/#sas-viya-setup)

## Sample Content and Configuration
If you want to use the sample content, then import the `Portal-Content-EM.json` and `Content-EM.json` using SAS Environment Manager or the viya-admin CLI. 
The examples include also static links to SAS Jobs.
This applies to `Use Case 1/interactiveContent-example.json` where you will need to replace the URL with your Viya host.
If you replace the file, you will need to update the `portal-page-layout.json` accordingly with the new file URI.
The `VA Test` page also requires an additional setup: run the `Load-HMEQ.sas` file in `Content/VA Reports`, which will load the hmeq table from sampsio to public.

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

After changing the configuration, rebuild the portal with `npm run build` and redeploy the resulting `sas-portal.zip`.

Now the SAS Portal is ready to be used - the two following topics are fully optional.

## [Optional] Integration with Content from SAS 9.4

If you want to use this SAS Portal as a hybrid solution with SAS 9.4 content, you must remove the option _Header set X-Frame-Options SAMEORIGIN_ from the SAS 9.4 Webserver configuration.
See the [SAS documentation](https://go.documentation.sas.com/doc/en/bicdc/9.4/vaicg/p1gi7u7b71vwbxn1rt9tu0h61f5t.htm).

The two types of content that are supported from SAS 9.4 are Stored Processes (STP) and Web Report Studio Reports (WRS Reports) in the View only mode. The integration is done using the Interactive-Content object.

## [Optional] Development Server

For local development with hot-reload:

```bash
npm run dev
```

Update the proxy targets in `vite.config.ts` to point to your SAS Viya host for API calls during development.

## CDN Dependencies

The SAS SDKs and some third-party libraries are loaded via CDN at runtime from within the built `index.html`. The bundled application code and CSS are included in the build output.

The following CDN resources are used:

```html
<!-- Bootstrap Style -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">

<!-- Import SAS SDKs and Third-Party Utilities -->
<script src="https://cdn.developer.sas.com/packages/sas-auth-browser/latest/dist/index.min.js"></script>
<script src="https://cdn.developer.sas.com/packages/content-components/latest/dist/umd/content-sdk-components.js"></script>
<script src="https://cdn.developer.sas.com/packages/va-report-components/latest/dist/umd/va-report-components.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
<script type="module" src="https://cdn.jsdelivr.net/gh/zerodevx/zero-md@2/dist/zero-md.min.js"></script>
```

If you need to self-host these dependencies (e.g., for air-gapped environments), download them and update the `<script>` and `<link>` tags in the built `index.html` to point to your local copies.