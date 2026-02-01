document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================
  // Cache elements
  // =========================
  const mainContainer = document.getElementById('main-container');
  const allH2 = Array.from(document.querySelectorAll('h2'));

  const drinksH2 = allH2.find((h) => h.textContent.trim().toUpperCase() === 'DRINKS');
  const toppingsH2 = allH2.find((h) => h.textContent.trim().toUpperCase() === 'TOPPINGS');

  const drinkCards = document.querySelectorAll('article.teaDes');
  const sizeRows = Array.from(document.querySelectorAll('.size-table tbody tr'));
  const sweetnessBars = Array.from(document.querySelectorAll('.bar-outer'));
  const toppingItems = Array.from(document.querySelectorAll('.topping-item'));

  if (!mainContainer || !drinksH2 || !toppingsH2 || drinkCards.length === 0) return;

  const drinksWrapper = drinksH2.closest('fieldset');
  const toppingsWrapper = toppingsH2.closest('fieldset');
  if (!drinksWrapper || !toppingsWrapper) return;

  const categoryFieldsets = Array.from(drinksWrapper.children).filter((el) => el.tagName === 'FIELDSET');

  // =========================
  // State + persistence
  // =========================
  let selectedDrinkCard = null;

  const state = {
    size: null,        // { label, add }
    sweetness: null,   // legend text
    toppings: new Set()
  };

  const CART_KEY = 'pst_menuV2_cart_final_v3';
  const PREF_KEY = 'pst_menuV2_prefs_final_v3';
  let cart = [];

  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (Array.isArray(savedCart)) cart = savedCart;

    const savedPrefs = JSON.parse(localStorage.getItem(PREF_KEY) || 'null');
    if (savedPrefs) {
      state.size = savedPrefs.size || null;
      state.sweetness = savedPrefs.sweetness || null;
      state.toppings = new Set(savedPrefs.toppings || []);
    }
  } catch (_) {
    // ignore
  }

  function persist() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.setItem(
      PREF_KEY,
      JSON.stringify({
        size: state.size,
        sweetness: state.sweetness,
        toppings: Array.from(state.toppings)
      })
    );
  }

  // =========================
  // Helpers
  // =========================
  function money(n) {
    const v = Number(n);
    return Number.isFinite(v) ? v.toFixed(2) : '0.00';
  }

  function parseMoney(text) {
    const cleaned = String(text || '').replace(/[^\d.-]/g, '');
    const v = parseFloat(cleaned);
    return Number.isFinite(v) ? v : 0;
  }

  const toppingPrice = 0.50; // (use your existing value) [file:20]

function getSelectedBasePrice() {
  if (!selectedDrinkCard) return 0;
  const priceSpan = selectedDrinkCard.querySelector('.price');
  return parseMoney(priceSpan?.textContent || '0');
}

