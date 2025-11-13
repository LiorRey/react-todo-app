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
  SET_MAX_PAGE,
  SET_DONE_TODOS_PERCENT,
} from "../reducers/todo.reducer.js"
import { todoService } from "../../services/todo.service.js"

export function loadTodos() {
  const filterBy = store.getState().todoModule.filterBy
  store.dispatch({ type: SET_IS_LOADING, isLoading: true })

  return todoService
    .query(filterBy)
    .then(({ todos, maxPage, doneTodosPercent }) => {
      store.dispatch({ type: SET_TODOS, todos })
      _setTodosData(maxPage, doneTodosPercent)

      return todos
    })
    .catch(err => {
      console.log("Todo action -> Cannot load todos:", err)
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
    .then(({ savedTodo, maxPage, doneTodosPercent }) => {
      store.dispatch({ type, todo: savedTodo })
      _setTodosData(maxPage, doneTodosPercent)

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
      console.log("Todo action -> Cannot save todo:", err)
      throw err
    })
}

export function removeTodo(todoId) {
  return todoService
    .remove(todoId)
    .then(({ maxPage, doneTodosPercent }) => {
      store.dispatch({ type: REMOVE_TODO, todoId })
      _setTodosData(maxPage, doneTodosPercent)
    })
    .then(() => addActivity("Removed the Todo: " + todoId))
    .catch(err => {
      console.log("Todo action -> Cannot remove todo:", err)
      throw err
    })
}

export function setFilterSort(filterBy) {
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
    .then(({ maxPage, doneTodosPercent }) => {
      _setTodosData(maxPage, doneTodosPercent)
    })
    .then(() => addActivity("Removed the Todo: " + todoId))
    .catch(err => {
      store.dispatch({ type: UNDO_TODOS })
      console.log("Todo action -> Cannot remove todo:", err)
      throw err
    })
}

function _setTodosData(maxPage, doneTodosPercent) {
  store.dispatch({
    type: SET_MAX_PAGE,
    maxPage,
  })

  store.dispatch({
    type: SET_DONE_TODOS_PERCENT,
    doneTodosPercent,
  })
}
