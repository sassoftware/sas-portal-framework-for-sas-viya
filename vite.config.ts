/**
 * Copyright © 2024, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    proxy: {
      '/SASLogon': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/folders': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/files': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/microanalyticScore': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/compute': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/identities': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/modelRepository': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/modelManagement': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/catalog': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/reports': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/mlPipelineAutomation': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/scoreExecution': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/scoreDefinitions': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/SASJobExecution': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/dataTables': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/casManagement': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/cas': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/dataMining': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/SASContentEditor': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
      '/microanalyticService': {
        target: 'https://your-viya-host.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
