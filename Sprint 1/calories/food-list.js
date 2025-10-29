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

		// If there's no saved data, parse the existing static <li> entries in the DOM
		const existing = Array.from(listEl.querySelectorAll('li'));
		if (existing.length) {
			items = existing.map((li, idx) => {
				const text = li.textContent || '';
				// try to split by ' - ' to extract calories
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
		// clear
		listEl.innerHTML = '';

		if (!items.length) {
			listEl.innerHTML = '<li><em>No foods added yet.</em></li>';
			return;
		}

		items.forEach(item => {
			const li = document.createElement('li');
			li.dataset.id = item.id;
			li.textContent = `${item.name} - ${item.calories} calories`;

            const editBtn = document.createElement('button');
			editBtn.type = 'button';
			editBtn.textContent = 'Edit';
			editBtn.style.marginLeft = '8px';
			editBtn.addEventListener('click', () => editItem(item.id));


			const removeBtn = document.createElement('button');
			removeBtn.type = 'button';
			removeBtn.textContent = 'Remove';
			removeBtn.style.marginLeft = '8px';
			removeBtn.addEventListener('click', () => removeItem(item.id));

            li.appendChild(editBtn);
			li.appendChild(removeBtn);
			listEl.appendChild(li);
		});
	}

	function addItem(name, calories) {
		item = new FoodItem(String(Date.now()), name.trim(), Number(calories) || 0);
		items.push(item);
		save();
		render();
		showMessage(`Added "${item.name}" (${item.calories} cal)`);
	}

	function editItem(id, name, calories) {
		const idx = items.findIndex(i => i.id === id);
		if (idx === -1) return;
        oldName = items[idx].name;
        items[idx].name = name;
        items[idx].calories = calories;
		save();
		render();
		showMessage(`Edited "${oldName}"`);
	}

	function removeItem(id) {
		const idx = items.findIndex(i => i.id === id);
		if (idx === -1) return;
		const removed = items.splice(idx, 1)[0];
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

