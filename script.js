
"use strict";

// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingReviews = document.getElementById("pendingReviews");
const verifiedSkills = document.getElementById("verifiedSkills");

const stuckReason = document.getElementById("stuckReason");
const getHint = document.getElementById("getHint");
const hintResult = document.getElementById("hintResult");

const submissionForm = document.getElementById("submissionForm");
const submissionTask = document.getElementById("submissionTask");
const projectLink = document.getElementById("projectLink");
const submissionNotes = document.getElementById("submissionNotes");
const submissionList = document.getElementById("submissionList");

const skillAnalysis = document.getElementById("skillAnalysis");
const passportList = document.getElementById("passportList");

// =====================================
// 2. APP DATA
// =====================================

let tasks = [];
let submissions = [];

// Demo verified skills.
// Real teacher verification will need teacher accounts and a backend.
let verifiedSkillNames = [];

let nextTaskId = 1;


// =====================================
// 3. SAVE AND RESTORE DATA
// =====================================

function saveData() {
    try {
        localStorage.setItem("skillTrackTasks", JSON.stringify(tasks));
        localStorage.setItem("skillTrackSubmissions", JSON.stringify(submissions));
        localStorage.setItem("skillTrackVerifiedSkills", JSON.stringify(verifiedSkillNames));
    } catch (error) {
        console.error("Could not save SkillTrack data:", error);
    }
}

function loadData() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem("skillTrackTasks"));
        const savedSubmissions = JSON.parse(localStorage.getItem("skillTrackSubmissions"));
        const savedSkills = JSON.parse(localStorage.getItem("skillTrackVerifiedSkills"));

        if (Array.isArray(savedTasks)) {
            tasks = savedTasks.filter(task =>
                task &&
                Number.isInteger(task.id) &&
                typeof task.title === "string" &&
                typeof task.completed === "boolean"
            );
        }

        if (Array.isArray(savedSubmissions)) {
            submissions = savedSubmissions.filter(item =>
                item &&
                typeof item.title === "string" &&
                typeof item.notes === "string" &&
                ["Pending Review", "Needs Changes", "Verified"].includes(item.status)
            );
        }

        if (Array.isArray(savedSkills)) {
            verifiedSkillNames = savedSkills.filter(skill =>
                typeof skill === "string"
            );
        }

        nextTaskId = tasks.reduce((highest, task) =>
            Math.max(highest, task.id), 0) + 1;

    } catch (error) {
        console.error("Could not load SkillTrack data:", error);
    }
}


// =====================================
// 4. DASHBOARD STATISTICS
// =====================================

function updateDashboard() {
    totalTasks.textContent = tasks.length;

    completedTasks.textContent = tasks.filter(task =>
        task.completed
    ).length;

    pendingReviews.textContent = submissions.filter(item =>
        item.status === "Pending Review"
    ).length;

    verifiedSkills.textContent = verifiedSkillNames.length;
}


// =====================================
// 5. CREATE TASK ELEMENTS SAFELY
// =====================================

function createTaskElement(task) {
    const item = document.createElement("article");
    item.className = "task-item";

    if (task.completed) {
        item.classList.add("completed");
    }

    const details = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = task.title;

    const priority = document.createElement("span");
    priority.className = "priority " + task.priority;
    priority.textContent = task.priority + " Priority";

    details.append(title, priority);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const completeButton = document.createElement("button");
    completeButton.type = "button";
    completeButton.textContent = task.completed ? "Undo" : "Complete";

    completeButton.addEventListener("click", function () {
        task.completed = !task.completed;
        saveData();
        renderApp();
    });

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
        const newTitle = prompt("Enter the updated task name:", task.title);

        if (newTitle === null) return;

        if (newTitle.trim() === "") {
            alert("Task name cannot be empty.");
            return;
        }

        task.title = newTitle.trim();
        saveData();
        renderApp();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", function () {
        const confirmed = confirm("Delete this task?");

        if (!confirmed) return;

        tasks = tasks.filter(existingTask =>
            existingTask.id !== task.id
        );

        saveData();
        renderApp();
    });

    actions.append(completeButton, editButton, deleteButton);
    item.append(details, actions);

    return item;
}


// =====================================
// 6. ADD A NEW TASK
// =====================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task name.");
        return;
    }

    const newTask = {
        id: nextTaskId,
        title: title,
        priority: taskPriority.value,
        completed: false
    };

    nextTaskId++;
    tasks.push(newTask);

    taskForm.reset();

    saveData();
    renderApp();
});


// =====================================
// 7. LEARNING HELP CENTER
// =====================================

const learningHints = {
    concept: {
        title: "Understand the concept",
        message: "Read one small example first. Write down what each line does, then try changing one value."
    },

    code: {
        title: "Build the code in small steps",
        message: "Write the HTML structure first, then add one JavaScript statement at a time. Test after each step."
    },

    error: {
        title: "Find the error",
        message: "Open the browser console with F12. Read the first error and check spelling, brackets and element IDs."
    },

    logic: {
        title: "Break down the problem",
        message: "Write the expected input, the steps your program should follow, and the expected output before coding."
    }
};

getHint.addEventListener("click", function () {
    const reason = stuckReason.value;

    if (reason === "") {
        hintResult.textContent = "Please select a problem first.";
        return;
    }

    const hint = learningHints[reason];

    hintResult.replaceChildren();

    const title = document.createElement("strong");
    title.textContent = hint.title;

    const message = document.createElement("p");
    message.textContent = hint.message;

    hintResult.append(title, message);
});


