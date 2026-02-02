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