function calcCurrentSelectionTotal() {
  const base = getSelectedBasePrice();
  const sizeAdd = state.size ? Number(state.size.add) || 0 : 0;
  const toppingAdd = (state.toppings.size || 0) * toppingPrice;
  return base + sizeAdd + toppingAdd;
}


  function getSelectedDrinkName() {
    if (!selectedDrinkCard) return 'None';

    const nameEl = selectedDrinkCard.querySelector('.teaType');
    if (!nameEl) return 'Unknown';

    const priceEl = nameEl.querySelector('.price');
    const priceText = priceEl ? priceEl.textContent.trim() : '';

    // Clone, remove the price span, then read ONLY the name text
    const clone = nameEl.cloneNode(true);
    clone.querySelector('.price')?.remove();
    const nameText = clone.textContent.trim();

    return priceText ? `${nameText} ${priceText}` : nameText;
}


  function calcTotal() {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }

  // =========================
  // Helper styles
  // =========================
  const helperStyle = document.createElement('style');
  helperStyle.textContent = `
    #menuTools { border:2px solid #8FB38F; background:#2c2c2c; padding:12px; border-radius:8px; margin:10px 0; }
    #menuTools h3 { color:#8FB38F; margin:0 0 10px 0; }
    #menuTools button { margin:4px; padding:8px 12px; background:#333; color:#ccc; border:1px solid #555; border-radius:6px; cursor:pointer; }
    #menuTools button.is-active { background:#8FB38F; color:#fff; border-color:#8FB38F; }

    .row-selected { background:#8FB38F !important; color:#fff !important; }
    .sweet-selected { outline:3px solid #8FB38F; border-radius:10px; }
    .topping-selected { outline:3px solid #8FB38F; border-radius:8px; }
    .drink-selected { outline:3px solid #8FB38F; border-radius:8px; }
    .btn-disabled { opacity:0.6; cursor:not-allowed; }

    #selectionWrap { border:3px solid #8FB38F; border-radius:10px; padding:12px; background:#1a1a1a; margin:12px 0; }
    #selectionStatus { margin-top:10px; font-weight:bold; }

    #cartWrap { border:3px solid #8FB38F; border-radius:10px; padding:12px; background:#1a1a1a; margin:12px 0; }
    #cartList { list-style:none; padding-left:0; margin:10px 0; }
    .cartItem { display:flex; gap:10px; justify-content:space-between; align-items:center; background:#2c2c2c; padding:8px; border-radius:8px; margin-bottom:8px; }
    .removeBtn { background:#555; color:#fff; border:none; border-radius:6px; padding:6px 10px; cursor:pointer; }

    #checkoutMsg { margin-top:10px; font-weight:bold; }
    #checkoutForm input { width:100%; padding:8px; margin-top:8px; border:1px solid #555; border-radius:4px; background:#eee; color:#000; }
  `;
  document.head.appendChild(helperStyle);

  // =========================
  // Filter UI
  // =========================
  const tools = document.createElement('div');
  tools.id = 'menuTools';

  const toolsTitle = document.createElement('h3');
  toolsTitle.textContent = 'Filter by Drink Type:';
  tools.appendChild(toolsTitle);

  const allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.textContent = 'All';
  allBtn.dataset.cat = 'ALL';
  allBtn.classList.add('is-active');
  tools.appendChild(allBtn);

  const categories = categoryFieldsets
    .map((fs) => fs.querySelector('legend')?.textContent?.trim())
    .filter(Boolean);

  [...new Set(categories)].forEach((cat) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = cat;
    b.dataset.cat = cat;
    tools.appendChild(b);
  });

  drinksH2.insertAdjacentElement('afterend', tools);

  tools.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const chosen = btn.dataset.cat || 'ALL';
    tools.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    categoryFieldsets.forEach((fs) => {
      const leg = fs.querySelector('legend')?.textContent?.trim();
      fs.style.display = (chosen === 'ALL' || leg === chosen) ? '' : 'none';
    });

    toolsTitle.textContent = chosen === 'ALL'
      ? 'Filter categories'
      : `Filter categories (${chosen})`;
  });

  // =========================
  // Build selection section
  // =========================
  const selectionWrap = document.createElement('section');
  selectionWrap.id = 'selectionWrap';

  const selectionTitle = document.createElement('h3');
  selectionTitle.textContent = 'Current Drink Selection:';
  selectionTitle.style.color = '#8FB38F';

  const prefsLine = document.createElement('p');
  prefsLine.style.color = '#ccc';

  const addSelectedBtn = document.createElement('button');
  addSelectedBtn.type = 'button';
  addSelectedBtn.textContent = 'Add selected drink to cart';
  addSelectedBtn.disabled = true;
  addSelectedBtn.classList.add('btn-disabled');
  addSelectedBtn.dataset.mode = 'add';

  const startOverBtn = document.createElement('button');
    startOverBtn.type = 'button';
    startOverBtn.textContent = 'Start Over';

  const selectionStatus = document.createElement('div');
  selectionStatus.id = 'selectionStatus';
  selectionStatus.style.color = 'orange';
  selectionStatus.textContent = 'Select a drink, then choose size and sweetness. (Toppings optional)';

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '10px';
    btnRow.style.flexWrap = 'wrap';

    btnRow.appendChild(addSelectedBtn);
    btnRow.appendChild(startOverBtn);


  selectionWrap.appendChild(selectionTitle);
  selectionWrap.appendChild(prefsLine);
  selectionWrap.appendChild(btnRow);
  selectionWrap.appendChild(selectionStatus);

  toppingsWrapper.insertAdjacentElement('afterend', selectionWrap);

  // =========================
  // Build cart section
  // =========================
  const cartWrap = document.createElement('section');
  cartWrap.id = 'cartWrap';

  const cartTitle = document.createElement('h3');
  cartTitle.style.color = '#8FB38F';

  const cartList = document.createElement('ul');
  cartList.id = 'cartList';

  const cartTotal = document.createElement('p');
  cartTotal.style.color = '#fff';




  cartWrap.appendChild(cartTitle);
  cartWrap.appendChild(cartList);
  cartWrap.appendChild(cartTotal);

  // Checkout form
  const checkoutForm = document.createElement('form');
  checkoutForm.id = 'checkoutForm';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.required = true;
  nameInput.placeholder = 'Your name';

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.required = true;
  emailInput.placeholder = 'Your email';

  const checkoutBtn = document.createElement('button');
  checkoutBtn.type = 'submit';
  checkoutBtn.textContent = 'Checkout';

  const checkoutMsg = document.createElement('div');
  checkoutMsg.id = 'checkoutMsg';

  checkoutForm.appendChild(nameInput);
  checkoutForm.appendChild(emailInput);
  checkoutForm.appendChild(checkoutBtn);
  checkoutForm.appendChild(checkoutMsg);

  cartWrap.appendChild(document.createElement('hr'));
  cartWrap.appendChild(checkoutForm);

  selectionWrap.insertAdjacentElement('afterend', cartWrap);

  // =========================
  // Cart template (cloneNode)
  // =========================
  const itemTemplate = document.createElement('template');
  itemTemplate.innerHTML = `
    <li class="cartItem">
      <span class="cartName" style="color:#ccc;"></span>
      <span class="cartPrice" style="color:#8FB38F; font-weight:bold;"></span>
      <button type="button" class="removeBtn">Remove</button>
    </li>
  `;

