export async function getActiveTab() {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true, active: true });

        if (tabs.length === 0) {
            throw new Error("No active tab found.");
        }

        return tabs[0];
    } catch (error) {
        console.error("Error getting active tab:", error);
        return null; // Return null or handle the error as needed
    }
}
