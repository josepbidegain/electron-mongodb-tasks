const {
    BrowserWindow,
    ipcMain
} = require('electron');

const Task = require('./models/Task');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('src/index.html');
}

ipcMain.on('new-task', async (e, args) => {
    try {
        const task = new Task(args);
        const taskSaved = await task.save();
        console.log(taskSaved);
        e.reply('new-task-created', JSON.stringify(taskSaved));
    } catch (err) {
        console.log('errorrr', err)
    }

});

ipcMain.on('get-tasks', async (e, args) => {
    const tasks = await Task.find();
    e.reply('response-get-tasks', JSON.stringify(tasks));
});

ipcMain.on('delete-task', async (e, id) => {
    console.log("deleting", id);
    const taskDeleted = await Task.findByIdAndDelete(id);
    e.reply('response-delete-task', JSON.stringify(taskDeleted));
});

ipcMain.on('update-task', async (e, args) => {
    console.log("updating", args);
    const updatedTask = await Task.findByIdAndUpdate(args.id, args, {
        new: true
    });
    e.reply('response-update-task', JSON.stringify(updatedTask));
});

module.exports = {
    createWindow
}