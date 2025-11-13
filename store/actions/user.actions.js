import { userService } from "../../services/user.service.js"
import {
  SET_USER,
  SET_USER_BALANCE,
  // SET_USER_FULLNAME,
  // SET_USER_PREFS,
} from "../reducers/user.reducer.js"
import { store } from "../store.js"

export function login(credentials) {
  return userService
    .login(credentials)
    .then(user => {
      store.dispatch({ type: SET_USER, user })
    })
    .then(() => addActivity("Logged in. Good to see you again!"))
    .catch(err => {
      console.log("User action -> Cannot login:", err)
      throw err
    })
}

export function signup(credentials) {
  return userService
    .signup(credentials)
    .then(user => {
      store.dispatch({ type: SET_USER, user })
    })
    .then(() => addActivity("Signed up. Welcome!"))
    .catch(err => {
      console.log("User action -> Cannot signup:", err)
      throw err
    })
}

export function logout(credentials) {
  return userService
    .logout()
    .then(() => {
      store.dispatch({ type: SET_USER, user: null })
    })
    .catch(err => {
      console.log("User action -> Cannot logout:", err)
      throw err
    })
}

export function updateBalance(addToBalance) {
  return userService
    .updateBalance(addToBalance)
    .then(updatedBalance => {
      store.dispatch({ type: SET_USER_BALANCE, balance: updatedBalance })
    })
    .catch(err => {
      console.log("User action -> Cannot update balance:", err)
      throw err
    })
}

// export function updateFullname(newFullname) {
//   return userService
//     .updateFullname(newFullname)
//     .then(updatedFullname => {
//       store.dispatch({ type: SET_USER_FULLNAME, fullname: updatedFullname })
//     })
//     .catch(err => {
//       console.log("User action -> Cannot update fullname:", err)
//       throw err
//     })
// }

// export function updatePrefs(newPrefs) {
//   return userService
//     .updatePrefs(newPrefs)
//     .then(updatedPrefs => {
//       store.dispatch({ type: SET_USER_PREFS, prefs: updatedPrefs })
//     })
//     .catch(err => {
//       console.log("User action -> Cannot update prefs:", err)
//       throw err
//     })
// }

export function updateUserDetails(userDetailsToUpdate) {
  return userService
    .updateUserDetails(userDetailsToUpdate)
    .then(updatedUser => {
      store.dispatch({ type: SET_USER, user: updatedUser })
    })
    .then(() => addActivity("Updated his/her details"))
    .catch(err => {
      console.log("User action -> Cannot update user details:", err)
      throw err
    })
}

export function addActivity(activityDescription) {
  return userService
    .addActivity(activityDescription)
    .then(updatedUser => {
      store.dispatch({ type: SET_USER, user: updatedUser })
    })
    .catch(err => {
      console.log("User action -> Cannot add activity:", err)
      throw err
    })
}
