import React, { useState } from 'react';

export function Todos({ todos, onToggleComplete, onDelete, onUpdate, onFocus, focusTaskId }) {
    const [editId, setEditId] = useState(null);
    const [draft, setDraft] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        tags: "",
        estimateMinutes: ""
    });

    const startEdit = (todo) => {
        setEditId(todo._id);
        setDraft({
            title: todo.title || "",
            description: todo.description || "",
            priority: todo.priority || "medium",
            dueDate: todo.dueDate || "",
            tags: (todo.tags || []).join(", "),
            estimateMinutes: todo.estimateMinutes || ""
        });
    };

    const saveEdit = async () => {
        const payload = {
            title: draft.title.trim(),
            description: draft.description.trim(),
            priority: draft.priority,
            dueDate: draft.dueDate || undefined,
            tags: draft.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            estimateMinutes: draft.estimateMinutes ? Number(draft.estimateMinutes) : undefined
        };
        await onUpdate(editId, payload);
        setEditId(null);
    };

    return (
        <div className="todos">
            {todos.length === 0 && (
                <div className="empty-state">
                    <h3>No tasks yet</h3>
                    <p>Create a task or switch to board view to drag priorities.</p>
                </div>
            )}
            {todos.map((todo) => {
                const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
                const isOverdue = dueDate && !todo.completed && dueDate < new Date();
                const isFocus = focusTaskId === todo._id;

                return (
                    <div
                        key={todo._id}
                        className={`todo-item ${todo.completed ? "completed" : ""} priority-${todo.priority}`}
                    >
                        <div className="todo-main">
                            <div className="todo-header">
                                <div>
                                    <h3>{todo.title}</h3>
                                    <p>{todo.description}</p>
                                </div>
                                <span className={`badge ${todo.priority}`}>{todo.priority}</span>
                            </div>

                            <div className="todo-meta">
                                {todo.tags && todo.tags.length > 0 && (
                                    <div className="tags">
                                        {todo.tags.map((tag) => (
                                            <span key={tag} className="tag">#{tag}</span>
                                        ))}
                                    </div>
                                )}
                                {todo.estimateMinutes && (
                                    <span className="meta-pill">{todo.estimateMinutes} min</span>
                                )}
                                {dueDate && (
                                    <span className={`meta-pill ${isOverdue ? "overdue" : ""}`}>
                                        Due {dueDate.toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="todo-actions">
                            <button className={isFocus ? "active" : ""} onClick={() => onFocus(todo)}>
                                {isFocus ? "In Focus" : "Focus"}
                            </button>
                            <button onClick={() => onToggleComplete(todo._id, !todo.completed)}>
                                {todo.completed ? "Restore" : "Complete"}
                            </button>
                            <button onClick={() => startEdit(todo)}>Edit</button>
                            <button className="danger" onClick={() => onDelete(todo._id)}>Delete</button>
                        </div>

                        {editId === todo._id && (
                            <div className="todo-edit">
                                <input
                                    type="text"
                                    value={draft.title}
                                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                                />
                                <input
                                    type="text"
                                    value={draft.description}
                                    onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                                />
                                <div className="edit-grid">
                                    <select
                                        value={draft.priority}
                                        onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={draft.dueDate}
                                        onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="tags, focus, launch"
                                        value={draft.tags}
                                        onChange={(event) => setDraft({ ...draft, tags: event.target.value })}
                                    />
                                    <input
                                        type="number"
                                        min="5"
                                        step="5"
                                        placeholder="Estimate"
                                        value={draft.estimateMinutes}
                                        onChange={(event) => setDraft({ ...draft, estimateMinutes: event.target.value })}
                                    />
                                </div>
                                <div className="edit-actions">
                                    <button className="primary" onClick={saveEdit}>Save</button>
                                    <button className="ghost" onClick={() => setEditId(null)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}