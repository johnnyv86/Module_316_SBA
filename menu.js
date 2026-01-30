const menuSection = document.getElementById('section2');

const allDrinks = document.querySelectorAll('.teaDes');
const allFieldsets = document.querySelectorAll('fieldset');
const menuCol = document.querySelector('.menu-col');

const filterContainer = document.createElement('div');
filterContainer.id = 'filter--container';
filterContainer.style.cssText = `
    background-color: #2c2c2c;
    padding: 20px;
    margin-bottom: 20px;
    border: 2px solid #8FB38F;
    border-radius: 5px;
    text-align: center;`;

const filterTitle = document.createElement('h3');
filterTitle.textContent = 'Filter Drinks by Category';
filterTitle.style.cssText = `
    color:  #8FB38F; 
    margin-bottom: 15 px;
    font-size: 1.3em;`;

const buttonContainer = document.createElement('div');
buttonContainer.style.cssText = `
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;`;

const categories = [
    'ALL',
    'MILK TEAS',
    'FRUIT TEAS',
    'MATCHA',
    'CLASSIC TEAS',
    'YOGURTS',
    'COFFEE'];

categories.forEach(function(category) {
    const btn = document.createElement('button');
    btn.textContent = category;
    btn.classNmae = 'filter-btn';
    btn.style.cssText = `
        padding: 10px 20px;
        background-color: #333;
        color: #ccc;
        border: 1px solid #555;
        border-radius: 5px;
        cursor: pointer;
        transitions: all 0.3s ease;`;

    btn.addEventListener('click', function() {
        filterDrinks (category, btn);
    });

    buttonContainer.appendChild(btn);
});


filterContainer.appendChild(filterTitle);
filterContainer.appendChild(buttonContainer);

const firstBox = menuCol.firstElementChild;
    menuCol.insertBefore(filterContainer, firstBox);

function filterDrinks (category, clickedBtn) {
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.style.backgroundColor = '#333';
        btn.style.color = '#ccc';
        btn.style.borderColor = '#8fB38F';
    });

    clickedBtn.style.backgroundColor = '8FB39F';
    clickedBtn.style.color = 'white';
    clickedBtn.style.borderColor = '#8FB38F';

    allFieldsets.forEach(function(fieldset) {
        const legend = fieldset.querySelector('legend');
        if (category === 'ALL' || legend.textContent === category) {
            fieldset.style.display = 'block';
            fieldset.classList.add('visible');
        } else {
            fieldset.style.display = 'none';
            fieldset.classList.remove('visible');
        }
    });

    updateDrinkCount(category);
}

function updateDrinkCount(category) {
    let count = 0;
    allFieldsets.forEach(function(fieldset) {
        if (fieldset.style.display !== 'none') {
            const drinks = fieldset.querySelectorAll('.teaDes');
            count += drinks.length;
        }
    });

    filterTitle.textContent = `Filter Drinks by Category (${count} drinks shown)`;
}