// =====================================
// 8. SUBMIT PRACTICAL WORK
// =====================================

submissionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = submissionTask.value.trim();
    const link = projectLink.value.trim();
    const notes = submissionNotes.value.trim();

    if (title === "" || notes === "") {
        alert("Please enter the practical name and your learning notes.");
        return;
    }

    const submission = {
        id: Date.now(),
        title: title,
        link: link,
        notes: notes,
        status: "Pending Review"
    };

    submissions.push(submission);

    submissionForm.reset();

    saveData();
    renderApp();

    alert("Your practical has been recorded for review.");
});


// =====================================
// 9. DISPLAY SUBMISSIONS
// =====================================

function createSubmissionElement(submission) {
    const card = document.createElement("article");
    card.className = "submission-card";

    const title = document.createElement("h3");
    title.textContent = submission.title;

    const notes = document.createElement("p");
    notes.textContent = submission.notes;

    const status = document.createElement("p");
    status.textContent = "Status: " + submission.status;

    card.append(title, notes, status);

    if (submission.link) {
        const link = document.createElement("a");
        link.href = submission.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open project";

        card.append(link);
    }

    // Demo review controls for testing only.
    // These are not secure teacher permissions.
    if (submission.status !== "Verified") {
        const reviewButton = document.createElement("button");
        reviewButton.type = "button";
        reviewButton.textContent = "Demo: Verify";

        reviewButton.addEventListener("click", function () {
            const confirmed = confirm(
                "This is a demo action, not real teacher verification. Continue?"
            );

            if (!confirmed) return;

            submission.status = "Verified";

            if (!verifiedSkillNames.includes(submission.title)) {
                verifiedSkillNames.push(submission.title);
            }

            saveData();
            renderApp();
        });

        const changesButton = document.createElement("button");
        changesButton.type = "button";
        changesButton.textContent = "Needs Changes";
        changesButton.style.marginLeft = "8px";

        changesButton.addEventListener("click", function () {
            submission.status = "Needs Changes";
            saveData();
            renderApp();
        });

        card.append(reviewButton, changesButton);

    } else {
        const verified = document.createElement("span");
        verified.className = "verified-label";
        verified.textContent = "Demo Verified";

        card.append(verified);
    }

    return card;
}


// =====================================
// 10. SKILL GAP SUGGESTIONS
// =====================================

function renderSkillAnalysis() {
    skillAnalysis.replaceChildren();

    if (tasks.length === 0 && submissions.length === 0) {
        const message = document.createElement("p");
        message.textContent =
            "Add practical tasks and record your work to begin tracking your learning.";
        skillAnalysis.append(message);
        return;
    }

    const total = tasks.length;
    const done = tasks.filter(task => task.completed).length;

    const progressCard = document.createElement("article");
    progressCard.className = "skill-item";

    const heading = document.createElement("h3");
    heading.textContent = "Task Completion";

    const description = document.createElement("p");
    description.textContent = total === 0
        ? "Add tasks to start tracking completion."
        : done + " of " + total + " tasks completed.";

    progressCard.append(heading, description);
    skillAnalysis.append(progressCard);

    const pendingCount = submissions.filter(item =>
        item.status === "Pending Review" ||
        item.status === "Needs Changes"
    ).length;

    const reviewCard = document.createElement("article");
    reviewCard.className = "skill-item";

    const reviewHeading = document.createElement("h3");
    reviewHeading.textContent = "Submission Follow-up";

    const reviewDescription = document.createElement("p");
    reviewDescription.textContent = pendingCount === 0
        ? "No submissions currently need follow-up."
        : pendingCount + " submission(s) may need review or changes.";

    reviewCard.append(reviewHeading, reviewDescription);
    skillAnalysis.append(reviewCard);
}


// =====================================
// 11. SKILL PASSPORT
// =====================================

function renderPassport() {
    passportList.replaceChildren();

    if (verifiedSkillNames.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "No verified skills yet. Your verified demo submissions will appear here.";
        passportList.append(message);
        return;
    }

    verifiedSkillNames.forEach(function (skillName) {
        const card = document.createElement("article");
        card.className = "passport-card";

        const title = document.createElement("h3");
        title.textContent = skillName;

        const description = document.createElement("p");
        description.textContent =
            "Practical submission recorded in this browser demo.";

        const label = document.createElement("span");
        label.className = "verified-label";
        label.textContent = "Demo Verified";

        card.append(title, description, label);
        passportList.append(card);
    });
}


// =====================================
// 12. RENDER THE WHOLE APP
// =====================================

function renderApp() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent =
            "No tasks added yet. Add your first practical!";
        taskList.append(empty);
    } else {
        tasks.forEach(function (task) {
            taskList.append(createTaskElement(task));
        });
    }

    submissionList.replaceChildren();

    if (submissions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent =
            "Your submitted practicals will appear here.";
        submissionList.append(empty);
    } else {
        submissions.forEach(function (submission) {
            submissionList.append(
                createSubmissionElement(submission)
            );
        });
    }

    updateDashboard();
    renderSkillAnalysis();
    renderPassport();
}


// =====================================
// 13. START SKILLTRACK
// =====================================

loadData();
renderApp();

console.log("SkillTrack is ready!");
