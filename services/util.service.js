export const utilService = {
  makeId,
  makeLorem,
  getRandomIntInclusive,
  loadFromStorage,
  saveToStorage,
  animateCSS,
  getRandomColor,
  rgbToHex,
  getFormattedTime,
  getTruthyValues,
  debounce,
  getQueryParams,
}

function makeId(length = 6) {
  var txt = ""
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return txt
}

function makeLorem(size = 100) {
  const words = [
    "The sky",
    "above",
    "the port",
    "was",
    "the color",
    "of nature",
    "tuned",
    "to",
    "a live channel",
    "All",
    "this happened",
    "more or less",
    "I",
    "had",
    "the story",
    "bit by bit",
    "from various people",
    "and",
    "as generally",
    "happens",
    "in such cases",
    "each time",
    "it",
    "was",
    "a different story",
    "a pleasure",
    "to",
    "burn",
  ]
  var txt = ""
  while (size > 0) {
    size--
    txt += words[Math.floor(Math.random() * words.length)]
    if (size >= 1) txt += " "
  }
  return txt
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function loadFromStorage(key) {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : undefined
}

function animateCSS(el, animation = "bounce") {
  const prefix = "animate__"
  return new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`
    el.classList.add(`${prefix}animated`, animationName)
    function handleAnimationEnd(event) {
      event.stopPropagation()
      el.classList.remove(`${prefix}animated`, animationName)
      resolve("Animation ended")
    }

    el.addEventListener("animationend", handleAnimationEnd, { once: true })
  })
}

function getRandomColor() {
  var letters = "0123456789ABCDEF"
  var color = "#"
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function rgbToHex(rgb) {
  // Expect format: "rgb(r, g, b)"
  const [r, g, b] = rgb.match(/\d+/g).map(Number)
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")
}

function getFormattedTime(time) {
  const timeDiff = new Date(Date.now() - time)
  const timeDiffByMinutes = timeDiff.getMinutes()

  if (timeDiffByMinutes < 60) return timeDiffByMinutes + " minutes ago | "
  else if (timeDiff > 60) return "Couple of hours ago | "
  else if (timeDiff > 60 * 24) return "A day or more ago | "
}

export function getTruthyValues(obj) {
  const newObj = {}
  for (const key in obj) {
    const val = obj[key]
    if (val) {
      newObj[key] = val
    }
  }
  return newObj
}

function debounce(callback, wait) {
  let timeoutId = null
  return (...args) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      callback(...args)
    }, wait)
  }
}

function getQueryParams(url) {
  if (!url) url = window.location.href
  const params = {}

  const parts = url.split("?")
  if (parts.length < 2) return params

  const queryString = parts[1].split("#")[0]
  if (!queryString) return params

  const pairs = queryString.split("&")
  for (let i = 0; i < pairs.length; i++) {
    if (!pairs[i]) continue
    const pair = pairs[i].split("=")
    const key = decodeURIComponent(pair[0])
    const value = decodeURIComponent(pair[1] || "")
    params[key] = value
  }

  return params
}
