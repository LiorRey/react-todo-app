const { Link, NavLink } = ReactRouterDOM
const { useSelector } = ReactRedux

import { UserMsg } from "./UserMsg.jsx"
import { LoginSignup } from "./LoginSignup.jsx"
import { TodoDoneProgress } from "./TodoDoneProgress.jsx"
import { logout } from "../store/actions/user.actions.js"
import { showErrorMsg } from "../services/event-bus.service.js"

export function AppHeader() {
  const loggedInUser = useSelector(
    storeState => storeState.userModule.loggedInUser
  )

  function onLogout() {
    logout().catch(err => showErrorMsg("Error occurred during logout"))
  }

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
    <header
      className="app-header full main-layout"
      style={getDefaultOrUserStyle()}
    >
      <section className="header-container">
        <h1>React Todo App - By LiorRey</h1>
        {loggedInUser ? (
          <section>
            <Link to={`/user/${loggedInUser._id}`}>
              Hello <b>{loggedInUser.fullname}</b>
            </Link>
            <button onClick={onLogout}>Logout</button>
            <div>
              <label>Your balance is: {loggedInUser.balance}</label>
            </div>
          </section>
        ) : (
          <section>
            <LoginSignup />
          </section>
        )}

        {loggedInUser ? <TodoDoneProgress /> : ""}

        <nav className="app-nav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/todo">Todos</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </section>
      <UserMsg />
    </header>
  )
}
