import { useState, useEffect } from 'react';
import './App.css';
import { CreateTodo } from './components/CreateTodo';
import { Todos } from './components/Todos';

function App() {
    const [todos, setTodos] = useState([]);

    const fetchTodos = async () => {
        try {
            const response = await fetch("http://localhost:3000/todos");
            const data = await response.json();
            setTodos(data.todos);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <div className="app">
            <h1>ToDo List</h1>
            <CreateTodo fetchTodos={fetchTodos} />
            <Todos todos={todos} fetchTodos={fetchTodos} />
        </div>
    );
}

export default App;