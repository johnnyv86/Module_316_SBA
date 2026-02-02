document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll("#drinkFilters .filterBtn");
    const drinkGroups = document.querySelectorAll("fieldset[data-type]");

    const filterContainer = document.getElementById("drinkFilters");

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
// ==========================================

    const selectedDetails = document.getElementById("selectedDrinkDetails");
    const addToCartBtn = document.getElementById("addToCartBtn");

    const cartList = document.getElementById("cartItems");
    const cartEmptyMsg = document.getElementById("cartEmptyMsg");
    const cartTotalEl = document.getElementById("cartTotal");

    let cartTotal = 0;
    let currentSelection = null;

    const selectButtons = document.querySelectorAll(".teaDes .selectDrinkBtn");


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

            // store base price & reset size price    
            currentBasePrice = priceValue;
            currentSizePrice = 0;

            //reset size visual selection
            document.querySelectorAll(".size-row").forEach(row => row.classList.remove("active"));

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

            // Scroll to next section when clicked
            const sizeSection = document.getElementById("size-section");
            if (sizeSection) {
                sizeSection.scrollIntoView({ behavior: "smooth" })
            }
        });

        // SIZE SELECTION LOGIC
        const sizeRows = document.querySelectorAll(".size-row");

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

                // update the math
                currentSizePrice = parseFloat(row.dataset.price);
                currentSelection.price =currentBasePrice + currentSizePrice;

                updateDisplay();
            });
        });

        // helper function to update summary section
        function updateDisplay() {
            if(currentSelection) {
                selectedDetails.innerHTML = `
                    <p><strong>Drink:</strong> ${currentSelection.name}</p>
                    <p><strong>Price:</strong> $${currentSelection.price.toFixed(2)}</p?
                `;
            }
        }
    });

     addToCartBtn.addEventListener("click", () => {
        if (!currentSelection) return;

        const li = document.createElement("li");
        li.textContent = `${currentSelection.name} - $${currentSelection.price.toFixed(2)}`;
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