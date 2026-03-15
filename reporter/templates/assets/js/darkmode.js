var darkMode = "darkmode";

function applyDarkMode() {
  applyFontStyle();
  document
    .querySelector("html")
    .setAttribute("data-bs-theme", isDarkModeOn() ? "dark" : "light");
  document.getElementById("features-table").classList.toggle("table-striped");
}

function saveState() {
  if (isDarkModeOn()) {
    window.localStorage["darkmode"] = "on";
  } else {
    window.localStorage["darkmode"] = "off";
  }
}

function applyFontStyle() {
  document.body.classList.toggle(darkMode);
}

function isDarkModeOn() {
  var toggle = document.getElementById("darkCheck");
  return toggle.checked;
}

window.onload = function () {
  if (window.localStorage["darkmode"] === "on") {
    document.body.classList.add(darkMode);
    document.querySelector("html").setAttribute("data-bs-theme", "dark");
    var toggle = document.getElementById("darkCheck");
    if (toggle) toggle.checked = true;
  } else {
    document.body.classList?.remove(darkMode);
    document.querySelector("html").setAttribute("data-bs-theme", "light");
    var toggle = document.getElementById("darkCheck");
    if (toggle) toggle.checked = false;
  }
};
