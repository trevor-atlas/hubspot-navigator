import packageJson from './package.json';

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  // options_page: "src/pages/options/index.html",
  background: { service_worker: 'src/background.js' },
  action: {
    default_icon: 'icon.png',
  },
  permissions: ['storage', 'activeTab', 'scripting', 'tabs'],
  host_permissions: [
    'https://app.hubspot.com/*',
    'https://app.hubspotqa.com/*',
    'https://local.hubspotqa.com/*',
  ],
  web_accessible_resources: [
    {
      resources: ['src/*.js', 'src/*.css', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*/*'],
    },
  ],
};

export default manifest;
