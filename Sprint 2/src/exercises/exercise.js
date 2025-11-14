import Exercises from "./exercise-helper.js";

(function () {
    // DOM elements
    const form = document.getElementById("exercise-form");
    const nameInput = document.getElementById("exercise-name");
    const repsInput = document.getElementById("exercise-reps");
    const weightInput = document.getElementById("exercise-weight");
    const cancelButton = document.getElementById("cancel-button");

    // Parse parameters
    const params = new URLSearchParams(window.location.search);
    const typeP = params.get("type"); // "add" or "edit"
    const idP = params.get("id");     // epochTime:randomUUID
    const nameP = params.get("name");
    const repsP = params.get("reps");
    const weightP = params.get("weight");

    if (cancelButton) {
        cancelButton.addEventListener("click", () => goToList());
    }

    // Load parameters into input boxes
    if (typeP === "edit") {
        nameInput.value = nameP;
        repsInput.value = repsP;
        weightInput.value = weightP;
    }

    // In-memory list of FoodItems
	let exercises = Exercises.load();

    function addExercise(name, reps, weight) {
		let exercise = new Exercises.Exercise(name, reps, weight);
		exercises.push(exercise);
		Exercises.save(exercises);
	}

    function editExercise(id, name, reps, weight) {
		const idx = exercises.findIndex(i => i.id === id);
		if (idx === -1) 
            return;

        exercises[idx].name = name;
        exercises[idx].reps = reps;
        exercises[idx].weight = weight;
		Exercises.save(exercises);
	}

    function goToList() {
        window.location.href = "exercise-list.html";
    }

    if (form) {
		form.addEventListener("submit", function (ev) {
			ev.preventDefault();
			const name = nameInput.value;
			const reps = repsInput.value;
            const weight = weightInput.value;

            if (typeP === "add") {
                addExercise(name, reps, weight);
            } else if (typeP === "edit") {
                editExercise(idP, name, reps, weight);
            }
			
			form.reset();
			goToList();
		});
	}

})();