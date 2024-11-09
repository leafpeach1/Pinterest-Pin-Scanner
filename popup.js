document.getElementById("scanButton").addEventListener("click", function() {
    document.getElementById("output").textContent = "Loading data...";

    fetch("samplePins.json")
        .then(response => response.json())
        .then(data => {
            let currentRecipeIndex = 0;

            function displayRecipe(index) {
                const recipe = data[index];
                let outputText = `<div class="recipe"><h3>${recipe.title}</h3><ul>`;
                recipe.ingredients.forEach(item => {
                    outputText += `<li>${item.ingredient}</li>`;
                });
                outputText += "</ul></div>";
                document.getElementById("output").innerHTML = outputText;
            }

            // Display the first recipe initially
            displayRecipe(currentRecipeIndex);

            document.getElementById("nextRecipe").addEventListener("click", () => {
                if (currentRecipeIndex < data.length - 1) {
                    currentRecipeIndex++;
                    displayRecipe(currentRecipeIndex);
                }
            });

            document.getElementById("prevRecipe").addEventListener("click", () => {
                if (currentRecipeIndex > 0) {
                    currentRecipeIndex--;
                    displayRecipe(currentRecipeIndex);
                }
            });
        })
        .catch(error => console.error("Error:", error));
});

let fullShoppingList = [];
let displayedShoppingList = [];

document.getElementById("generateList").addEventListener("click", generateShoppingList);
// Function to update local storage whenever the list changes
// Function to update local storage with the current list of items
document.addEventListener("DOMContentLoaded", function() {
    chrome.storage.sync.get("shoppingList", (data) => {
        fullShoppingList = data.shoppingList || [];
        displayedShoppingList = [...fullShoppingList]; // Copy to displayed list
        renderShoppingList(displayedShoppingList);
    });

    document.getElementById("addIngredientBtn").addEventListener("click", () => {
        const input = document.getElementById("addIngredientInput");
        const newIngredient = input.value.trim();
    
        if (newIngredient) {
            addItemtoList(newIngredient);
            input.value = ""; // Clear input
        }
    });
    

    document.getElementById("filterButton").addEventListener("click", () => {
        const keyword = document.getElementById("filterInput").value.trim().toLowerCase();
        applyFilter(keyword);
    });

    document.getElementById("resetButton").addEventListener("click", () => {
        showFullList();
    });
});



    // "Generate Shopping List" button
    document.getElementById("generateList").addEventListener("click", generateShoppingList);

    // "Scan My Pin" button functionality
    document.getElementById("scanButton").addEventListener("click", function() {
        document.getElementById("output").textContent = "Loading data...";

        fetch("samplePins.json")
            .then(response => response.json())
            .then(data => {
                let currentRecipeIndex = 0;

                function displayRecipe(index) {
                    const recipe = data[index];
                    let outputText = `<div class="recipe"><h3>${recipe.title}</h3><ul>`;
                    recipe.ingredients.forEach(item => {
                        outputText += `<li>${item.ingredient}</li>`;
                    });
                    outputText += "</ul></div>";
                    document.getElementById("output").innerHTML = outputText;
                }

                // Display the first recipe initially
                displayRecipe(currentRecipeIndex);

                document.getElementById("nextRecipe").addEventListener("click", () => {
                    if (currentRecipeIndex < data.length - 1) {
                        currentRecipeIndex++;
                        displayRecipe(currentRecipeIndex);
                    }
                });

                document.getElementById("prevRecipe").addEventListener("click", () => {
                    if (currentRecipeIndex > 0) {
                        currentRecipeIndex--;
                        displayRecipe(currentRecipeIndex);
                    }
                });
            })
            .catch(error => console.error("Error:", error));
    });


// Function to generate the shopping list
function generateShoppingList() {
    fetch("samplePins.json")
        .then(response => response.json())
        .then(data => {
            const shoppingSet = new Set();
            data.forEach(recipe => {
                recipe.ingredients.forEach(item => {
                    const ingredientText = `${item.quantity} ${item.unit} of ${item.ingredient}`;
                    shoppingSet.add(ingredientText);
                });
            });

            const shoppingList = Array.from(shoppingSet);
            fullShoppingList = shoppingList;
            displayedShoppingList = [...fullShoppingList];
            renderShoppingList(displayedShoppingList, true); // Sync after generating
        })
        .catch(error => console.error("Error:", error));
}


// Function to show the full shopping list again
function showFullList() {
    document.getElementById("filterInput").value = "";
    displayedShoppingList = [...fullShoppingList]; // Reset displayed list to the full list
    renderShoppingList(displayedShoppingList, false);
}



// Function to apply the filter
function applyFilter(keyword) {
    // Filter from the original fullShoppingList and store the results in displayedShoppingList
    displayedShoppingList = fullShoppingList.filter(item => 
        item.toLowerCase().includes(keyword)
    );
    renderShoppingList(displayedShoppingList, false);
}




// Function to render the shopping list
function renderShoppingList(items, shouldSync = false) {
    const shoppingListElement = document.getElementById("shoppingList");
    shoppingListElement.innerHTML = ""; // Clear the list

    items.forEach(item => addListItem(item)); // Add each item
    if (shouldSync) {
        syncShoppingList();
    }
}


function addItemtoList(item) {
     // Add the item to the full list and sync it
     fullShoppingList.push(item);
     displayedShoppingList = [...fullShoppingList]; // Update the displayed list
     renderShoppingList(displayedShoppingList, false); // Render without syncing again
     syncShoppingList(); // Sync after adding a new item
}

function removeItemFromList(item) {
    // Remove the item from fullShoppingList
    fullShoppingList = fullShoppingList.filter(i => i !== item);
    displayedShoppingList = [...fullShoppingList]; // Update the displayed list
    renderShoppingList(displayedShoppingList, false); // Render without syncing again
    syncShoppingList(); // Sync after removing an item
}



// Function to add an item to the shopping list
function addListItem(item) {
    const shoppingListElement = document.getElementById("shoppingList");

    const listItem = document.createElement("li");
    listItem.className = "shopping-item";
    listItem.innerHTML = `${item} <button class="remove-btn">Remove</button>`;
    shoppingListElement.appendChild(listItem);

    // Attach remove button functionality
    listItem.querySelector(".remove-btn").addEventListener("click", function() {
        removeItemFromList(item);
    });
}




// Function to sync the shopping list with chrome.storage.sync
function syncShoppingList() {
    const items = Array.from(document.querySelectorAll(".shopping-item")).map(item => 
        item.textContent.replace(" Remove", "")
    );
    fullShoppingList = items;

    chrome.storage.sync.set({ shoppingList: fullShoppingList }, () => {
        console.log("Shopping list synced!");
    });
}

// Function to download the shopping list as a text file
function downloadShoppingList() {
    // Convert the current shopping list to a text format
    const listText = fullShoppingList.join("\n");

    // Create a Blob from the text
    const blob = new Blob([listText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopping-list.txt"; // File name for the download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Attach event listener to the download button
document.getElementById("downloadList").addEventListener("click", downloadShoppingList);

