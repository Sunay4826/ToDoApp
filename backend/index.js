const express = require("express");
const mongoose = require("mongoose");
const { createTodo, updateTodo, patchTodo } = require("./types");
const { todo } = require("./db");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// API Endpoints
app.post("/todo", async function(req, res) {
    const createPayload = req.body;
    const parsedPayload = createTodo.safeParse(createPayload);

    if (!parsedPayload.success) {
        res.status(411).json({
            msg: "You sent the wrong inputs",
        });
        return;
    }

    // Put it in MongoDB
    const completed = typeof createPayload.completed === "boolean" ? createPayload.completed : false;
    const createdTodo = await todo.create({
        title: createPayload.title,
        description: createPayload.description,
        completed,
        priority: createPayload.priority || "medium",
        dueDate: createPayload.dueDate,
        tags: createPayload.tags || [],
        estimateMinutes: createPayload.estimateMinutes,
        completedAt: completed ? new Date() : null
    });

    res.json({
        msg: "Todo created",
        todo: createdTodo
    });
});
app.get("/todos", async function(req, res) {
    const todos = await todo.find({}).sort({ createdAt: -1 });
    res.json({ todos });
});

app.put("/completed", async function(req, res) {
    const updatePayload = req.body;
    const parsedPayload = updateTodo.safeParse(updatePayload);
    if (!parsedPayload.success) {
        res.status(411).json({
            msg: "You sent the wrong inputs",
        });
        return;
    }

    const completed = typeof req.body.completed === "boolean" ? req.body.completed : true;
    await todo.updateOne(
        { _id: req.body.id },
        { completed: completed, completedAt: completed ? new Date() : null }
    );

    res.json({
        msg: "Todo marked as completed"
    });
});

app.patch("/todo/:id", async function(req, res) {
    const parsedPayload = patchTodo.safeParse(req.body);
    if (!parsedPayload.success) {
        res.status(411).json({
            msg: "You sent the wrong inputs",
        });
        return;
    }

    const update = parsedPayload.data;
    if (typeof update.completed === "boolean") {
        update.completedAt = update.completed ? new Date() : null;
    }

    await todo.updateOne({ _id: req.params.id }, update);
    res.json({ msg: "Todo updated" });
});

app.delete("/todo/:id", async function(req, res) {
    await todo.deleteOne({ _id: req.params.id });
    res.json({ msg: "Todo deleted" });
});

module.exports = app;

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}