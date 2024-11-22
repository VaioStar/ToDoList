const express = require('express');
const cors = require('cors'); // Import CORS
const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:3001' // Only allow requests from this origin
}));

// Middleware to parse JSON
app.use(express.json()); // Używaj express.json() zamiast body-parser

let todos = [];

// Helper function to validate input
const validateTodo = (todo) => {
    if (!todo.name || typeof todo.name !== 'string') {
        return { error: 'Todo name is required and must be a string.' };
    }
    if (todo.dueDate && isNaN(Date.parse(todo.dueDate))) {
        return { error: 'Due date must be a valid date.' };
    }
    if (todo.completionDate && isNaN(Date.parse(todo.completionDate))) {
        return { error: 'Completion date must be a valid date.' };
    }
    return null;
};

// Create a new todo
app.post('/todos', (req, res) => {
    const { name, dueDate, completionDate, completed } = req.body;

    const validationError = validateTodo({ name, dueDate, completionDate });
    if (validationError) {
        return res.status(400).json(validationError);
    }

    const newTodo = {
        id: todos.length + 1,
        name,
        dueDate: dueDate || null,
        completionDate: completed ? completionDate || new Date().toISOString() : null,
        completed: !!completed, // Ustawienie completed na true/false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Get all todos
app.get('/todos', (req, res) => {
    // Jeśli nie podano 'showCompleted=true', filtrujemy zadania nieukończone
    const showCompleted = req.query.showCompleted === 'true';
    const filteredTodos = showCompleted
        ? todos // Pokaż wszystkie zadania
        : todos.filter((todo) => !todo.completed); // Pokaż tylko nieukończone zadania
    res.status(200).json(filteredTodos);
});

// Update a todo (edit)
app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { name, dueDate, completionDate, completed } = req.body;

    const validationError = validateTodo({ name, dueDate, completionDate });
    if (validationError) {
        return res.status(400).json(validationError);
    }

    const todo = todos.find((todo) => todo.id === parseInt(id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found.' });
    }

    todo.name = name || todo.name;
    todo.dueDate = dueDate || todo.dueDate;
    todo.completed = completed !== undefined ? completed : todo.completed;
    todo.completionDate = completed ? (completionDate || new Date().toISOString()) : null;

    res.status(200).json(todo);
});

// Delete a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter((todo) => todo.id !== parseInt(id));
    res.status(204).send();
});

// Mark a todo as completed
app.patch('/todos/:id/complete', (req, res) => {
    const { id } = req.params;

    const todo = todos.find((todo) => todo.id === parseInt(id));
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found.' });
    }

    todo.completed = true;
    todo.completionDate = new Date().toISOString(); // Ustaw datę wykonania na aktualną datę i godzinę
    res.status(200).json(todo);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
