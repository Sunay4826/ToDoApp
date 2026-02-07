import React, { useMemo } from "react";

const DAY_COUNT = 7;

const toLocalDateOnly = (value) => {
    if (!value) return null;
    if (typeof value === "string") {
        const parts = value.split("-");
        if (parts.length === 3) {
            const year = Number(parts[0]);
            const month = Number(parts[1]) - 1;
            const day = Number(parts[2]);
            return new Date(year, month, day);
        }
    }
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const toDateKey = (date) => {
    const normalized = toLocalDateOnly(date);
    if (!normalized) return null;
    return normalized.getTime();
};

export function Timeline({ todos, onFocus, onToggleComplete, focusTaskId }) {
    const now = new Date();
    const days = useMemo(() => {
        const list = [];
        for (let i = 0; i < DAY_COUNT; i += 1) {
            const date = new Date();
            date.setDate(now.getDate() + i);
            list.push(date);
        }
        return list;
    }, [now]);

    const grouped = useMemo(() => {
        const buckets = {
            none: [],
            overdue: []
        };
        days.forEach((day) => {
            buckets[toDateKey(day)] = [];
        });

        todos.forEach((todo) => {
            if (!todo.dueDate) {
                buckets.none.push(todo);
                return;
            }
            const due = new Date(todo.dueDate);
            if (!todo.completed && due < now) {
                buckets.overdue.push(todo);
                return;
            }
            const key = toDateKey(due);
            if (key && buckets[key]) {
                buckets[key].push(todo);
            } else {
                buckets.none.push(todo);
            }
        });

        return buckets;
    }, [todos, days, now]);

    const renderCard = (todo) => (
        <div key={todo._id} className={`timeline-card ${focusTaskId === todo._id ? "active" : ""}`}>
            <div>
                <h4>{todo.title}</h4>
                <p>{todo.description}</p>
            </div>
            <div className="timeline-meta">
                {(todo.tags || []).map((tag) => (
                    <span key={tag}>#{tag}</span>
                ))}
            </div>
            <div className="timeline-actions">
                <button onClick={() => onFocus(todo)}>
                    {focusTaskId === todo._id ? "In Focus" : "Focus"}
                </button>
                <button onClick={() => onToggleComplete(todo._id, !todo.completed)}>
                    {todo.completed ? "Restore" : "Complete"}
                </button>
            </div>
        </div>
    );

    return (
        <section className="timeline">
            <div className="timeline-row">
                {days.map((day) => {
                    const key = toDateKey(day);
                    return (
                        <div key={key} className="timeline-column">
                            <div className="timeline-header">
                                <h3>{day.toLocaleDateString()}</h3>
                                <span>{grouped[key].length}</span>
                            </div>
                            {grouped[key].map(renderCard)}
                        </div>
                    );
                })}
            </div>
            <div className="timeline-extra">
                <div className="timeline-column">
                    <div className="timeline-header">
                        <h3>Overdue</h3>
                        <span>{grouped.overdue.length}</span>
                    </div>
                    {grouped.overdue.map(renderCard)}
                </div>
                <div className="timeline-column">
                    <div className="timeline-header">
                        <h3>No due date</h3>
                        <span>{grouped.none.length}</span>
                    </div>
                    {grouped.none.map(renderCard)}
                </div>
            </div>
        </section>
    );
}
