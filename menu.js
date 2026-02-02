document.addEventListener("DOMContentLoaded", () => {
    //CONSTANT
    const TOPPING_PRICE = 0.50;
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

    let cartData = JSON.parsel(localStorage.getItem("perScholasTeaCart")) || [];

    let cartTotal = 0;
    let currentSelection = null;
    let currentBasePrice = 0;
    let currentSizePrice = 0;
    let currentSizeName = "Small" 
    let currentSweetness = "0%";
    let currentToppings = [];

    const selectButtons = document.querySelectorAll(".teaDes .selectDrinkBtn");
    const sizeRows = document.querySelectorAll(".size-row");
    const sweetnessCards = document.querySelectorAll(".sweetness-card");
    const toppingItems = document.querySelectorAll(".topping-item")

    // HELPER: Renders Cart & save to storage
    function renderCart() {
        // 1. Save to browser storage
        localStorage.setItem("perScholasTeaCart", JSON.stringify(cartData));

        // 2. Clear current HTML list
        cartList.innerHTML = "";
        let runningTotal = 0;

        // 3. Rebuild list from data
        cartData.forEach((item, index) => {
            const li = document.createElement("li");
            const toppingsString = item.toppings.length > 0
                ? ` + ${item.toppings.join(", ")}`
                : "";
            
            li.textContent = `${index + 1}. ${item.name}, ${item.size}, ${item.sweetness}, ${toppingsString}) - $${item.price.toFixed(2)}`;
            li.classList.add("cart-item");
            cartList.appendChild(li);
            
            runningTotal += item.price;
        });

        // 4. Update total text
        cartTotalEl.textContent = `Total: $${runningTotal.toFixed(2)}`;

        // 5. Toggle Empty Message
        if (cartData.length === 0) {
            if (cartEmptyMsg) cartEmptyMsg.style.display = "block";   
        } else {
            if (cartEmptyMsg) cartEmptyMsg.style.display = "none";
        }
    }

    renderCart();

    
    // HELPER: Recalulate total price
    function recalculateTotal() {
        if (!currentSelection) return;

        const toppingsCost = currentToppings.length * TOPPING_PRICE;
        currentSelection.price = currentBasePrice + currentSizePrice + toppingsCost;
    }

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
            currentSweetness = "0%";
            currentToppings = [];

            // RESET BUTTON FOR NEW SELECTION
            addToCartBtn.textContent = "Add to Cart";

            // RESET VISUALS
            sizeRows.forEach(row => row.classList.remove("active"));
            sweetnessCards.forEach(card => card.classList.remove("active"));
            toppingItems.forEach(item => item.classList.remove("active"));

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

        // TOPPING LISTENER
        toppingItems.forEach (item => {
            item.addEventListener("click", () => {
                if (!currentSelection) {
                    alert("Please select a drink first!");
                    return;
                }

                // Toggle active class - Visual update
                item.classList.toggle("active");

                // Get topping name from <h4> tag
                const toppingName = item.querySelector("h4").textContent;

                // Logic - if active add to array : remove
                if (item.classList.contains("active")) {
                    currentToppings.push(toppingName);
                } else {
                    currentToppings = currentToppings.filter(t => t !== toppingName);
                }

                recalculateTotal();

                updateDisplay();
            });
        });

        // HELPER FUNCTION to update summary section
        function updateDisplay() {
            if(currentSelection) {
                // create string "($0.75") or empty if free
                const costTotal = currentSizePrice > 0
                    ? `(+$${currentSizePrice.toFixed(2)})`
                    : "";

                const toppingsText = currentToppings.length > 0
                    ? currentToppings.map(t => `${t} (+$${TOPPING_PRICE.toFixed(2)})`).join(", ")
                    : "None";

                selectedDetails.innerHTML = `
                    <p><strong>Drink:</strong> ${currentSelection.name}</p>
                    <p><strong>Size:</strong> ${currentSizeName} ${costTotal}<p>
                    <p><strong>Sweetness:</strong> ${currentSweetness}</p>
                    <p><strong>Toppings:</strong> ${toppingsText}</p>
                    <p><strong>Total:</strong> $${currentSelection.price.toFixed(2)}</p>
                `;
            }
        }

    // ADD TO CART LISTENER
     addToCartBtn.addEventListener("click", () => {

        // MODE 1: "Add another drink!"
        if (!currentSelection) {
            const drinkSection = document.getElementById("drinkFilters");
            if (drinkSection) {
                drinkSection.scrollIntoView({ behavior: "smooth" });
            }
            return; 
        }

        // MODE 2: Create Cart Item
        
        // 1. Create cart item
        const li = document.createElement("li");
        const toppingsString = currentToppings.length > 0
            ? ` + ${currentToppings.join(", ")}`
            : "";

        const itemNumber = cartList.children.length + 1;

        li.textContent = `${itemNumber}. ${currentSelection.name} (${currentSizeName}), ${currentSweetness}, ${toppingsString} - $${currentSelection.price.toFixed(2)}`;
        li.classList.add("cart-item");
        cartList.appendChild(li);

        // 2. Update cart total
        if (cartEmptyMsg) {
            cartEmptyMsg.style.display = "none";

            cartTotal += currentSelection.price;
            cartTotalEl.textContent = `Total: $${cartTotal.toFixed(2)}`;


        // 3. Scroll back up to Drink Filter
        addToCartBtn.textContent = "Add another drink!";
        addToCartBtn.disabled = false;


        // 4. Reset all selected variables
        currentSelection = null;
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small";
        currentSweetness = "0%"
        currentToppings = [];

        // 5. Reset all visual
        document.querySelectorAll(".teaDes").forEach(card => card.classList.remove("active"));
        sizeRows.forEach(row => row.classList.remove("active"));
        sweetnessCards.forEach(card => card.classList.remove("active"));
        toppingItems.forEach(item => item.classList.remove("active"));

        // 6. Reset Summary Display
        selectedDetails.innerHTML = "<p>Select another drink!</p>";
        };

        cartTotal += currentSelection.price;
        cartTotalEl.textContent = `Total: $${cartTotal.toFixed(2)}`;

        const msg = document.createElement("p");
        msg.textContent = "Drink added to cart!";
        msg.style.color = "#8FB38F";
        selectedDetails.appendChild(msg);

        addToCartBtn.disabled = true;
     })

     // CLEAR SELECTION LISTENER
     const clearBtn = document.getElementById("clearSelectionBtn");

     clearBtn.addEventListener("click", () => {
        // 1. RESET DATA
        currentSelection = null;
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small";
        currentSweetness = "0%";
        currentToppings = [];

        // 2. RESET VISUAL
        document.querySelectorAll("teaDes").forEach(card => card.classList.remove("active"));
        sizeRows.forEach(row => row.classList.remove("active"));
        sweetnessCards.forEach(card => card.classList.remove("active"));
        toppingItems.forEach(item => item.classList.remove("active"));

        // 3. RESET TEXT AND BUTTONS
        selectedDetails.innerHTML = "<p>No drink selected yet.</p>";
        addToCartBtn.textContent = "Add to Cart";
        addToCartBtn.disable = true;

        // 4. Scroll back to top
        const drinkSelection = document.getElementById("drinkFilters");
        if (drinkSelection) {
            drinkSelection.scrollIntoView({ behavior: "smooth" });
        }
     })

     // CLEAR CART LISTENER
     const clearCartBtn = document.getElementById("clearCartBtn");

     clearCartBtn.addEventListener("click", () => {
        // 1. Clear the list (HTML)
        cartList.innerHTML = "";
        
        // 2. Reset the total variable
        cartTotal = 0;
        cartTotalEl.textContent = "Total: $0.00";

        // 3. Show emmpty messsage again
        if (cartEmptyMsg) {
            cartEmptyMsg.style.display = "block";
        }

        alert("Cart has been cleared!");
     })


})