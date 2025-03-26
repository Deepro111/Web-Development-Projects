const container = document.querySelector('.container');
const taskInput = container.querySelector('.taskInput');
const taskDate = container.querySelector('.taskDate');
const addTaskBtn = container.querySelector(".addTask")
const taskList = container.querySelector(".taskList")
const taskCount = container.querySelector(".taskCount")

// function to update the task count everytime a new task is added or deleted.
function updateCount(){
    let count = taskList.children.length; // counting number of tasks in the list
    for(let task of taskList.children){
        if(task.children[0].classList.contains("completed")){ // if the task is marked as completed
            count--;
        }
    }   
    taskCount.textContent = `${count} Tasks Pending`;
}

// function to save tasks in local storage
function saveTasks() {
    let tasks = [];
    document.querySelectorAll(".taskList li").forEach(li => {
        let taskText = li.querySelector("span").innerText;
        let dueDateSpan = li.querySelector(".dueDate");
        let taskDueDate = dueDateSpan && dueDateSpan.dataset.date ? dueDateSpan.dataset.date : null;
        let isCompleted = li.querySelector("span:first-child").classList.contains("completed");

        tasks.push({ text: taskText, dueDate: taskDueDate, completed: isCompleted });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// function to add a new task to the list
function addTask(task, dueDate=NULL){

    let taskItem = document.createElement("li");
    taskItem.setAttribute("draggable", "true");
    taskItem.classList.add("draggable-task");

    let taskText = document.createElement("span");
    taskText.textContent = task;

    let dueDateSpan = document.createElement("span"); 
    dueDateSpan.classList.add("dueDate");
    if(dueDate){
        dueDateSpan.textContent = `Due : ${dueDate}`;
        dueDateSpan.dataset.date = dueDate;
        applyDueDateColor(taskItem, dueDate);
    }

    dueDateSpan.addEventListener("click", function () {
        let input = document.createElement("input");
        input.type = "date";
        input.value = this.dataset.date || "";
        input.style.position = "absolute"; // To overlay on the due date
        input.style.left = this.getBoundingClientRect().left + "px"; 
        input.style.top = this.getBoundingClientRect().top + "px";
    
        document.body.appendChild(input);
        input.focus();
    
        input.addEventListener("change", () => {
            if (input.value) {
                this.textContent = `Due : ${input.value}`;
                this.dataset.date = input.value;
                applyDueDateColor(taskItem, input.value);
                saveTasks(); // Update local storage
            }
            document.body.removeChild(input); // Remove date input after selection
        });
    
        input.addEventListener("blur", () => {
            document.body.removeChild(input); // Remove if user clicks outside
        });
    });

    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "\u2715";
    deleteBtn.classList.add("deleteBtn");

    taskText.addEventListener("click", function(){
        taskText.classList.toggle("completed");
        updateCount();
        saveTasks();
    });

    taskText.addEventListener("dblclick", function () {
        let updatedText = prompt("Edit your task:", this.innerText);
        if (updatedText !== null && updatedText.trim() !== "") {
            this.innerText = updatedText.trim();
            saveTasks(); 
        }
    });

    deleteBtn.addEventListener("click", ()=>{
        taskItem.remove();
        updateCount();
        saveTasks();
    });

    taskItem.appendChild(taskText);
    taskItem.appendChild(dueDateSpan);
    taskItem.appendChild(deleteBtn);    

    taskList.appendChild(taskItem);

    updateCount();
    saveTasks();
    addDragAndDropEvents();
}

// now add event listener to the add task button
addTaskBtn.addEventListener("click", function(){
    let taskText = taskInput.value.trim();
    let taskDueDate = taskDate.value;

    if (taskText === "") {
        alert("Task cannot be empty!");
        return;
    }

    addTask(taskText, taskDueDate);
    taskInput.value = "";
    taskDate.value = "";
});

// function to apply color to the task based on the due date
function applyDueDateColor(taskElement, dueDate) {
    let today = new Date().toISOString().split("T")[0]; // Get today's date
    if (dueDate === today) {
        taskElement.style.color = "orange"; // Task is due today
    } else if (dueDate < today) {
        taskElement.style.color = "red"; // Task is overdue
    } else {
        taskElement.style.color = "green"; // Task is in the future
    }
}

// function to load tasks from local storage after refreshing the page
function loadTasks() {
    let savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    taskList.innerHTML = "";
    savedTasks.forEach(task => {
        addTask(task.text, task.dueDate ? task.dueDate : null);
        let lastTask = document.querySelector(".taskList li:last-child span:first-child"); 
        if (task.completed) {
           lastTask.classList.add("completed");
        }
    });
}


// call load task function
loadTasks();

// selecting the clear all tasks button
const clearBtn = container.querySelector(".clearAllTasks");

// adding event listener to the clear all tasks button
clearBtn.addEventListener("click", ()=>{

    let confirmDelete = confirm("Are you sure you want to delete all tasks?");
    if (confirmDelete) {
        taskList.innerHTML = ""; 
        localStorage.removeItem("tasks"); 
        updateCount();
    }
})

// selecting the filter tasks dropdown
const filterTasks = document.querySelector(".filterTasks");
console.log(filterTasks);

// adding event listener to the filter tasks dropdown
filterTasks.addEventListener("change", function(){
    console.log(this);
    
    let filter = this.value;

    console.log(filter);
    
    let tasks = document.querySelectorAll(".taskList li");
    console.log(tasks);
    
    tasks.forEach((task)=>{
        let taskSpan = task.querySelector("span:first-child");
        let isCompleted = taskSpan.classList.contains("completed");

        switch(filter){
            case "all":
                task.style.display = "flex";
                break;
            case "completed":
                if(isCompleted){
                    task.style.display = "flex";
                }else{
                    task.style.display = "none";
                }
                break;
            case "pending":
                if(!isCompleted){
                    task.style.display = "flex";
                }else{
                    task.style.display = "none";
                }
                break;
            default:
                task.style.display = "flex";
                break;
        }
    })
})

function addDragAndDropEvents() {
    const tasks = document.querySelectorAll(".draggable-task");

    tasks.forEach(task => {
        task.addEventListener("dragstart", (e) => {
            e.target.classList.add("dragging");
        });

        task.addEventListener("dragend", (e) => {
            e.target.classList.remove("dragging");
            saveTasks();
        });
    });

    taskList.addEventListener("dragover", (e)=>{
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const draggingElement = document.querySelector(".dragging");
        if (afterElement == null) {
            taskList.appendChild(draggingElement);
        } else {
            taskList.insertBefore(draggingElement, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".draggable-task:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

const darkModeToggle = document.getElementById("darkModeToggle");

// Check user preference on page load
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true; // Keep toggle ON if dark mode was enabled
}

// Event listener for toggle switch
darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
});


const sortDropdown = document.querySelector(".sortTasks");

sortDropdown.addEventListener("change", function () {
    let tasksArray = Array.from(document.querySelectorAll(".taskList li"));

    if (this.value === "asc") {
        tasksArray.sort((a, b) => {
            let dateA = a.querySelector(".dueDate").dataset.date || "9999-12-31"; 
            let dateB = b.querySelector(".dueDate").dataset.date || "9999-12-31"; 
            return dateA.localeCompare(dateB);
        });
    } else if (this.value === "desc") {
        tasksArray.sort((a, b) => {
            let dateA = a.querySelector(".dueDate").dataset.date || "0000-01-01"; 
            let dateB = b.querySelector(".dueDate").dataset.date || "0000-01-01"; 
            return dateB.localeCompare(dateA);
        });
    }

    // Clear task list and re-add sorted tasks
    taskList.innerHTML = "";
    tasksArray.forEach(task => taskList.appendChild(task));

    saveTasks(); // Save the new order
});


