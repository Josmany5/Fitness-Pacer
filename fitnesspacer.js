// Preset Exercises
const presetExercises = [
    "Squats",
    "Rows",
    "Pulldowns",
    "Chest Press",
    "Shoulder Press",
    "Curls",
    "Tricep Extensions",
    "Deadlift",
    "Ham Curls",
    "Glute Thrusts",
];

// Global Variables
let workout = [];
let history = JSON.parse(localStorage.getItem("history")) || [];
let currentExerciseIndex = 0;
let currentSet = 0;

// Add Exercise Function
function addExercise() {
    const exercisesDiv = document.getElementById("exercises");
    const exerciseDiv = document.createElement("div");
    exerciseDiv.classList.add("exercise");
    exerciseDiv.innerHTML = `
        <select class="preset">
            <option value="">Custom</option>
            ${presetExercises.map((ex) => `<option value="${ex}">${ex}</option>`).join("")}
        </select>
        <input type="text" placeholder="Exercise Name" class="name" />
        <input type="number" placeholder="Sets" class="sets" />
        <input type="number" placeholder="Reps" class="reps" />
        <input type="number" placeholder="Rest (seconds)" class="rest" />
        <input type="number" placeholder="Weight (lbs)" class="weight" />
    `;

    exercisesDiv.appendChild(exerciseDiv);

    // Auto-fill custom field if a preset is selected
    exerciseDiv.querySelector(".preset").addEventListener("change", function () {
        const customName = exerciseDiv.querySelector(".name");
        if (this.value) customName.value = this.value;
    });
}

// Initialize the First Exercise Bar
function initializeFirstExercise() {
    const exercisesDiv = document.getElementById("exercises");
    exercisesDiv.innerHTML = "";
    addExercise();
}

// Start Workout Function
function startWorkout() {
    const exercisesDiv = document.querySelectorAll(".exercise");
    workout = []; // Clear previous workout data

    exercisesDiv.forEach((exercise) => {
        const name = exercise.querySelector(".name").value;
        const sets = parseInt(exercise.querySelector(".sets").value);
        const reps = parseInt(exercise.querySelector(".reps").value);
        const rest = parseInt(exercise.querySelector(".rest").value);
        const weight = parseInt(exercise.querySelector(".weight").value);

        if (name && sets && reps && rest && weight) {
            workout.push({ name, sets, reps, rest, weight, completedSets: 0 });
        }
    });

    if (workout.length > 0) {
        document.getElementById("workout-creator").style.display = "none";
        document.getElementById("workout-tracker").style.display = "block";
        loadNextExercise();
    } else {
        alert("Please fill out at least one exercise before starting!");
    }
}

// Load Next Exercise Function
function loadNextExercise() {
    if (currentExerciseIndex >= workout.length) {
        endWorkout();
        return;
    }

    const exercise = workout[currentExerciseIndex];
    document.getElementById("current-exercise").innerHTML = `
        <p><b>Exercise:</b> ${exercise.name}</p>
        <p><b>Set:</b> ${exercise.completedSets + 1}/${exercise.sets}</p>
        <p><b>Reps:</b> ${exercise.reps}</p>
        <p><b>Weight:</b> ${exercise.weight} lbs</p>
    `;
}

// Mark Set Complete
function completeSet() {
    const exercise = workout[currentExerciseIndex];
    exercise.completedSets++;

    if (exercise.completedSets >= exercise.sets) {
        currentExerciseIndex++;
    }

    startRest(exercise.rest);
}

// Start Rest Timer
function startRest(restTime) {
    const timer = document.getElementById("timer");
    let remaining = restTime;

    // Show initial timer
    timer.innerHTML = `<p style="font-size: 48px;">Rest: ${remaining}s</p>`;

    const interval = setInterval(() => {
        remaining--;

        // Update timer display
        if (remaining > 5) {
            timer.innerHTML = `<p style="font-size: 48px;">Rest: ${remaining}s</p>`;
        } else if (remaining > 0) {
            timer.innerHTML = `<p style="color: red; font-size: 48px;">Rest: ${remaining}s - Get Ready! Next set soon</p>`;
        } else {
            clearInterval(interval);
            loadNextExercise();
        }
    }, 1000);
}

// End Workout Function
function endWorkout() {
    const feedback = prompt("How did you feel? Rate 1-5:");

    if (feedback && feedback >= 1 && feedback <= 5) {
        const workoutEndTime = new Date();
        history.push({
            workout,
            feedback: feedback,
            date: new Date().toISOString(),
            startTime: workout[0].startTime,
            endTime: workoutEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        localStorage.setItem("history", JSON.stringify(history));
    }

    workout = [];
    currentExerciseIndex = 0;

    alert("Workout complete!");
    document.getElementById("workout-creator").style.display = "block";
    document.getElementById("workout-tracker").style.display = "none";
    loadHistory();
}

// Delete History Function
function deleteHistory() {
    if (confirm("Are you sure you want to delete all workout history?")) {
        history = [];
        localStorage.setItem("history", JSON.stringify(history));
        loadHistory();
        alert("Workout history deleted.");
    }
}

// Load Workout History
function loadHistory() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = history
        .map(
            (entry) => `
            <li>
                <b>Date:</b> ${entry.date.split("T")[0]}<br>
                <b>Start Time:</b> ${entry.startTime}<br>
                <b>End Time:</b> ${entry.endTime}<br>
                <b>Exercises:</b> 
                <ul>
                    ${entry.workout
                        .map(
                            (ex) => `<li>${ex.name} - ${ex.sets} sets, ${ex.reps} reps, Rest: ${ex.rest}s, Weight: ${ex.weight} lbs</li>`
                        )
                        .join("")}
                </ul>
                <b>Feedback:</b> ${entry.feedback}
            </li>`
        )
        .join("");
}

// Initialize Calendar
function initCalendar() {
    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: history.map((entry) => ({
            title: `Workout (${entry.feedback})`,
            start: entry.date.split("T")[0],
        })),
    });
    calendar.render();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initializeFirstExercise();
    loadHistory();
    initCalendar();
});
