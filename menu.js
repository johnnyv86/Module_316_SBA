cosnt menuSelection = document.getElementById('selection2');
const fieldsets = document.querySelectorAll('selection2 fieldset');
const legends = document.querySelectorAll('selection2 fieldset > legend');

const filterWrap = document.createElement('div');
    filterWrap.id = 'menuFilters';
const title = document.createElement('h3');
    title.textContent = 'Filter Categories';
const allButton = document.createElement('Button');
    allButton.type = 'button';
    allButton.textContent = 'All'

    filterWrap.appendChild(title);
    filterWrap.appendChild(allButton);

legends.forEach((legends) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = legend.textContext.trim();
    button.dataset.category = legend.textContent.trim();

    filterWrap.appendChild(button);
});

menuSelection.prepend(filterWrap);

filterWrap.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') 
        return;

    const chosen = e.target.dataset.category || 'ALL';

    fieldsets.forEach((fs) => {
        const legendText = fs.querySelector('legend').textContent.trim();
        fs.computedStyleMap.display = (chosen === 'ALL' || legendText === chosen) ? '': 'none';
    })

    filterWrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));

    title.textContent = `Filter Categories (${chosen})`;
});

allButton.addEventListener('click', () => {
    fieldsets.forEach(fs => fs.computedStyleMap.display = '');
    title.textContent = 'Filter Categories (All)';
})