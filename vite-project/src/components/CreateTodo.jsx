import React, { useState } from 'react';

export function CreateTodo({ onCreate }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const [estimateMinutes, setEstimateMinutes] = useState("");

    const parseTags = (rawTags, rawTitle, rawDescription) => {
        const fromInput = rawTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        const hashtagRegex = /#([a-zA-Z0-9_-]+)/g;
        const text = `${rawTitle} ${rawDescription}`;
        const fromText = [];
        let match = hashtagRegex.exec(text);
        while (match) {
            fromText.push(match[1]);
            match = hashtagRegex.exec(text);
        }

        return Array.from(new Set([...fromInput, ...fromText]));
    };

    const handleAddTodo = async () => {
        if (!title.trim()) return;
        const tags = parseTags(tagsInput, title, description);
        const estimate = estimateMinutes ? Number(estimateMinutes) : undefined;
        await onCreate({
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: dueDate || undefined,
            tags,
            estimateMinutes: estimate
        });
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        setTagsInput("");
        setEstimateMinutes("");
    };

    return (
        <section className="create-todo">
            <div className="create-header">
                <div>
                    <h2>Create a new task</h2>
                    <p>Give your work a clear goal, a time window, and a signal.</p>
                </div>
                <button className="primary" onClick={handleAddTodo}>Add task</button>
            </div>

            <div className="create-grid">
                <input
                    type="text"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Description or #tags"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div className="inline-field">
                    <label>Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="inline-field">
                    <label>Due date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
                <div className="inline-field">
                    <label>Tags</label>
                    <input
                        type="text"
                        placeholder="design, sprint, #impact"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                    />
                </div>
                <div className="inline-field">
                    <label>Estimate (min)</label>
                    <input
                        type="number"
                        min="5"
                        step="5"
                        value={estimateMinutes}
                        onChange={(e) => setEstimateMinutes(e.target.value)}
                    />
                </div>
            </div>
        </section>
    );
}