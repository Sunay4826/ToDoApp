import React, { useState } from 'react';

export function CreateTodo(props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleAddTodo = () => {
        fetch("http://localhost:3000/todo", {
            method: "POST",
            body: JSON.stringify({
                title: title,
                description: description
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(async (res) => {
            const json = await res.json();
            alert("Todo added");
            props.fetchTodos(); // Refresh the list after adding
            setTitle(""); // Clear input fields
            setDescription("");
        })
        .catch(error => console.error("Error adding todo:", error));
    };

    return (
        <div className="create-todo">
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={handleAddTodo}>Add Todo</button>
        </div>
    );
}