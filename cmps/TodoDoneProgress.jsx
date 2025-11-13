const { useSelector } = ReactRedux

export function TodoDoneProgress() {
  const todos = useSelector(storeState => storeState.todoModule.todos)
  const doneTodosPercent = useSelector(
    storeState => storeState.todoModule.doneTodosPercent
  )

  function formatTodosDonePercent() {
    if (Number.isInteger(doneTodosPercent)) return doneTodosPercent

    return doneTodosPercent.toFixed(2)
  }

  const formattedPercent = todos ? formatTodosDonePercent() : null

  return (
    todos &&
    !!todos.length && (
      <section className="todos-done-progress">
        <div>
          <label htmlFor="done-progress">Todos done:</label>
          <h3>{formattedPercent}%</h3>
        </div>
        <progress
          value={formattedPercent}
          max="100"
          id="done-progress"
          name="doneProgress"
        />
      </section>
    )
  )
}
