const getSettingsFromDOM = () => {
  const sections = $$<HTMLHeadingElement>('nav h5');
  console.log(
    `{${[...sections]
      .map((section) => ({
        section: section.innerText,
        entries:
          (section.nextElementSibling && [
            ...section.nextElementSibling.querySelectorAll('a'),
          ]) ||
          [],
      }))
      .flat()
      .map(
        (section) =>
          `'${section.section}': [${section.entries.map(
            (el) =>
              `{ href: '${el.getAttribute(
                'href'
              )}', text: '${el.innerText.replace('\n', '')}' }`
          )}]`
      )}}`
  );
};

const settings = {
  'Your Preferences': [
    { href: '/settings/21250524/user-preferences', text: 'General' },
    { href: '/notification-preferences/21250524', text: 'Notifications' },
    { href: '/user-preferences/21250524/security', text: 'Security' },
  ],
  'Account Setup': [
    { href: '/settings/21250524/account-defaults', text: 'Account Defaults' },
    { href: '/settings/21250524/users', text: 'Users & Teams' },
  ],
  Integrations: [
    {
      href: '/integrations-settings/21250524/installed',
      text: 'Connected Apps',
    },
    { href: '/private-apps/21250524', text: 'Private Apps' },
    {
      href: '/integrations-settings/21250524/marketable-contacts-settings',
      text: 'Marketing Contacts',
    },
    { href: '/integrations-settings/21250524/ecommerce', text: 'Ecommerce' },
    { href: '/api-key/21250524', text: 'API Key' },
    {
      href: '/settings/21250524/marketing/email-service-provider',
      text: 'Email Service Provider',
    },
    {
      href: '/marketplace-settings/21250524/downloads',
      text: 'Marketplace Downloads',
    },
  ],
  'Tracking & Analytics': [
    { href: '/settings/21250524/data-privacy', text: 'Privacy & Consent' },
    { href: '/sandboxes/21250524', text: 'Sandboxes' },
    { href: '/settings/21250524/business-units', text: 'Business Units' },
  ],
  'Data Management': [
    { href: '/property-settings/21250524', text: 'Properties' },
    {
      href: '/sales-products-settings/21250524/importexport',
      text: 'Import & Export',
    },
    { href: '/settings/21250524/audits', text: 'Audit LogsBETA' },
  ],
  Tools: [
    { href: '/settings/21250524/calling', text: 'Calling' },
    { href: '/settings/21250524/sales/payments', text: 'Payments' },
  ],
} as const;

function getNavStructure() {
  const links = $$<HTMLLinkElement | HTMLAnchorElement>(
    '#navbar li:not(.expandable) [role=menuitem], #accounts-and-billing a, .navAccountMenu-bottom a'
  );

  const otherLinks = [
    $<HTMLLinkElement>('#navSetting'),
    $<HTMLLinkElement>('#navNotifications'),
    $<HTMLLinkElement>('#userPreferences'),
    ,
  ];
  const navStructure: Record<string, { href: string; text: string }> = {};
  const combinedLinks = [...links, ...otherLinks].filter(
    Boolean
  ) as HTMLLinkElement[];
  for (const link of combinedLinks) {
    let href = link.getAttribute('href');
    let text = link.innerText?.trim().replace('\n', '');
    if (!href || !text) {
      continue;
    }

    if (href.includes('user-preferences')) {
      text = 'Profile & Preferences';
    }
    navStructure[href] = { href, text };
  }

  for (const setting in settings) {
    for (const { href, text } of settings[setting as keyof typeof settings]) {
      const entry = {
        section: setting,
        href: `${href}`,
        text: `${text}`,
      };
      if (href.split('')[0] === '/') {
        entry.href = `${window.location.origin}${href}`;
      }
      navStructure[href] = entry;
    }
  }
  return [...Object.values(navStructure)];
}

type AppMessage = {
  type: 'get_dom_content' | 'open' | 'did_open';
};

type AppMessageResponse = {
  type: 'got_dom_content';
  payload: { text: string | null; href: string | null }[];
};

// Function called when a new message is received
const messagesFromReactAppListener = async (
  msg: AppMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: AppMessageResponse) => void
) => {
  chrome.scripting.executeScript({
    target: { tabId: sender?.tab?.id as number },
    files: ['js/vendor.js', 'js/content_script.js', 'js/popup.js'],
  });
  // console.log("[content_script.js]. Message received", msg);
  // if (msg.type === "get_dom_content") {
  //   const response: AppMessageResponse = {
  //     type: "got_dom_content",
  //     payload: getNavStructure(),
  //   };
  //   sendResponse(response);
  // }
  // if (msg.type === "open") {
  //   const response: AppMessage = {
  //     type: "did_open",
  //   };
  //   const tab = await getCurrentTab();
  //   chrome.action.setPopup({ tabId: tab.id, popup: "popup.html" });
  //   sendResponse(response as any);
  // }
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);

chrome.webNavigation &&
  chrome.webNavigation.onCompleted.addListener(
    () => {
      console.log('This is my favorite website!');
    },
    { url: [{ urlMatches: '.*.hubspot.com.*' }] }
  );
