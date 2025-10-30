const Calories = (function () {
    // Key for local storage
    const STORAGE_KEY = "CalorieTracker.s1";

    class FoodItem {
        constructor(name, calories) {
            this.id = Date.now() + ":" + crypto.randomUUID();
            this.name = name;
            this.calories = calories;
        }   
    }

    function save(items) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch (e) {
			console.warn("Could not save food list", e);
		}
	}

    function load() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw != null) {
			try {
                let items = JSON.parse(raw);
				return items;
			} catch (e) {
				console.warn("Invalid saved data", e);
			}
		}
        return [];
	}

    return {
        FoodItem,
        save,
        load,
    };

})();

export default Calories;
