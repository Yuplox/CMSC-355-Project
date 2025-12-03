import Exercises from "./exercise-helper.js";

(function () {

	// DOM elements
	const listEl = document.getElementById("exercise-list");
	const addButton = document.getElementById("add-button");
	const messageEl = document.getElementById("message");

	if (addButton) {
		addButton.addEventListener("click", () => goToForm("add"));
	}

	// In-memory list of exercises
	let exercises = [];

	function render() {
		// clear
		listEl.innerHTML = "";

		if (exercises.length == 0) {
			listEl.innerHTML = "<li><em>No exercises added yet.</em></li>";
			return;
		}

		exercises.forEach(exercise => {
			const li = document.createElement("li");
			li.dataset.id = exercise.id;
			li.textContent = `${exercise.name} :: ${exercise.reps} reps :: ${exercise.weight} lbs`;

            const editButton = document.createElement("button");
			editButton.type = "button";
			editButton.textContent = "Edit";
			editButton.style.marginLeft = "8px";
			editButton.addEventListener("click", () => goToForm("edit", exercise));


			const removeButton = document.createElement("button");
			removeButton.type = "button";
			removeButton.textContent = "Remove";
			removeButton.style.marginLeft = "8px";
			removeButton.addEventListener("click", () => removeExercise(exercise.id));

            li.appendChild(editButton);
			li.appendChild(removeButton);
			listEl.appendChild(li);
		});
	}

	function removeExercise(id) {
		const idx = exercises.findIndex(i => i.id === id);
		if (idx === -1) {
			console.warn("Unable to remove exercise")
			return;
		}
			
		const removed = exercises.splice(idx, 1)[0];
		Exercises.save(exercises);
		render();
		showMessage(`Removed "${removed.name}"`);
	}

	function showMessage(text, timeout = 2500) {
		if (!messageEl) return;
		messageEl.textContent = text;
		clearTimeout(showMessage._t);
		showMessage._t = setTimeout(() => (messageEl.textContent = ""), timeout);
	}

	function goToForm(type, exercise = null) {
		let destination = `exercise.html?type=${type}`
		if (exercise) {
			destination = `${destination}&id=${exercise.id}&name=${exercise.name}&reps=${exercise.reps}&weight=${exercise.weight}`;
		}
		window.location.href = destination;
	}

	// Initialize
	document.addEventListener("DOMContentLoaded", function () {
		exercises = Exercises.load();
		render();
	});

})();

