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
  console.log(username, user)
  if(!user){
    return response.status(400).json({ error: "User not found" })
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
  users.push({
    id: uuidv4(),
    username,
    name,
    todos: []
  })
  console.log(users)
  return response.status(201).json(request.body)
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
    deadline,
    created_at: new Date(),
    done: false
  }
  user.todos.push(todosItems)
  return response.status(201).json(todosItems)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  user.todos.title = title
  user.todos.deadline = deadline
  return response.status(200).json(user.todos)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { done } = request.body
  const { user } = request
  user.todos.done = done
  return response.status(200).json(user.todos)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {  
  const { user } = request
  users.splice(users.todos.indexOf(user.todos), 1)
  return response.status(200).json(user.todos)
})

module.exports = app