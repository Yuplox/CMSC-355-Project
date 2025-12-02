import Calories from "./food-helper.js";

(function () {

	// DOM elements
	const listEl = document.getElementById("food-list");
	const addButton = document.getElementById("add-button");
	const messageEl = document.getElementById("message");

	if (addButton) {
		addButton.addEventListener("click", () => goToForm("add"));
	}

	// In-memory list of FoodItems
	let items = [];

	function render() {
		// clear
		listEl.innerHTML = "";

		if (items.length == 0) {
			listEl.innerHTML = "<li><em>No foods added yet.</em></li>";
			return;
		}

		items.forEach(item => {
			const li = document.createElement("li");
			li.dataset.id = item.id;
			li.textContent = `${item.name} - ${item.calories} calories`;

            const editButton = document.createElement("button");
			editButton.type = "button";
			editButton.textContent = "Edit";
			editButton.style.marginLeft = "8px";
			editButton.addEventListener("click", () => goToForm("edit", item));


			const removeButton = document.createElement("button");
			removeButton.type = "button";
			removeButton.textContent = "Remove";
			removeButton.style.marginLeft = "8px";
			removeButton.addEventListener("click", () => removeItem(item.id));

            li.appendChild(editButton);
			li.appendChild(removeButton);
			listEl.appendChild(li);
		});
	}

	function removeItem(id) {
		const idx = items.findIndex(i => i.id === id);
		if (idx === -1) {
			console.warn("Unable to remove food item")
			return;
		}
			
		const removed = items.splice(idx, 1)[0];
		Calories.save(items);
		render();
		showMessage(`Removed "${removed.name}"`);
	}

	function showMessage(text, timeout = 2500) {
		if (!messageEl) return;
		messageEl.textContent = text;
		clearTimeout(showMessage._t);
		showMessage._t = setTimeout(() => (messageEl.textContent = ""), timeout);
	}

	function goToForm(type, item = null) {
		let destination = `food-item.html?type=${type}`
		if (item) {
			destination = `${destination}&id=${item.id}&name=${item.name}&cal=${item.calories}`;
		}
		window.location.href = destination;
	}

	// Initialize
	document.addEventListener("DOMContentLoaded", function () {
		items = Calories.load();
		render();
	});

})();

