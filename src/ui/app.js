const taskForm = document.querySelector('#taskForm');
const taskName = document.querySelector('#taskName');
const taskDescription = document.querySelector('#taskDescription');
const taskList = document.querySelector('#taskList');


const {
    ipcRenderer
} = require('electron');

let tasks = [];
let updatingTaskID = null;

function handleDelete(id) {
    const result = confirm('Are you sure you want to delete it?');

    if (result) {
        ipcRenderer.send('delete-task', id);
    }
}

function handleEdit(id) {
    updatingTaskID = id;
    const taskToEdit = tasks.filter(t => t._id == id)[0];
    taskName.value = taskToEdit.name;
    taskDescription.value = taskToEdit.description;
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.map(t => {
        taskList.innerHTML += `
        <div class="card border-secondary mb-3" style="max-width: 20rem;">
            <div class="card-header"> Task ID: ${t._id} </div> 
            <div class="card-body">
                <h4 class="card-title"> ${t.name} </h4> 
                <p class="card-text"> ${t.description}</p> 
            </div> 

            <button type="button" class="btn btn-danger" onclick="handleDelete('${t._id}')"> Delete </button>
            <button type="button" class="btn btn-primary" onclick="handleEdit('${t._id}')">Edit</button>
        </div>
        `
    });
}

taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const task = {
        name: taskName.value,
        description: taskDescription.value
    };

    if (!updatingTaskID)
        ipcRenderer.send('new-task', task);
    else
        ipcRenderer.send('update-task', {
            ...task,
            id: updatingTaskID
        })

    taskForm.reset();
});

ipcRenderer.on('new-task-created', (e, args) => {
    const task = JSON.parse(args);
    tasks.push(task);
    renderTasks(tasks);
    alert('Task Created');
});

ipcRenderer.send('get-tasks');

ipcRenderer.on('response-get-tasks', (e, args) => {
    tasks = JSON.parse(args);
    renderTasks(tasks);
});

ipcRenderer.on('response-delete-task', (e, args) => {
    task = JSON.parse(args);
    tasks = tasks.filter(t => t._id != task._id);
    renderTasks(tasks);
});

ipcRenderer.on('response-update-task', (e, args) => {
    task = JSON.parse(args);
    tasks = tasks.map(t => {
        if (t._id == task._id) {
            t = task;
        }
        return t;
    })
    renderTasks(tasks);
});