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
        <input
          value={txt}
          onChange={handleChange}
          type="search"
          placeholder="By Txt"
          id="txt"
          name="txt"
        />
        <label htmlFor="importance">Importance: </label>
        <input
          value={importance}
          onChange={handleChange}
          type="number"
          placeholder="By Importance"
          id="importance"
          name="importance"
        />
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

        <button hidden>Set Filter</button>
      </form>
    </section>
  )
}
