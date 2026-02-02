document.addEventListener("DOMContentLoaded", () => {
    // FILTER LOGIC
    const filterButtons = document.querySelectorAll("#drinkFilters .filterBtn");
    const drinkGroups = document.querySelectorAll("fieldset[data-type]");

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const filterValue = btn.dataset.filter;

            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            drinkGroups.forEach((group) => {
                const type = group.dataset.type;

                if (filterValue === "all" || filterValue === type) {
                    group.style.display = "";
                }   
                else {
                    group.style.display = "none";
                }
            });
        });
    });


// =============================================
    // CART & SELECTION LOGIC

    const selectedDetails = document.getElementById("selectedDrinkDetails");
    const addToCartBtn = document.getElementById("addToCartBtn");

    const cartList = document.getElementById("cartItems");
    const cartEmptyMsg = document.getElementById("cartEmptyMsg");
    const cartTotalEl = document.getElementById("cartTotal");

    let cartTotal = 0;
    let currentSelection = null;
    let currentBasePrice = 0;
    let currentSizePrice = 0;
    let currentSizeName = "Small" 
    let currentSweetness = "0%";

    const selectButtons = document.querySelectorAll(".teaDes .selectDrinkBtn");
    const sizeRows = document.querySelectorAll(".size-row");
    const sweetnessCards = document.querySelectorAll(".sweetness-card");

    // DRINK SELECTION LISTENER
    selectButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const drinkCard = btn.closest(".teaDes");

            const nameEl = drinkCard.querySelector(".teaType");
            const priceEl = drinkCard.querySelector(".price");

            const drinkName = nameEl 
                ? nameEl.childNodes[0].textContent.trim() 
                : "Unknown Drink";

                // Remove the '$' character before parsing
            const priceValue = priceEl 
                ? parseFloat(priceEl.textContent.replace('$', '').trim()) 
                : 0;

            // RESET LOGIC TO DEFAULT
            currentBasePrice = priceValue;
            currentSizePrice = 0;
            currentSizeName = "Small";
            currentSweetness ="0%";

            // RESET VISUALS
            sizeRows.forEach(row => row.classList.remove("active"));
            sweetnessCards.forEach(card => card.classList.remove("active"));

            // set initial selection object
            currentSelection = { name: drinkName, price: currentBasePrice };
            
            // helper function to uupdate text
            updateDisplay();

            addToCartBtn.disabled = false;

            // highlight drink card
            document
                .querySelectorAll(".teaDes")
                .forEach((card) => card.classList.remove("selectedDrink"));
            drinkCard.classList.add("selectedDrink");

            // SCROLL LOGIC - drink to size
            const sizeSection = document.getElementById("size-section");
            if (sizeSection) {
                sizeSection.scrollIntoView({ behavior: "smooth" });
            } else {
                console.error("ID 'size-section' not found in HTML");
            }
        });
    });

        // SIZE SELECTION LISTENER [OUTSIDE OF LOOP]

        sizeRows.forEach(row => {
            row.addEventListener("click", () => {
                // selectable only after drink is selected
                if (!currentSelection){
                    alert("Please select a drink first!");
                    return;
                }

                // visual update
                sizeRows.forEach(r => r.classList.remove("active"));
                row.classList.add("active");

                // 1. get price
                currentSizePrice = parseFloat(row.dataset.price);
                // 2. get size name in first row
                currentSizeName = row.children[0].textContent;
                // 3. update price
                currentSelection.price =currentBasePrice + currentSizePrice;

                updateDisplay();

                // SCROLL LOGIC: size to sweetness
                const sweetnessSection = document.getElementById("sweetness-section");
                if (sweetnessSection) {
                    sweetnessSection.scrollIntoView({ behavior: "smooth" });
                }
            });
        });

        // SWEETNESS SELECTIONG LISTENER
        sweetnessCards.forEach(card => {
            card.addEventListener("click", () => {
                if (!currentSelection) {
                    alert("Please select a drink first!");
                    return;
                }
                // Visual update
                sweetnessCards.forEach(c => c.classList.remove("active"));
                card.classList.add("active");

                // Update state
                currentSweetness = card.dataset.level;

                updateDisplay();

                // SCROLL LOGIC:  Sweetness to Topping
                const toppingsSection = document.getElementById("toppings-section");
                if (toppingsSection) toppingsSection.scrollIntoView({behavior: "smooth" });
            })
        });

        // HELPER FUNCTION to update summary section
        function updateDisplay() {
            if(currentSelection) {
                // create string "($0.75") or empty if free
                const costTotal = currentSizePrice > 0
                    ? `(+$${currentSizePrice.toFixed(2)})`
                    : "";

                selectedDetails.innerHTML = `
                    <p><strong>Drink:</strong> ${currentSelection.name}</p>
                    <p><strong>Size:</strong> ${currentSizeName} ${costTotal}<p>
                    <p><strong>Sweetness:</strong> ${currentSweetness}</p>
                    <p><strong>Total:</strong> $${currentSelection.price.toFixed(2)}</p>
                `;
            }
        }

    // ADD TO CART LISTENER
     addToCartBtn.addEventListener("click", () => {
        if (!currentSelection) return;

        const li = document.createElement("li");
        li.textContent = `${currentSelection.name} (${currentSizeName}), ${currentSweetness} - $${currentSelection.price.toFixed(2)}`;
        li.classList.add("cart-item");
        cartList.appendChild(li);

        if (cartEmptyMsg) {
            cartEmptyMsg.style.display = "none";
        }

        cartTotal += currentSelection.price;
        cartTotalEl.textContent = `Total: $${cartTotal.toFixed(2)}`;

        const msg = document.createElement("p");
        msg.textContent = "Drink added to cart!";
        msg.style.color = "#8FB38F";
        selectedDetails.appendChild(msg);

        addToCartBtn.disabled = true;
    });
});