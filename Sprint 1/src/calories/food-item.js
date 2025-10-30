import Calories from "./food-helper.js";

(function () {
    // Key for localStorage
	const STORAGE_KEY = "CalorieTracker.s1";

    // DOM elements
    const form = document.getElementById("food-form");
    const nameInput = document.getElementById("food-name");
    const caloriesInput = document.getElementById("food-calories");
    const cancelButton = document.getElementById("cancel-button");

    // Parse parameters
    const params = new URLSearchParams(window.location.search);
    const typeP = params.get("type"); // "add" or "edit"
    const idP = params.get("id");     // epochTime:randomUUID
    const nameP = params.get("name");
    const calP = params.get("cal");

    if (cancelButton) {
        cancelButton.addEventListener("click", () => goToList());
    }

    if (typeP === "edit") {
        nameInput.value = nameP;
        caloriesInput.value = calP;
    }

    // In-memory list of FoodItems
	let items = Calories.load();

    function addItem(name, calories) {
		let item = new Calories.FoodItem(name.trim(), Number(calories) || 0);
		items.push(item);
		Calories.save(items);
	}

    function editItem(id, name, calories) {
		const idx = items.findIndex(i => i.id === id);
		if (idx === -1) return;
        let oldName = items[idx].name;
        items[idx].name = name;
        items[idx].calories = calories;
		Calories.save(items);
	}

    function goToList() {
        window.location.href = "food-list.html";
    }

    if (form) {
		form.addEventListener("submit", function (ev) {
			ev.preventDefault();
			const name = nameInput.value;
			const cal = caloriesInput.value;

            if (typeP === "add") {
                addItem(name, cal);
            } else if (typeP === "edit") {
                editItem(idP, name, cal);
            }
			
			form.reset();
			goToList();
		});
	}

})();