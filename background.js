chrome.storage.local.get('tabStack', function (data) {
    if (!data.tabStack) {
        chrome.storage.local.set({ 'tabStack': [] });
    }
});


chrome.storage.local.get('popStack', function (data) {
    if (!data.popStack) {
        chrome.storage.local.set({ 'popStack': [] });
    }
});

chrome.tabs.onActivated.addListener(async function(activeInfo) {
    const data = await getTabStack();
    const tabStack = data.tabStack;
    if (tabStack.length === 0 || !tabStack.map(tab => tab.tabId).includes(activeInfo.tabId)) {
        try {
            const tab = await chrome.tabs.get(activeInfo.tabId);
            saveToTabStack(tab);
        } catch (error) {
            console.error('Error getting tab information:', error);
        }
    }
});

async function getTabStack() {
    return new Promise((resolve) => {
        chrome.storage.local.get('tabStack', (data) => {
            resolve(data);
        });
    });
}


async function getPopStack() {
    return new Promise((resolve) => {
        chrome.storage.local.get('popStack', (data) => {
            resolve(data);
        });
    });
}

function saveToTabStack(tab) {
    const tabInfo = {
        tabId: tab.id,
        url: tab.url,
        title: tab.title
    };
    chrome.storage.local.get('tabStack', function (data) {
        const newTabStack = [...data.tabStack, tabInfo];
        chrome.storage.local.set({ 'tabStack': newTabStack });
    });
}

chrome.commands.onCommand.addListener(async function (command) {
    if (command === "open_previous_tab" || command === "go_previous_tab" || command === "prime_action") {
        const data = await getTabStack();
        const tabStack = data.tabStack;
        const popData = await getPopStack();
        const popStack = popData.popStack;
        if (tabStack.length >= 2) {
            const previousTabId = tabStack[tabStack.length - 2].tabId;
            popStack.push(tabStack.pop());
            chrome.storage.local.set({ 'tabStack': tabStack });
            chrome.storage.local.set({ 'popStack': popStack });
            chrome.tabs.update(previousTabId, { active: true });
        }
    } else if (command === "open_next_tab" || command === "go_next_tab") {
        const popData = await getPopStack();
        const popStack = popData.popStack;
        const data = await getTabStack();
        const tabStack = data.tabStack;
        if (popStack.length > 0) {
            const nextTabId = popStack[popStack.length - 1].tabId;
            tabStack.push(popStack.pop());
            chrome.storage.local.set({ 'tabStack': tabStack });
            chrome.storage.local.set({ 'popStack': popStack });
            chrome.tabs.update(nextTabId, { active: true });
        }
    }
});

chrome.action.onClicked.addListener(async () => {
    const data = await getTabStack();
    const tabStack = data.tabStack;
    const popData = await getPopStack();
    const popStack = popData.popStack;
    if (tabStack.length >= 2) {
        const previousTabId = tabStack[tabStack.length - 2].tabId;
        popStack.push(tabStack.pop());
        chrome.storage.local.set({ 'tabStack': tabStack });
        chrome.storage.local.set({ 'popStack': popStack });
        chrome.tabs.update(previousTabId, { active: true });
    }
});

