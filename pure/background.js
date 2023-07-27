chrome.storage.local.get(['tabStack', 'popStack'], function (data) {
    if (!data.tabStack) {
        chrome.storage.local.set({ 'tabStack': [] });
    }
    if (!data.popStack) {
        chrome.storage.local.set({ 'popStack': [] });
    }
});

chrome.tabs.onActivated.addListener(async function(activeInfo) {
    const data = await getTabStack();
    const tabStack = data.tabStack;
    if (tabStack.length === 0 || !tabStack.includes(activeInfo.tabId)) {
        try {
            saveToTabStack(activeInfo.tabId);
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

function saveToTabStack(tabId) {
    chrome.storage.local.get('tabStack', function (data) {
        const newTabStack = [...data.tabStack, tabId];
        chrome.storage.local.set({ 'tabStack': newTabStack });
    });
}

chrome.commands.onCommand.addListener(async function (command) {
    const data = await getTabStack();
    const tabStack = data.tabStack;
    const popData = await getPopStack();
    const popStack = popData.popStack;
    if (command == "open_previous_tab" || command == "go_previous_tab") {
        console.log('previous command')
        if (tabStack.length >= 2) {
            const previousTabId = tabStack[tabStack.length - 2]
            popStack.push(tabStack.pop());
            chrome.storage.local.set({ 'tabStack': tabStack, 'popStack': popStack });
            chrome.tabs.update(previousTabId, { active: true });
        }
    } else if (command == "open_next_tab" || command == "go_next_tab") {
        console.log('next command')
        if (popStack.length > 0) {
            const nextTabId = popStack[popStack.length - 1];
            tabStack.push(popStack.pop());
            chrome.storage.local.set({ 'tabStack': tabStack, 'popStack': popStack });
            chrome.tabs.update(nextTabId, { active: true });
        }
    }
});

chrome.action.onClicked.addListener(async () => {
    console.log('previous clicked')
    const data = await getTabStack();
    const tabStack = data.tabStack;
    const popData = await getPopStack();
    const popStack = popData.popStack;
    if (tabStack.length >= 2) {
        const previousTabId = tabStack[tabStack.length - 2];
        popStack.push(tabStack.pop());
        chrome.storage.local.set({ 'tabStack': tabStack, 'popStack': popStack });
        chrome.tabs.update(previousTabId, { active: true });
    }
});

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {

    const data = await getTabStack();
    const tabStack = data.tabStack;
    const popData = await getPopStack();
    const popStack = popData.popStack;

    if (tabStack.includes(tabId)) {
        tabStack.splice(tabStack.indexOf(tabId), 1);
        chrome.storage.local.set({ 'tabStack': tabStack });
    }

    if (popStack.includes(tabId)) {
        popStack.splice(popStack.indexOf(tabId), 1);
        chrome.storage.local.set({ 'popStack': popStack });
    }
});

chrome.runtime.onSuspend.addListener(async () => {
    chrome.storage.local.clear();
});