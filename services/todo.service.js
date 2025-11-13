import { utilService } from "./util.service.js"
import { storageService } from "./async-storage.service.js"
import { userService } from "./user.service.js"

const TODO_KEY = "todoDB"
_createTodos()

export const todoService = {
  query,
  get,
  remove,
  save,
  getEmptyTodo,
  getDefaultFilter,
  getFilterFromSearchParams,
  getImportanceStats,
}
// For Debug (easy access from console):
window.cs = todoService

function query(filterBy = {}) {
  return storageService.query(TODO_KEY).then(todos => {
    if (filterBy.txt) {
      const regExp = new RegExp(filterBy.txt, "i")
      todos = todos.filter(todo => regExp.test(todo.txt))
    }

    if (filterBy.importance) {
      todos = todos.filter(todo => todo.importance >= filterBy.importance)
    }

    const showOptionFilter = filterBy.showOption
    if (showOptionFilter) {
      if (showOptionFilter !== "all") {
        if (showOptionFilter === "active" || showOptionFilter === "done") {
          console.log(`showOptionFilter = ${showOptionFilter}`)
          todos = todos.filter(todo =>
            showOptionFilter === "active" ? !todo.isDone : todo.isDone
          )
        }
      }
    }

    if (filterBy.sort) {
      if (filterBy.sort === "txt") {
        todos = todos.sort((todo1, todo2) => todo1.txt.localeCompare(todo2.txt))
      } else if (filterBy.sort === "createdAt") {
        todos = todos.sort((todo1, todo2) => todo1.createdAt - todo2.createdAt)
      }
    }

    return todos
  })
}

function get(todoId) {
  return storageService.get(TODO_KEY, todoId).then(todo => {
    todo = _setNextPrevTodoId(todo)
    return todo
  })
}

function remove(todoId) {
  return storageService.remove(TODO_KEY, todoId)
}

function save(todo) {
  if (!userService.getLoggedinUser())
    return Promise.reject("User is not logged in")

  // if - edit , else - add
  if (todo._id) {
    // TODO - updatable fields
    todo.updatedAt = Date.now()
    return storageService.put(TODO_KEY, todo)
  } else {
    // Create a shallow copy so that storageService.post()
    // can safely add _id without mutating the original todo object :
    const newTodo = { ...todo }

    newTodo.createdAt = newTodo.updatedAt = Date.now()

    return storageService.post(TODO_KEY, newTodo)
  }
}

function getEmptyTodo(txt = "", importance = 5) {
  return { txt, importance, isDone: false, color: "#ffffff" }
}

function getDefaultFilter() {
  return { txt: "", importance: 0, showOption: "all", sort: "" }
}

function getFilterFromSearchParams() {
  const searchParams = utilService.getQueryParams()
  const filterBy = {
    txt: searchParams["txt"] || "",
    importance: +searchParams["importance"] || 0,
    showOption: searchParams["showOption"] || "all",
    sort: searchParams["sort"] || "",
  }
  return filterBy
}

function getImportanceStats() {
  return storageService.query(TODO_KEY).then(todos => {
    const todoCountByImportanceMap = _getTodoCountByImportanceMap(todos)
    const data = Object.keys(todoCountByImportanceMap).map(speedName => ({
      title: speedName,
      value: todoCountByImportanceMap[speedName],
    }))
    return data
  })
}

function _createTodos() {
  let todos = utilService.loadFromStorage(TODO_KEY)
  if (!todos || !todos.length) {
    todos = []
    const txts = ["Learn React", "Master CSS", "Practice Redux"]
    for (let i = 0; i < 20; i++) {
      const txt = txts[utilService.getRandomIntInclusive(0, txts.length - 1)]
      todos.push(
        _createTodo(txt + (i + 1), utilService.getRandomIntInclusive(1, 10))
      )
    }
    utilService.saveToStorage(TODO_KEY, todos)
  }
}

function _createTodo(txt, importance) {
  const todo = getEmptyTodo(txt, importance)
  todo._id = utilService.makeId()
  todo.createdAt = todo.updatedAt =
    Date.now() - utilService.getRandomIntInclusive(0, 1000 * 60 * 60 * 24)
  todo.color = utilService.getRandomColor()

  return todo
}

function _setNextPrevTodoId(todo) {
  return storageService.query(TODO_KEY).then(todos => {
    const todoIdx = todos.findIndex(currTodo => currTodo._id === todo._id)
    const nextTodo = todos[todoIdx + 1] ? todos[todoIdx + 1] : todos[0]
    const prevTodo = todos[todoIdx - 1]
      ? todos[todoIdx - 1]
      : todos[todos.length - 1]
    todo.nextTodoId = nextTodo._id
    todo.prevTodoId = prevTodo._id
    return todo
  })
}

function _getTodoCountByImportanceMap(todos) {
  const todoCountByImportanceMap = todos.reduce(
    (map, todo) => {
      if (todo.importance < 3) map.low++
      else if (todo.importance < 7) map.normal++
      else map.urgent++
      return map
    },
    { low: 0, normal: 0, urgent: 0 }
  )
  return todoCountByImportanceMap
}

// Data Model:
// const todo = {
//     _id: "gZ6Nvy",
//     txt: "Master Redux",
//     importance: 9,
//     isDone: false,
//     createdAt: 1711472269690,
//     updatedAt: 1711472269690,
//     color: #f3f3f3
// }
