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

    let cartData = JSON.parse(localStorage.getItem("perScholasTeaCart")) || [];

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
    
        localStorage.setItem("perScholasTeaCart", JSON.stringify(cartData));
        cartList.innerHTML = "";
        let runningTotal = 0;

        // 1. Create DocumentFragment
        const fragment = document.createDocumentFragment();

        cartData.forEach((item, index) => {
            const li = document.createElement("li");
            const toppingsString = item.toppings.length > 0
                ? ` + ${item.toppings.join(", ")}`
                : "";
            
            li.textContent = `${index + 1}. ${item.name}, ${item.size}, ${item.sweetness}, ${toppingsString} - $${item.price.toFixed(2)}`;
            li.classList.add("cart-item");
            

        // 2. Append to fragment instead of cartList
            fragment.appendChild(li);

            runningTotal += item.price;
        });

        // 3. Append to fragment to the DOM
        cartList.appendChild(fragment);

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

        // SWEETNESS SELECTION LISTENER
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

        // 1. Create data object for new item
        const newItem = {
            name: currentSelection.name,
            size: currentSizeName,
            sweetness: currentSweetness,
            toppings: [...currentToppings],
            price: currentSelection.price
        };

        // 2. Add to Master Data List
        cartData.push(newItem);

        // 3. Save & Update screen
        renderCart();
        

        // 4. Scroll back up to Drink Filter
        addToCartBtn.textContent = "Add another drink!";
        addToCartBtn.disabled = true;


        // 5. Reset all selected variables
        currentSelection = null;
        currentBasePrice = 0;
        currentSizePrice = 0;
        currentSizeName = "Small";
        currentSweetness = "0%"
        currentToppings = [];

        // 6. Reset all visual
        document.querySelectorAll(".teaDes").forEach(card => card.classList.remove("active"));
        sizeRows.forEach(row => row.classList.remove("active"));
        sweetnessCards.forEach(card => card.classList.remove("active"));
        toppingItems.forEach(item => item.classList.remove("active"));

        // 7. Reset Summary Display
        selectedDetails.innerHTML = `
            <p style="color: #8FB38F; font-weight: bold;">Drink added to cart!</p>
            <p>Select another drink below.</p> `;
        });


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
        document.querySelectorAll(".teaDes").forEach(card => card.classList.remove("active"));
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
        // 1. Empty Data Array
        cartData = [];

        // 2. Update UI & Storage
        renderCart();

        alert("Cart has been cleared!");
     });

     // FORM LISTENER
     const orderForm = document.getElementById("orderForm");
     const orderName = document.getElementById("orderName");
     const orderContact = document.getElementById("orderContact");
     const emailInput = document.getElementById("emailInput");

     if(orderForm) {
        orderForm.addEventListener("submit", (event) => {
            // 1. Get current values
            const nameValue = orderName.value.trim();
            const contactValue = orderContact.value.trim();
            const emailValue = emailInput.value;

            // 2. Clean up number
            const cleanPhone = contactValue.replace(/\D/g, '');

            // DOM Validation Logic
            if (nameValue.length < 3) {
                event.preventDefault();
                alert("Please enter a valid name.");
                orderName.style.border = "2px solid red";
                return;
            }

            if (cleanPhone.length < 10) {
                event.preventDefault()
                alert("Please enter a vaild 10-digit phone number.");
                orderContact.style.border = "2px solid red";
                return;
            }

            if (!emailValue.includes("@") || emailValue.length < 5) {
                alert("Please enter a vaild email address.")
                emailInput.style.border = "2px solid red";
                return;
            }

            alert(`Thank you, ${nameValue}! Your order has been placed.`);
    

            // RESET BORDERS
            nameInput.style.border = "1px solid #555";
            contactInput.style.border = "1px solid #555";
            emailInput.style.border = "1px solid #555";

            // CLEAR CART
            const clearCartBtn = document.getElementById("clearCartBtn");
            if(clearCartBtn) clearCartBtn.click();
            

            orderForm.reset();
            event.preventDefault();
        });
    }
});
