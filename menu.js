




const menuSection = document.getElementById('section2');

const allDrinks = document.querySelectorAll('.teaDes');
const allFieldsets = document.querySelectorAll('.menu-col fieldset');
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
    'SLUSH TEAS',
    'PUNCHY TEAS',
    'MATCHA TEAS',
    'CLASSIC TEAS',
    'YOGURTS',
    'ESPRESSO'];

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


/* ================================================= */


const cartContainer = document.createElement('div');
cartContainer.id = 'shopping-cart';
cartContainer.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 320px;
    background-color: #1a1a1a;
    border: 3px solid #8FB38F;
    border-radius: 10px;
    padding: 15px;
    max-height: 500px;
    overflow-y: auto;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0,0,0,0,3);`;

  

const cartTitle = document.createElement('h3');
cartTitle.textContent = '🛒 Your Cart';
cartTitle.style.cssText = `
    color: #8FB38F;
    text-align: center;
    margin-bottom: 10px;
    font-size: 1.3em;`;



const cartItems = document.createElement('ul');
cartItems.id = 'cart-items';
cartItems.style.cssText = `
    list-style: none;
    padding: 0;
    margin: 15px 0;`;

  

const cartTotal = document.createElement('div');
cartTotal.id = 'cart-total';
cartTotal.style.cssText = `
background-color: #2c2c2c;
    padding: 10px;
    text-align: center;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    margin-top: 10px;`;


cartTotal.textContent = 'Total: $0.00';
  

const clearCartBtn = document.createElement('button');
clearCartBtn.textContent = 'Clear Cart';
clearCartBtn.className = 'ClearBtn';
clearCartBtn.style.cssText = `
    width: 100%;
    margin-top: 10px;
    padding: 10px
    background-color: #d32f2f;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;`;

  
const fragment = document.createDocumentFragment();
fragment.appendChild(cartTitle);
fragment.appendChild(cartItems);
fragment.appendChild(cartTotal);
fragment.appendChild(clearCartBtn);
cartContainer.appendChild(fragment);


document.body.appendChild(cartContainer);

  

const cartItemTemplate = document.createElement ('template');
cartItemTemplate.innerHTML = `
    <li class="cart-item" style="
        background-color: #2c2c2c;
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 5px;
        border-left : 3px solid #8FB38F;">
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;">
            <span class="item-name style="
                color: #ccc;
                font:-size: 0.9em;"></span
            <span class="item-price" style="
                color: #8FB38F;
                font-weight: bold;"></span>
        </div>

        <button class="remove-item" style="
            margin-top: 5px;
            padding: 3px 8px;
            background-color: #555;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.8em">Remove
        </button>
    </li>
`;

  
let cartData = [];
  

allDrinks.forEach(function(drink) {
    const drinkName = drink.querySelector('.teaType').firstChild.textContent;
    const priceSpan = drink.querySelector('.price');
    const price = parseFloat(priceSpan.textContent.replace('$', ''));

  
    const addButton = document.createElement('button');

    addButton.textContent = '+ Add to Cart';
    addButton.className = 'add-to-cart-btn';
    addButton.style.cssText = `
        background-color: #8FB38F;
        color: white;
        padding: 8px 15px;
        boarder: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
        font-weight: bold;
        transition: transform 0.2s ease;`;


    addButton.addEventListener('mouseover', function() {
        addButton.style.transform = 'scale(1.05)';
        addButton.backgroundColor = '$45a049';
    });

    
    addButton.addEventListener('mouseout', function() {
        addButton.style.transform = 'scale(1)';
        addButton.style.backgroundColor = '#8FB38F';
    });
    

    addButton.addEventListener('click', function() {
        addToCart(drinkName, price);
    
        addButton.textContent = '✓ Added!';
        addButton.style.backgroundColor = '#45a049';

        setTimeout(function() {
            addButton.textContent = '+ Add to Cart';
            addButton.style.backgroundColor = '#8FB38F';
        }, 1000);
    });
  
    const descriptionDiv = drink.querySelector('.drinkDes1');
    descriptionDiv.appendChild(addButton);
});

  

function addToCart(name, price) {
    cartData.push({ name, price });
    updateCart();
}


function updateCart() {
    cartItems.innerHTML = '';

    let total = 0;

    cartData.forEach(function(item, index) {
        const itemClone = cartItemTemplate.content.cloneNode(true);

        const itemName = itemClone.querySelector('.item-name');
        const itemPrice = itemClone.querySelector('.item-price');
        const removeBtn = itemClone.querySelector('remove-item');

        itemName.textContent = item.name;
        itemPrice.textContent = `$${item.price.toFixed(2)}`;

        removeBtn.addEventListener('click', function() {
            cartData.splice(index, 1);
            updateCart();
        });

        cartItems.appendChild(itemClone);
        total += item.price;
    });

    cartTotal.textContent = `Total: $${total.toFixed(2)}`;

    cartTitle.innerHTML = `🛒 Your Cart <span style="color: white; font-size: 0.9em;">(${cartData.length} items)</span>`;
}

clearCartBtn.addEventListener('click', function() {
    cartData = [];
    updateCart();


    if (cartData.length === 0) {
        alert('Cart cleared successfully!');
    }
});