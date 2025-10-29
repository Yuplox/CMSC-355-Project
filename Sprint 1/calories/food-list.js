(function () {
  // Key for localStorage
  const STORAGE_KEY = 'foodList.v1';

  // DOM elements
  const form = document.getElementById('add-food-form');
  const nameInput = document.getElementById('food-name');
  const caloriesInput = document.getElementById('food-calories');
  const listEl = document.getElementById('food-list');
  const messageEl = document.getElementById('message');

  class FoodItem {
    constructor(id, name, calories) {
      this.id = id;
      this.name = name;
      this.calories = calories;
    }
  }

  // In-memory list of FoodItems
  let items = [];
  // Track which item is being edited
  let editingId = null;

  // Small helper to safely build a [data-id="..."] selector
  function cssEscapeAttrValue(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(String(value));
    }
    // minimal fallback: escape quotes and backslashes
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '');
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save food list', e);
    }
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        items = JSON.parse(raw);
        return;
      } catch (e) {
        console.warn('Invalid saved data, falling back to DOM initial list', e);
      }
    }

    // If there's no saved data, parse any static <li> entries from the DOM
    const existing = Array.from(listEl.querySelectorAll('li'));
    if (existing.length) {
      items = existing.map((li, idx) => {
        const text = li.textContent || '';
        const parts = text.split(' - ');
        const name = parts[0].trim();
        const cal = parts[1] ? parseInt(parts[1].replace(/[^0-9]/g, ''), 10) || 0 : 0;
        const id = li.dataset.id || String(Date.now()) + '-' + idx;
        return { id, name, calories: cal };
      });
      save();
    }
  }

  function render() {
    listEl.innerHTML = '';

    if (!items.length) {
      listEl.innerHTML = '<li><em>No foods added yet.</em></li>';
      return;
    }

    items.forEach(item => {
      const li = document.createElement('li');
      li.dataset.id = item.id;

      if (editingId === item.id) {
        // Editable state
        const nameField = document.createElement('input');
        nameField.type = 'text';
        nameField.value = item.name;
        nameField.setAttribute('aria-label', 'Food name');
        nameField.size = Math.max(6, item.name.length || 6);

        const calField = document.createElement('input');
        calField.type = 'number';
        calField.min = '0';
        calField.step = '1';
        calField.value = String(item.calories);
        calField.setAttribute('aria-label', 'Calories');
        calField.style.marginLeft = '8px';
        calField.style.width = '6rem';

        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save';
        saveBtn.style.marginLeft = '8px';
        saveBtn.addEventListener('click', () => {
          const newName = nameField.value.trim();
          const parsed = parseInt(calField.value, 10);
          const newCals = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;

          if (!newName) {
            showMessage('Name is required');
            nameField.focus();
            return;
          }

          const idx = items.findIndex(i => i.id === item.id);
          if (idx !== -1) {
            const oldName = items[idx].name;
            items[idx].name = newName;
            items[idx].calories = newCals;
            editingId = null;
            save();
            render();
            showMessage(`Edited "${oldName}" → "${newName}"`);
          }
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.marginLeft = '8px';
        cancelBtn.addEventListener('click', () => {
          editingId = null;
          render();
        });

        // Enter to save, Escape to cancel
        const keyHandler = e => {
          if (e.key === 'Enter') saveBtn.click();
          if (e.key === 'Escape') cancelBtn.click();
        };
        nameField.addEventListener('keydown', keyHandler);
        calField.addEventListener('keydown', keyHandler);

        li.appendChild(nameField);
        li.appendChild(document.createTextNode(' - '));
        li.appendChild(calField);
        li.appendChild(document.createTextNode(' calories'));
        li.appendChild(saveBtn);
        li.appendChild(cancelBtn);
      } else {
        // Read-only state
        li.textContent = `${item.name} - ${item.calories} calories`;

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.textContent = 'Edit';
        editBtn.style.marginLeft = '8px';
        editBtn.addEventListener('click', () => startEdit(item.id));

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '8px';
        removeBtn.addEventListener('click', () => removeItem(item.id));

        li.appendChild(editBtn);
        li.appendChild(removeBtn);
      }

      listEl.appendChild(li);
    });
  }

  function addItem(name, calories) {
    const n = String(name || '').trim();
    const parsed = parseInt(calories, 10);
    const cal = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;

    if (!n) {
      showMessage('Name is required');
      return;
    }

    const item = new FoodItem(String(Date.now()), n, cal);
    items.push(item);
    save();
    render();
    showMessage(`Added "${item.name}" (${item.calories} cal)`);
  }

  function startEdit(id) {
    if (editingId && editingId !== id) editingId = null;
    editingId = id;
    render();

    // Focus the name field for this item (robust escaping)
    const selectorId = cssEscapeAttrValue(id);
    const li = listEl.querySelector(`li[data-id="${selectorId}"]`);
    if (li) {
      const firstInput = li.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }
  }

  function removeItem(id) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    const removed = items.splice(idx, 1)[0];
    if (editingId === id) editingId = null;
    save();
    render();
    showMessage(`Removed "${removed.name}"`);
  }

  function showMessage(text, timeout = 2500) {
    if (!messageEl) return;
    messageEl.textContent = text;
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => (messageEl.textContent = ''), timeout);
  }

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      const name = nameInput.value;
      const cal = caloriesInput.value;
      addItem(name, cal);
      form.reset();
      nameInput.focus();
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    load();
    render();
  });
})();
