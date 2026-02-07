import { useMemo, useState, useEffect } from 'react';
import './App.css';
import { CreateTodo } from './components/CreateTodo';
import { Todos } from './components/Todos';
import { KanbanBoard } from './components/KanbanBoard';
import { Timeline } from './components/Timeline';
import { AmbientToggle } from './components/AmbientToggle';

function App() {
    const CACHE_KEY = "nebula-todos-cache";
    const QUEUE_KEY = "nebula-todos-queue";
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [view, setView] = useState("all");
    const [viewMode, setViewMode] = useState("list");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("smart");
    const [focusTaskId, setFocusTaskId] = useState(null);
    const [focusDuration, setFocusDuration] = useState(25 * 60);
    const [timerSeconds, setTimerSeconds] = useState(25 * 60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [online, setOnline] = useState(navigator.onLine);
    const [syncing, setSyncing] = useState(false);
    const [queueCount, setQueueCount] = useState(0);

    const readQueue = () => {
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (err) {
            console.error("Queue parse error", err);
            return [];
        }
    };

    const writeQueue = (queue) => {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        setQueueCount(queue.length);
    };

    const cacheTodos = (list) => {
        localStorage.setItem(CACHE_KEY, JSON.stringify(list));
    };

    const loadCachedTodos = () => {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (err) {
            console.error("Cache parse error", err);
            return [];
        }
    };

    const fetchTodos = async () => {
        try {
            setLoading(true);
            setError("");
            if (!navigator.onLine) {
                const cached = loadCachedTodos();
                setTodos(cached);
                return;
            }
            const response = await fetch(`${API_BASE}/todos`);
            const data = await response.json();
            setTodos(data.todos);
            cacheTodos(data.todos);
        } catch (error) {
            console.error("Error fetching todos:", error);
            setError("Could not reach the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    useEffect(() => {
        const queue = readQueue();
        setQueueCount(queue.length);
    }, []);

    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    useEffect(() => {
        if (online) {
            syncQueue();
        }
    }, [online]);

    useEffect(() => {
        if (!timerRunning) return;
        if (timerSeconds <= 0) {
            setTimerRunning(false);
            return;
        }
        const interval = setInterval(() => {
            setTimerSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    const handleCreate = async (payload) => {
        if (!navigator.onLine) {
            const clientId = `local-${Date.now()}`;
            const createdAt = new Date().toISOString();
            const localTodo = {
                _id: clientId,
                title: payload.title,
                description: payload.description,
                priority: payload.priority || "medium",
                dueDate: payload.dueDate || null,
                tags: payload.tags || [],
                estimateMinutes: payload.estimateMinutes,
                completed: false,
                createdAt,
                completedAt: null,
                localOnly: true
            };
            setTodos((prev) => {
                const next = [localTodo, ...prev];
                cacheTodos(next);
                return next;
            });
            const queue = readQueue();
            queue.push({ type: "create", clientId, payload });
            writeQueue(queue);
            return;
        }

        await fetch(`${API_BASE}/todo`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-type": "application/json" }
        });
        fetchTodos();
    };

    const handleToggleComplete = async (id, completed) => {
        if (!navigator.onLine) {
            setTodos((prev) => {
                const next = prev.map((todo) => (
                    todo._id === id
                        ? { ...todo, completed, completedAt: completed ? new Date().toISOString() : null }
                        : todo
                ));
                cacheTodos(next);
                return next;
            });

            const queue = readQueue();
            const isLocal = id.startsWith("local-");
            if (isLocal) {
                const createAction = queue.find((action) => action.type === "create" && action.clientId === id);
                if (createAction) {
                    createAction.payload.completed = completed;
                }
            } else {
                queue.push({ type: "toggle", id, completed });
            }
            writeQueue(queue);
            return;
        }

        await fetch(`${API_BASE}/completed`, {
            method: "PUT",
            body: JSON.stringify({ id, completed }),
            headers: { "Content-type": "application/json" }
        });
        fetchTodos();
    };

    const handleUpdate = async (id, update) => {
        if (!navigator.onLine) {
            setTodos((prev) => {
                const next = prev.map((todo) => (
                    todo._id === id ? { ...todo, ...update } : todo
                ));
                cacheTodos(next);
                return next;
            });

            const queue = readQueue();
            const isLocal = id.startsWith("local-");
            if (isLocal) {
                const createAction = queue.find((action) => action.type === "create" && action.clientId === id);
                if (createAction) {
                    createAction.payload = { ...createAction.payload, ...update };
                }
            } else {
                queue.push({ type: "update", id, update });
            }
            writeQueue(queue);
            return;
        }

        await fetch(`${API_BASE}/todo/${id}`, {
            method: "PATCH",
            body: JSON.stringify(update),
            headers: { "Content-type": "application/json" }
        });
        fetchTodos();
    };

    const handleDelete = async (id) => {
        if (!navigator.onLine) {
            setTodos((prev) => {
                const next = prev.filter((todo) => todo._id !== id);
                cacheTodos(next);
                return next;
            });

            const queue = readQueue();
            const isLocal = id.startsWith("local-");
            if (isLocal) {
                const filtered = queue.filter((action) => action.clientId !== id && action.id !== id);
                writeQueue(filtered);
            } else {
                queue.push({ type: "delete", id });
                writeQueue(queue);
            }
            return;
        }

        await fetch(`${API_BASE}/todo/${id}`, {
            method: "DELETE"
        });
        fetchTodos();
    };

    const syncQueue = async () => {
        const queue = readQueue();
        if (queue.length === 0 || !navigator.onLine) return;
        setSyncing(true);

        const idMap = {};
        const remaining = [];

        for (const action of queue) {
            try {
                if (action.type === "create") {
                    const response = await fetch(`${API_BASE}/todo`, {
                        method: "POST",
                        body: JSON.stringify(action.payload),
                        headers: { "Content-type": "application/json" }
                    });
                    const json = await response.json();
                    if (json.todo && json.todo._id) {
                        idMap[action.clientId] = json.todo._id;
                    }
                }
                if (action.type === "update") {
                    const targetId = idMap[action.id] || action.id;
                    await fetch(`${API_BASE}/todo/${targetId}`, {
                        method: "PATCH",
                        body: JSON.stringify(action.update),
                        headers: { "Content-type": "application/json" }
                    });
                }
                if (action.type === "toggle") {
                    const targetId = idMap[action.id] || action.id;
                    await fetch(`${API_BASE}/completed`, {
                        method: "PUT",
                        body: JSON.stringify({ id: targetId, completed: action.completed }),
                        headers: { "Content-type": "application/json" }
                    });
                }
                if (action.type === "delete") {
                    const targetId = idMap[action.id] || action.id;
                    await fetch(`${API_BASE}/todo/${targetId}`, {
                        method: "DELETE"
                    });
                }
            } catch (err) {
                console.error("Queue sync failed", err);
                remaining.push(action);
            }
        }

        writeQueue(remaining);
        setSyncing(false);
        fetchTodos();
    };

    const getPriorityScore = (priority) => {
        if (priority === "high") return 3;
        if (priority === "medium") return 2;
        return 1;
    };

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

    const isSameDay = (dateA, dateB) => {
        return dateA.toDateString() === dateB.toDateString();
    };

    const now = new Date();
    const today = toLocalDateOnly(now);
    const completionDays = useMemo(() => {
        const days = new Set();
        todos
            .filter((todo) => todo.completedAt)
            .forEach((todo) => {
                const date = new Date(todo.completedAt);
                date.setHours(0, 0, 0, 0);
                days.add(date.getTime());
            });
        return days;
    }, [todos]);

    const currentStreak = useMemo(() => {
        let streak = 0;
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        while (completionDays.has(day.getTime())) {
            streak += 1;
            day.setDate(day.getDate() - 1);
        }
        return streak;
    }, [completionDays]);

    const bestStreak = useMemo(() => {
        const sortedDays = Array.from(completionDays).sort((a, b) => a - b);
        let best = 0;
        let current = 0;
        for (let i = 0; i < sortedDays.length; i++) {
            if (i === 0 || sortedDays[i] - sortedDays[i - 1] === 86400000) {
                current += 1;
            } else {
                current = 1;
            }
            best = Math.max(best, current);
        }
        return best;
    }, [completionDays]);

    const filteredTodos = useMemo(() => {
        const loweredQuery = query.trim().toLowerCase();
        return todos.filter((todo) => {
            if (view === "active" && todo.completed) return false;
            if (view === "completed" && !todo.completed) return false;
            if (view === "today") {
                if (!todo.dueDate) return false;
                const due = toLocalDateOnly(todo.dueDate);
                if (!due || !isSameDay(due, today)) return false;
            }
            if (view === "overdue") {
                if (!todo.dueDate) return false;
                const due = toLocalDateOnly(todo.dueDate);
                if (!due || todo.completed || due >= today) return false;
            }
            if (view === "high" && todo.priority !== "high") return false;
            if (!loweredQuery) return true;

            const tags = (todo.tags || []).join(" ").toLowerCase();
            return (
                todo.title.toLowerCase().includes(loweredQuery) ||
                todo.description.toLowerCase().includes(loweredQuery) ||
                tags.includes(loweredQuery)
            );
        });
    }, [todos, view, query, now]);

    const sortedTodos = useMemo(() => {
        const items = [...filteredTodos];
        if (sort === "created") {
            return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        if (sort === "priority") {
            return items.sort((a, b) => getPriorityScore(b.priority) - getPriorityScore(a.priority));
        }
            if (sort === "due") {
            return items.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                    return toLocalDateOnly(a.dueDate) - toLocalDateOnly(b.dueDate);
            });
        }
        return items.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const priorityGap = getPriorityScore(b.priority) - getPriorityScore(a.priority);
            if (priorityGap !== 0) return priorityGap;
            if (!a.dueDate && b.dueDate) return 1;
            if (a.dueDate && !b.dueDate) return -1;
            if (a.dueDate && b.dueDate) {
                return toLocalDateOnly(a.dueDate) - toLocalDateOnly(b.dueDate);
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [filteredTodos, sort]);

    const focusTask = todos.find((todo) => todo._id === focusTaskId);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    const handleFocus = (todo) => {
        const duration = todo.estimateMinutes ? todo.estimateMinutes * 60 : 25 * 60;
        setFocusTaskId(todo._id);
        setFocusDuration(duration);
        setTimerSeconds(duration);
        setTimerRunning(false);
    };

    const activeCount = todos.filter((todo) => !todo.completed).length;
    const completedCount = todos.filter((todo) => todo.completed).length;
    const overdueCount = todos.filter((todo) => {
        if (!todo.dueDate) return false;
        const due = toLocalDateOnly(todo.dueDate);
        return due && !todo.completed && due < today;
    }).length;
    const dueTodayCount = todos.filter((todo) => {
        if (!todo.dueDate) return false;
        const due = toLocalDateOnly(todo.dueDate);
        return due && isSameDay(due, today);
    }).length;

    return (
        <div className="app">
            {!online && (
                <div className="offline-banner">
                    Offline mode: changes will sync automatically.
                </div>
            )}
            {online && syncing && (
                <div className="offline-banner">
                    Syncing {queueCount} queued changes...
                </div>
            )}
            <header className="hero">
                <div className="hero-text">
                    <p className="hero-eyebrow">NEBULA TASKS</p>
                    <h1>Turn chaos into a cinematic task</h1>
                    <p className="hero-subtitle">
                        Focus rituals, streaks, priority signals, and smart views designed
                        to make your day feel legendary.
                    </p>
                    <div className="hero-actions">
                        <AmbientToggle />
                        <div className="queue-pill">
                            {queueCount} queued
                        </div>
                    </div>
                </div>
                <div className="hero-focus">
                    <div className="focus-card">
                        <div className="focus-header">
                            <span>Focus Capsule</span>
                            <span className="focus-timer">{formatTime(timerSeconds)}</span>
                        </div>
                        <div className="focus-body">
                            <p className="focus-title">
                                {focusTask ? focusTask.title : "Select a task to enter focus mode"}
                            </p>
                            <p className="focus-meta">
                                {focusTask ? focusTask.description : "Your focus timer adapts to estimates."}
                            </p>
                        </div>
                        <div className="focus-actions">
                            <button
                                className="ghost"
                                onClick={() => {
                                    setTimerSeconds(focusDuration);
                                    setTimerRunning(false);
                                }}
                            >
                                Reset
                            </button>
                            <button
                                className="primary"
                                onClick={() => setTimerRunning((prev) => !prev)}
                                disabled={!focusTask}
                            >
                                {timerRunning ? "Pause Focus" : "Start Focus"}
                            </button>
                            <button
                                className="ghost"
                                onClick={() => {
                                    if (focusTask) {
                                        handleToggleComplete(focusTask._id, true);
                                    }
                                }}
                                disabled={!focusTask}
                            >
                                Complete
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="stats">
                <div className="stat-card">
                    <p>Active tasks</p>
                    <h2>{activeCount}</h2>
                </div>
                <div className="stat-card">
                    <p>Completed</p>
                    <h2>{completedCount}</h2>
                </div>
                <div className="stat-card">
                    <p>Due today</p>
                    <h2>{dueTodayCount}</h2>
                </div>
                <div className="stat-card">
                    <p>Overdue</p>
                    <h2>{overdueCount}</h2>
                </div>
                <div className="stat-card">
                    <p>Streak</p>
                    <h2>{currentStreak}d</h2>
                    <span className="stat-sub">Best {bestStreak}d</span>
                </div>
            </section>

            <section className="controls">
                <div className="search">
                    <input
                        type="text"
                        placeholder="Search tasks, tags, or descriptions..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
                <div className="filters">
                    {["all", "active", "completed", "today", "overdue", "high"].map((item) => (
                        <button
                            key={item}
                            className={view === item ? "active" : ""}
                            onClick={() => setView(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <div className="sort">
                    <label htmlFor="sort">Sort</label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                    >
                        <option value="smart">Smart</option>
                        <option value="due">Due date</option>
                        <option value="priority">Priority</option>
                        <option value="created">Created</option>
                    </select>
                </div>
            </section>

            <CreateTodo onCreate={handleCreate} />

            {error && <div className="error">{error}</div>}
            {loading ? (
                <div className="loading">Summoning your tasks...</div>
            ) : (
                <>
                    <div className="view-toggle">
                        {["list", "board", "timeline"].map((mode) => (
                            <button
                                key={mode}
                                className={viewMode === mode ? "active" : ""}
                                onClick={() => setViewMode(mode)}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    {viewMode === "list" && (
                        <Todos
                            todos={sortedTodos}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onFocus={handleFocus}
                            focusTaskId={focusTaskId}
                        />
                    )}
                    {viewMode === "board" && (
                        <KanbanBoard
                            todos={sortedTodos}
                            onMove={handleUpdate}
                            onFocus={handleFocus}
                            onToggleComplete={handleToggleComplete}
                            focusTaskId={focusTaskId}
                        />
                    )}
                    {viewMode === "timeline" && (
                        <Timeline
                            todos={sortedTodos}
                            onFocus={handleFocus}
                            onToggleComplete={handleToggleComplete}
                            focusTaskId={focusTaskId}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;