var darkMode = 'darkmode'
var elementList = ['div.x_panel', 'div.x_title','div.container-fluid', 'div.created-by']
var featureElementList = ['div.x_panel','div.x_title', 'div.main_conainer', 'div.container-fluid', 'div.created-by', 'small'];

function applyDarkMode() {
    elementList.forEach(value => {
        document.querySelectorAll(value).forEach(value => value.classList.toggle(darkMode));
    });
    document.getElementById('features-table').classList.toggle('table-striped');
    document.getElementById('darkmodeicon')?.classList.toggle('fa-toggle-on');
    applyFontStyle();
}

function saveState() {
    if(isDarkModeOn()) {
        window.localStorage['darkmode'] = 'on';
    } else {
        window.localStorage['darkmode'] = 'off';
    }
}

function applyFontStyle() {
    document.body.classList.toggle(darkMode);
}


function applyDarkModeInFeature() {
    featureElementList.forEach(value => {
        document.querySelectorAll(value).forEach(value => value.classList.toggle(darkMode));
    });
}

function isDarkModeOn() {
    var toggle = document.getElementById('darkCheck');
    return toggle.checked;
}

window.onload = function() {
    if(window.localStorage['darkmode'] === 'on') {
        applyDarkMode();
        document.getElementById('darkCheck').checked = true;
    }
}
