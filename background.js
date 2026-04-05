// Toggle marker via keyboard shortcut (commands API)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== "toggle-marker") return;

  try {
    const targetTab = tab?.id ? tab : (await getActiveTab());
    if (targetTab?.id) {
      await sendToggle(targetTab.id);
    }
  } catch (_) { /* ignore errors on restricted pages */ }
});

// Toggle marker via toolbar icon click (fallback)
chrome.action.onClicked.addListener(async (tab) => {
  try {
    if (tab?.id) {
      await sendToggle(tab.id);
    }
  } catch (_) { /* ignore */ }
});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

async function sendToggle(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: "toggle-marker" });
  } catch (_) {
    // Content script not ready — inject it, then retry
    try {
      await chrome.scripting.insertCSS({ target: { tabId }, files: ["style.css"] });
      await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
      await chrome.tabs.sendMessage(tabId, { action: "toggle-marker" });
    } catch (_) { /* restricted page (chrome://, edge://), nothing we can do */ }
  }
}
