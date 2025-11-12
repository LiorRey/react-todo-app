import { addActivity } from "./user.actions.js"
import { store } from "../store.js"
import {
  ADD_TODO,
  REMOVE_TODO,
  SET_TODOS,
  SET_IS_LOADING,
  UNDO_TODOS,
  UPDATE_TODO,
  SET_FILTER_BY,
} from "../reducers/todo.reducer.js"
import { todoService } from "../../services/todo.service.js"

export function loadTodos() {
  const filterBy = store.getState().todoModule.filterBy
  store.dispatch({ type: SET_IS_LOADING, isLoading: true })

  return todoService
    .query(filterBy)
    .then(todos => {
      store.dispatch({ type: SET_TODOS, todos })
    })
    .catch(err => {
      console.log("Todo action -> Cannot load todos", err)
      throw err
    })
    .finally(() => {
      store.dispatch({ type: SET_IS_LOADING, isLoading: false })
    })
}

export function saveTodo(todo) {
  const type = todo._id ? UPDATE_TODO : ADD_TODO

  return todoService
    .save(todo)
    .then(savedTodo => {
      store.dispatch({ type, todo: savedTodo })

      return savedTodo
    })
    .then(res => {
      const actionName = todo._id ? "Updated" : "Added"

      return addActivity(
        `${actionName} a Todo` +
          (!todo.txt.trim() ? " with no description" : `: ${todo.txt}`)
      ).then(() => res)
    })
    .catch(err => {
      console.log("Todo action -> Cannot save todo", err)
      throw err
    })
}

export function removeTodo(todoId) {
  return todoService
    .remove(todoId)
    .then(() => {
      store.dispatch({ type: REMOVE_TODO, todoId })
    })
    .then(() => addActivity("Removed the Todo: " + todoId))
    .catch(err => {
      console.log("Todo action -> Cannot remove todo", err)
      throw err
    })
}

export function setFilter(filterBy) {
  const cmd = {
    type: SET_FILTER_BY,
    filterBy,
  }
  store.dispatch(cmd)
}

export function removeTodoOptimistic(todoId) {
  store.dispatch({ type: REMOVE_TODO, todoId })

  return todoService
    .remove(todoId)
    .then(() => addActivity("Removed the Todo: " + todoId))
    .catch(err => {
      store.dispatch({ type: UNDO_TODOS })
      console.log("Todo action -> Cannot remove todo", err)
      throw err
    })
}
