import { TodoDoneProgress } from "./TodoDoneProgress.jsx"

const { useSelector } = ReactRedux

export function AppFooter() {
  const loggedInUser = useSelector(
    storeState => storeState.userModule.loggedInUser
  )

  function getDefaultOrUserStyle() {
    const style = {
      color: "",
      backgroundColor: "",
    }

    if (loggedInUser && loggedInUser.prefs) {
      style.color = loggedInUser.prefs.color
      style.backgroundColor = loggedInUser.prefs.bgColor
    }

    return style
  }

  return (
    <footer className="app-footer full" style={getDefaultOrUserStyle()}>
      {loggedInUser && (
        <section className="footer-container">
          <TodoDoneProgress />
        </section>
      )}
    </footer>
  )
}
