async function getCurrentTab() {
  const tab = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tab[0];
}

const keepAlive = () => {
  setTimeout(keepAlive, 1000);
};

try {
  keepAlive();

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (
      changeInfo.status == 'complete' &&
      tab.active &&
      tab.id &&
      (tab?.url?.includes('app.hubspot.com') ||
        tab?.url?.includes('app.hubspotqa.com') ||
        tab?.url?.includes('local.hubspotqa.com'))
    ) {
      const tab = await getCurrentTab();
      console.log('in hubspot');
      chrome.scripting.executeScript({
        target: { tabId: tab.id as number },
        files: ['src/popup.js'],
      });
      chrome.scripting.insertCSS({
        target: { tabId: tab.id as number },
        files: ['assets/styles.chunk.css'],
      });
    }
  });
} catch (e) {
  console.error('Service worker error', e);
}
