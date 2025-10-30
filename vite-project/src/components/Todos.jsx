import React from 'react';

export function Todos({ todos, fetchTodos }) {
    const handleComplete = async (id) => {
        await fetch("http://localhost:3000/completed", {
            method: "PUT",
            body: JSON.stringify({ id: id }),
            headers: {
                "Content-type": "application/json"
            }
        });
        fetchTodos(); // Refresh the list after marking as completed
    };

    return (
        <div className="todos">
            {todos.map((todo) => (
                !todo.completed && ( // Only render if the todo is not completed
                    <div key={todo._id} className={`todo-item`}>
                        <h1>{todo.title}</h1>
                        <h2>{todo.description}</h2>
                        <button onClick={() => handleComplete(todo._id)}>
                            {todo.completed ? "Completed" : "Mark as Complete"}
                        </button>
                    </div>
                )
            ))}
        </div>
    );
}