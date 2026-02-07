import React from "react";

const columns = [
    { id: "low", label: "Low Priority" },
    { id: "medium", label: "Medium Priority" },
    { id: "high", label: "High Priority" },
    { id: "completed", label: "Completed" }
];

export function KanbanBoard({ todos, onMove, onFocus, onToggleComplete, focusTaskId }) {
    const getItemsForColumn = (columnId) => {
        if (columnId === "completed") {
            return todos.filter((todo) => todo.completed);
        }
        return todos.filter((todo) => !todo.completed && todo.priority === columnId);
    };

    const handleDrop = (event, columnId) => {
        event.preventDefault();
        const id = event.dataTransfer.getData("text/plain");
        const todo = todos.find((item) => item._id === id);
        if (!todo) return;

        if (columnId === "completed") {
            onMove(todo._id, { completed: true });
        } else {
            onMove(todo._id, { completed: false, priority: columnId });
        }
    };

    return (
        <section className="kanban">
            {columns.map((column) => {
                const items = getItemsForColumn(column.id);
                return (
                    <div
                        key={column.id}
                        className="kanban-column"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDrop(event, column.id)}
                    >
                        <div className="kanban-header">
                            <h3>{column.label}</h3>
                            <span>{items.length}</span>
                        </div>
                        <div className="kanban-list">
                            {items.length === 0 && (
                                <p className="kanban-empty">Drop a task here</p>
                            )}
                            {items.map((todo) => (
                                <div
                                    key={todo._id}
                                    className={`kanban-card ${focusTaskId === todo._id ? "active" : ""}`}
                                    draggable
                                    onDragStart={(event) => {
                                        event.dataTransfer.setData("text/plain", todo._id);
                                    }}
                                >
                                    <div>
                                        <h4>{todo.title}</h4>
                                        <p>{todo.description}</p>
                                    </div>
                                    <div className="kanban-tags">
                                        {(todo.tags || []).map((tag) => (
                                            <span key={tag}>#{tag}</span>
                                        ))}
                                    </div>
                                    <div className="kanban-actions">
                                        <button onClick={() => onFocus(todo)}>
                                            {focusTaskId === todo._id ? "In Focus" : "Focus"}
                                        </button>
                                        <button onClick={() => onToggleComplete(todo._id, !todo.completed)}>
                                            {todo.completed ? "Restore" : "Complete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </section>
    );
}
