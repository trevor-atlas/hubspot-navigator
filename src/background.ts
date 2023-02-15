try {
  const keepAlive = () => {
    setTimeout(keepAlive, 1000);
  };
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

  let didInject = false;
  // chrome.commands &&
  //   chrome.commands.onCommand.addListener(async (command) => {
  //     if (didInject) {
  //       return;
  //     }
  //     switch (command) {
  //       case "open":
  //         console.log(`Command ${command}`);
  //         const tab = await getCurrentTab();
  //         chrome.scripting.executeScript({
  //           target: { tabId: tab.id as number },
  //           files: ["js/vendor.js", "js/content_script.js", "js/popup.js"],
  //         });
  //       // didInject = true;
  //       default:
  //         console.log(`Command ${command} not found`);
  //     }
  //   });

  chrome.action.onClicked.addListener((tab) => {
    console.log('background action', tab);
    if (
      tab.active &&
      tab.id &&
      (tab?.url?.includes('app.hubspot.com') ||
        tab?.url?.includes('app.hubspotqa.com') ||
        tab?.url?.includes('local.hubspotqa.com'))
    ) {
      chrome.action.setPopup({ tabId: tab.id, popup: 'default_popup.html' });
      // chrome.windows.create({}, () => console.log("window created"));
    }
  });
} catch (e) {
  console.error('SERVICE WORKER ERROR', e);
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
