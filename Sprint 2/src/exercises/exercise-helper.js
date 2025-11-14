const Exercises = (function () {
    // Key for local storage
    const STORAGE_KEY = "ExerciseTracker.s2";

    class Exercise {
        constructor(name, reps, weight) {
            this.id = Date.now() + ":" + crypto.randomUUID();
            this.name = name;
            this.reps = reps;
            this.weight = weight;
        }   
    }

    function save(exercises) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
		} catch (e) {
			console.warn("Could not save exercise list", e);
		}
	}

    function load() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw != null) {
			try {
                let exercises = JSON.parse(raw);
				return exercises;
			} catch (e) {
				console.warn("Invalid saved data", e);
			}
		}
        return [];
	}

    return {
        Exercise,
        save,
        load,
    };

})();

export default Exercises;
