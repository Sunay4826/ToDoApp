const zod = require("zod");

const createTodo = zod.object({
    title: zod.string(),
    description: zod.string(),
    priority: zod.string().optional(),
    dueDate: zod.string().optional(),
    tags: zod.array(zod.string()).optional(),
    estimateMinutes: zod.number().optional(),
    completed: zod.boolean().optional()
})

const updateTodo = zod.object({
    id: zod.string(),
    completed: zod.boolean().optional()
})

const patchTodo = zod.object({
    title: zod.string().optional(),
    description: zod.string().optional(),
    priority: zod.string().optional(),
    dueDate: zod.string().optional(),
    tags: zod.array(zod.string()).optional(),
    estimateMinutes: zod.number().optional(),
    completed: zod.boolean().optional()
})

module.exports = {
    createTodo: createTodo,
    updateTodo: updateTodo,
    patchTodo: patchTodo
}