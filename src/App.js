import React, { useEffect, useState } from 'react'
import './App.css'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { AmplifySignOut} from "@aws-amplify/ui-react";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [inEditBox, setInEditBox] = useState(true)
  const [formEdit, setFormEdit] = useState([])


  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }
  function setUpdateInput(key, value) {
    setFormEdit({ ...formEdit, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, { input: todo }))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function removeTodo(todoId) {
    try {
      const allTodo = [...todos]
      const todoList = allTodo.filter(todo => todo.id != todoId)
      setTodos(todoList)
      setFormState(initialState)

      await API.graphql(graphqlOperation(deleteTodo, { input: { id: todoId } }));

    } catch (err) {

      console.log('error creating todo:', err)
    }

  }

  async function onEdit(todoId) {

    console.log(formEdit)
    try {
      const allTodo = [...todos]
      const objIndex = allTodo.findIndex(todo => todo.id == todoId)
      allTodo[objIndex].name = formEdit.name
      allTodo[objIndex].description = formEdit.description
      setTodos(allTodo)

      await API.graphql(graphqlOperation(updateTodo, { input: { id: todoId, name: formEdit.name, description: formEdit.description } }));
      console.log("changed")
      setInEditBox(true)
      setFormState(initialState)
    } catch (err) {

      console.log(err)
    }

  }

  function setEdit(todoId) {
    window.scrollTo(0, 0);
    setInEditBox(false)
    console.log(todoId)
    const allTodo = [...todos]
    const todoList = allTodo.filter(todo => todo.id == todoId)
    setFormEdit(...todoList)
  }




  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2> 
      <AmplifySignOut button-text="SignOut"></AmplifySignOut>
      {inEditBox ? <div>  <input
        onChange={event => setInput('name', event.target.value)}
        
        value={formState.name}
        placeholder="Name"
        className="form-field"
      />
        <input
          onChange={event => setInput('description', event.target.value)}
          className="form-field"
          value={formState.description}
          placeholder="Description"
        />
        <button className="button primary new " onClick={addTodo}>Create Todo</button>
      </div> :
        <div>
          <input
            onChange={event => setUpdateInput('name', event.target.value)}
            className="form-field"
            value={formEdit.name}

          />
          <input
            onChange={event => setUpdateInput('description', event.target.value)}
            className="form-field"
            value={formEdit.description}
            placeholder="Description"
          />
          <button className="button primary save " onClick={() => { onEdit(formEdit.id) }}>Save Edit</button>         <button className="button primary cancel" onClick={() => { setInEditBox(true) ;setFormState(initialState) }}>Cancel</button>
        </div>
      }
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>


            <span className="button primary delete" onClick={() => { removeTodo(todo.id) }}> Delete</span>
            <span className="button primary edit" onClick={() => { setEdit(todo.id) }}> Edit</span>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: { marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: "1rem" },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px', display: "block", width: 300, margin: "16px 0" },
  deleteBtn:{backgroundColor: "#4CAF50",color: "white",padding: "14px 20px",margin:" 8px",border: "none", cursor: "pointer",Width: 300,opacity: "0.9",borderRadius:"2rem"}
}

export default withAuthenticator(App)