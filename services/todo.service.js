import { utilService } from "./util.service.js"
import { storageService } from "./async-storage.service.js"
import { userService } from "./user.service.js"

const TODO_KEY = "todoDB"
const PAGE_SIZE = 3
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

    const filteredTodosLength = todos.length
    if (filterBy.pageIdx !== undefined) {
      const startIdx = filterBy.pageIdx * PAGE_SIZE
      todos = todos.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return _includeDataFromServer({ todos, filteredTodosLength })
  })
}

function get(todoId) {
  return storageService
    .get(TODO_KEY, todoId)
    .then(todo => _setNextPrevTodoId(todo))
    .catch(err => {
      console.error("Cannot get todo:", err)
      throw err
    })
}

function remove(todoId) {
  return storageService
    .remove(TODO_KEY, todoId)
    .then(() => _includeDataFromServer())
    .catch(err => {
      console.error("Cannot remove todo:", err)
      throw err
    })
}

function save(todo) {
  if (!userService.getLoggedinUser())
    return Promise.reject("User is not logged in")

  return (todo._id ? _edit(todo) : _add(todo)).then(savedTodo =>
    _includeDataFromServer({ savedTodo })
  )
}

function _add(todo) {
  // Create a shallow copy so that storageService.post()
  // can safely add _id without mutating the original todo object :
  todo = { ...todo }

  todo.createdAt = todo.updatedAt = Date.now()

  return storageService.post(TODO_KEY, todo).catch(err => {
    console.error("Cannot add todo:", err)
    throw err
  })
}

function _edit(todo) {
  todo.updatedAt = Date.now()
  return storageService.put(TODO_KEY, todo).catch(err => {
    console.error("Cannot update todo:", err)
    throw err
  })
}

function getEmptyTodo(txt = "", importance = 5) {
  return { txt, importance, isDone: false, color: "#ffffff" }
}

function getDefaultFilter() {
  return { txt: "", importance: 0, showOption: "all", sort: "", pageIdx: 0 }
}

function getFilterFromSearchParams() {
  const searchParams = utilService.getQueryParams()
  const filterBy = {
    txt: searchParams["txt"] || "",
    importance: +searchParams["importance"] || 0,
    showOption: searchParams["showOption"] || "all",
    sort: searchParams["sort"] || "",
    pageIdx: +searchParams["pageIdx"] || 0,
  }
  return filterBy
}

//* Demo function thats mimic the extra pagination data from the server
function _includeDataFromServer(data = {}) {
  const filteredTodosLength = data.filteredTodosLength

  return Promise.all([
    _getMaxPage(filteredTodosLength),
    _getDoneTodosPercent(),
  ]).then(([maxPage, doneTodosPercent]) => {
    return { maxPage, doneTodosPercent, ...data }
  })
}

//* Demo function thats mimic the extra pagination data from the server
function _getMaxPage(filteredTodosLength) {
  if (filteredTodosLength)
    return Promise.resolve(Math.ceil(filteredTodosLength / PAGE_SIZE))

  return storageService
    .query(TODO_KEY)
    .then(todos => Math.ceil(todos.length / PAGE_SIZE))
    .catch(err => {
      console.error("Cannot get max page:", err)
      throw err
    })
}

//* Demo function thats mimic the total todos and percent in header and footer
function _getDoneTodosPercent() {
  return storageService
    .query(TODO_KEY)
    .then(todos => {
      const doneTodosCount = todos.reduce((acc, todo) => {
        if (todo.isDone) acc++
        return acc
      }, 0)
      return (doneTodosCount / todos.length) * 100 || 0
    })
    .catch(err => {
      console.error("Cannot get done todos percent:", err)
      throw err
    })
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
