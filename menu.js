document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll("#drink-filters .filter-btn");
    const drinkGroups = document.querySelectorAll("fieldset[data-type]");

    const filterContainer = document.getElementById("drink-filters");

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
});

document.addEventListener("DOMContentLoaded", () => {
    const cartList = document.getElementById("cart-items");
    const cartEmptyMsg = document.getElementById("cart-empty-msg");
    const cartTotalEl = document.getElementById("cart-total");
    
    let cartTotal = 0;

    const selectButton =document.querySelectorAll(".teaDes .select-dink-btn");

    selectButton.forEach((btn) => {
        btn.addEventListener("click", () => {
            const drinkCard = btn.closest(".teaDes");

            const nameEl = drinkCard.querySelector(".teaType");
            const priceEl = drinkCard.querySelector(".price");

            const drinkName = nameEl ? nameEl.childNodes[0].textContent.trim() : "Unknown Drink";
            const priceValue = priceEl ? parseFloat(priceEl.textContent.trim()) : 0;

            const li = document.createElement("li");
            li.textContent = `${drinkName} - $${priceValue.toFixed(2)}`;

            li.classList.add("cart-item");

            cartList.appendChild(li);

            if (cartEmptyMsg) {
                cartEmptyMsg.style.display = "none";
            }

            cartTotal += priceValue;
            cartTotalEl.textContent = `Total: $${cartTotal.toFixed(2)}`;

            document
                .querySelectorAll(".teaDes")
                .forEach((card) => card.classList.remove("selected-drink"));
            drinkCard.classList.add("selected-drink");
        });
    });
});