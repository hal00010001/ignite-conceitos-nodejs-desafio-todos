const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username == username)
  
  if(!user){
    return response.status(404).json({ error: "User not found" })
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body
  const userAlreadyExists = users.some((user) => user.username == username)
  if(userAlreadyExists){
    return response.status(400).json({ error: "User already exists!" })
  }
  const user = {
    id: uuidv4(),
    name,
    username,    
    todos: []
  }
  users.push(user)  
  return response.status(201).json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  
  const todosItems = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  }
  user.todos.push(todosItems)
  return response.status(201).json(todosItems)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request  
  
  const todoItem = user.todos.find(todo => todo.id === id)
  console.log(todoItem)
  if(!todoItem){    
    return response.status(404).json({ error: 'Todo not found' })
  }

  todoItem.title = title
  todoItem.deadline = new Date(deadline)
  return response.status(200).json(todoItem)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {  
  const { user } = request
  const { id } = request.params
  
  const todoItem = user.todos.find(todo => todo.id === id)

  if(!todoItem){
    return response.status(404).json({ error: 'Todo not found' })
  }

  todoItem.done = true
  return response.status(200).json(todoItem)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {  
  const { user } = request
  const { id } = request.params

  const todoId = user.todos.findIndex(todo => todo.id === id)

  if(todoId < 0){
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos.splice(todoId, 1)
  return response.status(204).send()
})

module.exports = app