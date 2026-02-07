const mongoose = require('mongoose');
const todoSchema = mongoose.Schema({
    title: String,
    description: String,
    completed: Boolean,
    priority: { type: String, default: "medium" },
    dueDate: String,
    tags: [String],
    estimateMinutes: Number,
    createdAt: { type: Date, default: Date.now },
    completedAt: Date
})


const todo = mongoose.model('todos', todoSchema);

module.exports = {
    todo
}