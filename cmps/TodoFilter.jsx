import { utilService } from "../services/util.service.js"

const { useState, useEffect, useRef } = React

export function TodoFilter({ filterBy, onSetFilterBy }) {
  const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })
  const onSetFilterByDebounce = useRef(
    utilService.debounce(onSetFilterBy, 500)
  ).current

  useEffect(() => {
    // Notify parent
    onSetFilterByDebounce(filterByToEdit)
  }, [filterByToEdit])

  function handleChange({ target }) {
    const field = target.name
    let value = target.value

    switch (target.type) {
      case "number":
      case "range":
        value = +value || ""
        break

      case "checkbox":
        value = target.checked
        break

      default:
        break
    }

    setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
  }

  // Optional support for LAZY Filtering with a button
  function onSubmitFilter(ev) {
    ev.preventDefault()
    onSetFilterBy(filterByToEdit)
  }

  const { txt, importance, showOption } = filterByToEdit
  return (
    <section className="todo-filter">
      <h2>Filter Todos</h2>
      <form onSubmit={onSubmitFilter}>
        <div className="txt-container">
          <label htmlFor="txt">Text: </label>
          <input
            value={txt}
            onChange={handleChange}
            type="search"
            placeholder="By Txt"
            id="txt"
            name="txt"
          />
        </div>
        <div className="importance-container">
          <label htmlFor="importance">Importance: </label>
          <input
            value={importance}
            onChange={handleChange}
            type="number"
            placeholder="By Importance"
            id="importance"
            name="importance"
          />
        </div>
        <div className="show-option-container">
          <label htmlFor="show-option">Show: </label>
          <select
            value={showOption.toLowerCase()}
            onChange={handleChange}
            type="number"
            id="show-option"
            name="showOption"
          >
            <option key="all" value="all">
              All
            </option>
            <option key="active" value="active">
              Active
            </option>
            <option key="done" value="done">
              Done
            </option>
          </select>
        </div>

        <div className="sort-container">
          <label htmlFor="sort">Sort By: </label>
          <select
            value={filterByToEdit.sort}
            name="sort"
            onChange={handleChange}
            id="sort"
          >
            <option value="">Sort By</option>
            <option value="txt">Text</option>
            <option value="createdAt">Time</option>
          </select>
        </div>

        <button hidden>Set Filter</button>
      </form>
    </section>
  )
}
