// DOMContentLoaded: Setup Buttons
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM fully loaded!");

    // Get DOM elements
    let npcButton = document.getElementById("generateNpc");
    let itemButton = document.getElementById("generateItem");
    let shopButton = document.getElementById("generateShop");

    // Check for existence
    if (!npcButton || !itemButton || !shopButton) {
        console.error("❌ Buttons not found! HTML may not be fully loaded.");
        return;
    }

    // Attach click listeners
    npcButton.addEventListener("click", generateNPC);
    itemButton.addEventListener("click", generateItem);
    shopButton.addEventListener("click", generateShop);

    console.log("✅ Buttons initialized!");
    
});

// 🟢 Fetch JSON data
async function fetchData(file) {
    console.log(`Fetching ${file}...`);
    
    try {
        const response = await fetch(`data/${file}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        console.log(`✅ Successfully fetched ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`❌ Error fetching ${file}:`, error);
        alert(`Failed to load ${file}. Make sure the file exists.`);
        return null;
    }
}

// 🟢 Generate NPC and Display It
async function generateNPC() {
    console.log("Fetching NPC data...");
    
    const npcData = await fetchData("npcs.json");

    if (!npcData || !Array.isArray(npcData) || npcData.length === 0) {
        console.error("❌ NPC data is empty or invalid:", npcData);
        return;
    }

    // Pick a random NPC from all
    const npc = npcData[Math.floor(Math.random() * npcData.length)];
    console.log("✅ Generated NPC:", npc);

    displayNPC(npc);
}

// 🟢 Display NPC in HTML
function displayNPC(npc) {
    const npcDisplay = document.getElementById("npcDisplay");
    if (!npcDisplay) {
        return console.error("❌ NPC display container not found!");
    }

    npcDisplay.innerHTML = `
        <div class="npc-card">
            <h2>${npc.name}</h2>
            <p><strong>Race:</strong> ${npc.race}</p>
            <p><strong>Occupation:</strong> ${npc.occupation}</p>
            <p><strong>Ideal:</strong> ${npc.traits.ideal}</p>
            <p><strong>Flaw:</strong> ${npc.traits.flaw}</p>
            <p><strong>Bond:</strong> ${npc.traits.bond}</p>
            <p><strong>Description:</strong> ${npc.description}</p>
        </div>
    `;
}

// 🟢 Generate Item (No Gacha Logic)
async function generateItem() {
    console.log("Fetching Item data...");
    
    const itemData = await fetchData("items.json");
    if (!itemData || !Array.isArray(itemData) || itemData.length === 0) {
        console.error("❌ Item data is empty or invalid:", itemData);
        return;
    }

    const item = itemData[Math.floor(Math.random() * itemData.length)];
    console.log("🎁 Generated Item:", item);

    displayItem(item);
}

// 🟢 Display Item in HTML
function displayItem(item) {
    const itemDisplay = document.getElementById("itemDisplay");
    if (!itemDisplay) return console.error("❌ Item display container not found!");

    // Ensure category & sub-category
    let itemType = item.category ? `${item.category} (${item.sub_category || "General"})` : "Unknown";

    // Ensure tags
    let itemTags = item.tags && item.tags.length > 0 ? item.tags.join(", ") : "None";

    // Ensure stats
    let itemStats = item.stats
        ? `<p><strong>Cost:</strong> ${item.stats.cost} ${item.stats.currency || "gc"}</p>
           <p><strong>Weight:</strong> ${item.stats.weight || "Unknown"} lbs</p>`
        : "<p><strong>Stats:</strong> Not Available</p>";

    // Item effect
    let itemEffect = item.stats && item.stats.effect
        ? `<p class="effect"><strong>Effect:</strong> ${item.stats.effect}</p>`
        : "";

    // Fallback image
    let imagePath = item.image && item.image.trim() !== "" ? item.image : "images/default-item.png";

    // Rarity class
    let rarityClass = item.rarity.toLowerCase().replace(/\s+/g, "-");

    // Build HTML
    itemDisplay.innerHTML = `
        <div class="item-card ${rarityClass}">
            <div class="item-image-container">
                <img src="${imagePath}" alt="${item.name}">
            </div>
            <h2 class="${rarityClass}">${item.name}</h2>
            <p><strong>Type:</strong> ${itemType}</p>
            <p><strong>Rarity:</strong> <span class="${rarityClass}">${item.rarity}</span></p>
            <p><strong>Tags:</strong> ${itemTags}</p>
            ${itemStats}
            <p><strong>Description:</strong> ${item.description}</p>
            ${itemEffect}
        </div>
    `;
}

// 🟢 Generate Shop and Display It
async function generateShop() {
    console.log("Fetching Shop data...");

    const npcData = await fetchData("npcs.json");
    const itemData = await fetchData("items.json");

    if (!npcData || !itemData || !Array.isArray(npcData) || !Array.isArray(itemData)) {
        console.error("❌ Shop data is empty or invalid!");
        return;
    }

    const shopkeeper = npcData[Math.floor(Math.random() * npcData.length)];
    // Shop items: just pick 5 random items from itemData
    const shopItems = Array.from({ length: 5 }, () => itemData[Math.floor(Math.random() * itemData.length)]);

    console.log("✅ Generated Shop:", { shopkeeper, shopItems });

    displayShop(shopkeeper, shopItems);
}

// 🟢 Display Shop in HTML
function displayShop(shopkeeper, shopItems) {
    const shopDisplay = document.getElementById("shopDisplay");
    if (!shopDisplay) return console.error("❌ Shop display container not found!");

    shopDisplay.innerHTML = `
        <div class="shop-card">
            <h2>${shopkeeper.name}'s Store</h2>
            <p><strong>Shopkeeper:</strong> ${shopkeeper.name} (${shopkeeper.occupation})</p>
            <p><strong>Inventory:</strong></p>
            <ul>
                ${shopItems.map(item => `<li>${item.name} - ${item.type} (${item.rarity})</li>`).join("")}
            </ul>
        </div>
    `;
}

// 🛠 Register Service Worker with Explicit Scope
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
        .then(registration => {
            console.log("✅ Service Worker Registered with Scope:", registration.scope);

            // Ensure updates apply immediately
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                        console.log("🚀 New version available. Reloading...");
                        window.location.reload(); 
                    }
                });
            });
        })
        .catch(error => console.error("❌ Service Worker Registration Failed:", error));
}
// --- PWA Install Prompt Code ---
let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('✅ beforeinstallprompt event fired!');
    
    if (installButton) {
        installButton.style.display = 'block';
    }
});

if (installButton) {
    installButton.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
                installButton.style.display = 'none';
            });
        }
    });
}

// --- End PWA Install Prompt Code ---