function renderPrefs() {
    const drinkText = getSelectedDrinkName();
    const sizeText = state.size ? `${state.size.label} (+$${money(state.size.add)})` : 'None';

    const sweetText = state.sweetness
    ? (state.sweetness.match(/\d+%/)?.[0] || state.sweetness)  // gets "50%" from "50% Sweetness"
    : 'None';

    const TOPPING_LABEL_ADD = 0.50;

    const topText = state.toppings.size
        ? Array.from(state.toppings).map((t) => `${t} (+$${money(TOPPING_LABEL_ADD)})`).join(', ')
        : 'None';

    const currentTotal = calcCurrentSelectionTotal();

    prefsLine.textContent =
        `Drink: ${drinkText}\n` +
        `Size: ${sizeText}\n` +
        `Sweetness: ${sweetText}\n` +
        `Toppings: ${topText}\n` +
        `--------------------------\n` +
        `Current total: $${money(currentTotal)}`


}


  function renderCart() {
    cartList.innerHTML = '';
    renderPrefs();

    cart.forEach((item, idx) => {
      const node = itemTemplate.content.cloneNode(true);
      node.querySelector('.cartName').textContent = item.label;
      node.querySelector('.cartPrice').textContent = `$${money(item.price)}`;

      node.querySelector('.removeBtn').addEventListener('click', () => {
        cart.splice(idx, 1);
        persist();
        renderCart();
      });

      cartList.appendChild(node);
    });

    cartTitle.textContent = `Your cart (${cart.length})`;
    cartTotal.textContent = `Total: $${money(calcTotal())}`;
  }

  function updateReadyState() {
    if (addSelectedBtn.dataset.mode === 'scroll') {
        addSelectedBtn.disabled = false;
        addSelectedBtn.classList.remove('btn-disabled');
        selectionStatus.style.color = '#8FB38F';
        selectionStatus.textContent = 'Click “Add another drink!” to continue your order.';
        return;
}

    
    const drinkOk = !!selectedDrinkCard;
    const sizeOk = !!state.size;
    const sweetOk = !!state.sweetness;

    const ready = drinkOk && sizeOk && sweetOk;

    addSelectedBtn.disabled = !ready;
    addSelectedBtn.classList.toggle('btn-disabled', !ready);

    if (ready) {
      selectionStatus.style.color = '#8FB38F';
      selectionStatus.textContent = 'Ready! Click “Add selected drink to cart”. (Toppings optional)';
      return;
    }

    selectionStatus.style.color = 'orange';
    const missing = [
      drinkOk ? null : 'drink',
      sizeOk ? null : 'size',
      sweetOk ? null : 'sweetness'
    ].filter(Boolean);

    selectionStatus.textContent = `To order, select a ${missing.join(', ')} above.`;
  }

  // -------------------------
  // NEW: one function that clears everything selected
  // -------------------------
  function clearAllSelections() {
    // Clear visual selection on drink
    if (selectedDrinkCard) selectedDrinkCard.classList.remove('drink-selected');
    selectedDrinkCard = null;

    // Clear state
    state.size = null;
    state.sweetness = null;
    state.toppings.clear();

    // Clear size highlight
    sizeRows.forEach((r) => r.classList.remove('row-selected'));

    // Clear sweetness highlight + aria
    sweetnessBars.forEach((b) => {
      b.classList.remove('sweet-selected');
      b.setAttribute('aria-pressed', 'false');
    });

    // Clear topping highlight
    toppingItems.forEach((li) => li.classList.remove('topping-selected'));

    // Persist cleared prefs + refresh UI
    persist();
    renderCart();
    updateReadyState();
  }

  // =========================
  // Cart buttons + checkout
  // =========================

  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!checkoutForm.checkValidity()) {
      checkoutMsg.textContent = 'Fix the form fields above.';
      checkoutMsg.style.color = '#d32f2f';
      return;
    }

    if (cart.length === 0) {
      checkoutMsg.textContent = 'Cart is empty. Add a drink first.';
      checkoutMsg.style.color = '#d32f2f';
      return;
    }

    checkoutMsg.textContent = `Order placed! Total: $${money(calcTotal())}`;
    checkoutMsg.style.color = '#8FB38F';
    window.alert('Thanks! Your order was placed.');

    cart = [];
    persist();
    renderCart();
    checkoutForm.reset();
  });

  startOverBtn.addEventListener('click', () => {
  // Clear all selections
  if (selectedDrinkCard) selectedDrinkCard.classList.remove('drink-selected');
  selectedDrinkCard = null;

  state.size = null;
  state.sweetness = null;
  state.toppings.clear();

  sizeRows.forEach((r) => r.classList.remove('row-selected'));

  sweetnessBars.forEach((b) => {
    b.classList.remove('sweet-selected');
    b.setAttribute('aria-pressed', 'false');
  });

  toppingItems.forEach((li) => li.classList.remove('topping-selected'));

  persist();
  renderCart();
  updateReadyState();

  // Scroll back to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


  // =========================
  // Size selection
  // =========================
  sizeRows.forEach((row) => {
    row.style.cursor = 'pointer';

    row.addEventListener('click', () => {
      sizeRows.forEach((r) => r.classList.remove('row-selected'));
      row.classList.add('row-selected');

      const cells = row.querySelectorAll('td');
      const label = (cells[0]?.textContent || '').trim();
      const add = parseMoney(cells[2]?.textContent || '0');

      state.size = { label, add };
      persist();
      renderCart();
      updateReadyState();
    });
  });

  // Apply saved size highlight (optional)
  if (state.size?.label) {
    const match = sizeRows.find((r) => (r.querySelector('td')?.textContent || '').trim() === state.size.label);
    if (match) match.classList.add('row-selected');
  }

  // =========================
  // Sweetness selection
  // =========================

  sweetnessBars.forEach((bar) => {
    bar.style.cursor = 'pointer';
    bar.setAttribute('role', 'button');
    bar.setAttribute('tabindex', '0');
    bar.setAttribute('aria-pressed', 'false');

    const sweetFieldsets = Array.from(
  new Set(sweetnessBars.map(b => b.closest('fieldset')).filter(Boolean))
);


    function chooseSweetness() {
          sweetFieldsets.forEach(fs => fs.classList.remove('sweetness-chosen'));
    sweetnessBars.forEach(b => {
    b.classList.remove('sweet-selected');
    b.setAttribute('aria-pressed', 'false');
  });

     const fs = bar.closest('fieldset');
  if (fs) fs.classList.add('sweetness-chosen');

  bar.setAttribute('aria-pressed', 'true');

  const legend = fs?.querySelector('legend');
  state.sweetness = legend ? legend.textContent.trim() : null;

  persist();
  renderCart();
  updateReadyState();

      bar.classList.add('sweet-selected');


      persist();
      renderCart();
      updateReadyState();
    }

    bar.addEventListener('click', chooseSweetness);
    bar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        chooseSweetness();
      }
    });
  });

  // Apply saved sweetness highlight (optional)
  if (state.sweetness) {
    const match = sweetnessBars.find((bar) => {
      const fs = bar.closest('fieldset');
      const legend = fs?.querySelector('legend')?.textContent?.trim();
      return legend === state.sweetness;
    });
    if (match) {
      match.classList.add('sweet-selected');
      match.setAttribute('aria-pressed', 'true');
    }
  }

  // =========================
  // Toppings toggle (optional)
  // =========================
  toppingItems.forEach((li) => {
    li.style.cursor = 'pointer';

    li.addEventListener('click', () => {
      const name = li.querySelector('h4')?.textContent?.trim();
      if (!name) return;

      if (state.toppings.has(name)) {
        state.toppings.delete(name);
        li.classList.remove('topping-selected');
      } else {
        state.toppings.add(name);
        li.classList.add('topping-selected');
      }

      persist();
      renderCart();
      updateReadyState();
    });
  });

  // Apply saved topping highlights (optional)
  toppingItems.forEach((li) => {
    const name = li.querySelector('h4')?.textContent?.trim();
    if (name && state.toppings.has(name)) li.classList.add('topping-selected');
  });

  // =========================
  // Drinks: add Select buttons
  // =========================
  drinkCards.forEach((card) => {
    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.textContent = 'Select';
    
    const desc = card.querySelector('.drinkDes1');
    if (desc) {
        desc.insertAdjacentElement('afterend', selectBtn); // button goes under drinkDes1
    } else {
        card.appendChild(selectBtn); // fallback
    }



    selectBtn.addEventListener('click', () => {
      if (selectedDrinkCard) selectedDrinkCard.classList.remove('drink-selected');

      selectedDrinkCard = card;
      selectedDrinkCard.classList.add('drink-selected');

      // Your "reset toppings to none" rule on new drink select:
      state.toppings.clear();
      toppingItems.forEach((li) => li.classList.remove('topping-selected'));

      persist();
      renderCart();
      updateReadyState();
    });
  });

  // =========================
  // Add selected drink to cart
  // =========================
  const TOPPING_PRICE = 0.50;

  addSelectedBtn.addEventListener('click', () => {
      // Mode 2: scroll to top, then revert back to normal "add" mode
    if (addSelectedBtn.dataset.mode === 'scroll') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // BOM scroll
        addSelectedBtn.dataset.mode = 'add';
        addSelectedBtn.textContent = 'Add selected drink to cart';
        updateReadyState(); // will disable until selections are made again
        return;
  }
    // Mode 1: add to cart (your current logic)
    if (addSelectedBtn.disabled || !selectedDrinkCard) return;

    const name = getSelectedDrinkName();

    const priceSpan = selectedDrinkCard.querySelector('.price');
    const base = parseMoney(priceSpan?.textContent || '0');

    const sizeAdd = state.size ? Number(state.size.add) || 0 : 0;
    const toppingAdd = state.toppings.size * TOPPING_PRICE;

    const parts = [
      name,
      state.size ? state.size.label : null,
      state.sweetness,
      state.toppings.size ? Array.from(state.toppings).join(', ') : 'No toppings'
    ].filter(Boolean);

    cart.push({
      label: parts.join(' | '),
      price: base + sizeAdd + toppingAdd
    });

    persist();
    renderCart();

    // REQUIRED: after adding, deselect EVERYTHING
    clearAllSelections();

      // Switch button to scroll mode
  addSelectedBtn.dataset.mode = 'scroll';
  addSelectedBtn.textContent = 'Add another drink!';
  updateReadyState();

  });

  // =========================
  // Initial render
  // =========================
  renderCart();
  updateReadyState();
});
