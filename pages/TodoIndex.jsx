import { utilService } from "../services/util.service.js"
import { todoService } from "../services/todo.service.js"
import {
  loadTodos,
  removeTodoOptimistic,
  saveTodo,
  setFilter,
} from "../store/actions/todo.actions.js"
import { TodoFilter } from "../cmps/TodoFilter.jsx"
import { TodoList } from "../cmps/TodoList.jsx"
import { DataTable } from "../cmps/data-table/DataTable.jsx"
import { updateBalance } from "../store/actions/user.actions.js"
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js"

const { useState, useEffect } = React
const { Link, useSearchParams } = ReactRouterDOM
const { useSelector } = ReactRedux

export function TodoIndex() {
  const todos = useSelector(storeState => storeState.todoModule.todos)
  const filterBy = useSelector(storeState => storeState.todoModule.filterBy)
  const isLoading = useSelector(storeState => storeState.todoModule.isLoading)
  const user = useSelector(storeState => storeState.userModule.loggedInUser)

  // Special hook for accessing search-params:
  const [_, setSearchParams] = useSearchParams()

  useEffect(() => {
    loadTodos().catch(() => {
      showErrorMsg("Error occurred while loading todos")
    })
    setSearchParams(utilService.getTruthyValues(filterBy))
  }, [filterBy])

  function onRemoveTodo(todoId) {
    removeTodoOptimistic(todoId)
      .then(() => showSuccessMsg("Todo removed successfully!"))
      .catch(() => showErrorMsg("Error occurred while removing todo"))
  }

  function onToggleTodo(todo) {
    const todoToSave = { ...todo, isDone: !todo.isDone }

    saveTodo(todoToSave)
      .then(savedTodo => {
        showSuccessMsg(
          `Todo is ${savedTodo.isDone ? "done!" : "back on your list"}`
        )

        updateBalance(savedTodo.isDone ? 10 : 0)
      })
      .catch(() => showErrorMsg("Error occurred while toggling todo"))
  }

  function onSetFilter(newFilterBy) {
    setFilter(newFilterBy)
  }

  if (!todos) return <div>Loading...</div>
  return (
    <section className="todo-index">
      <TodoFilter filterBy={filterBy} onSetFilterBy={onSetFilter} />
      <div>
        <Link to="/todo/edit" className="btn">
          Add Todo
        </Link>
      </div>
      <h2>Todos List</h2>
      <div className={isLoading ? "loading" : ""}>
        {!!todos.length ? (
          <TodoList
            todos={todos}
            onRemoveTodo={onRemoveTodo}
            onToggleTodo={onToggleTodo}
          />
        ) : (
          <h3>No todos to show...</h3>
        )}
      </div>
      <hr />
      <h2>Todos Table</h2>
      <div style={{ width: "60%", margin: "auto" }}>
        <DataTable todos={todos} onRemoveTodo={onRemoveTodo} />
      </div>
    </section>
  )
}
