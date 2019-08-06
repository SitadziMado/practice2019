function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function cond(cases, applied) {
    for (var key in cases) {
        if (cases.hasOwnProperty(key) && key === applied) {
            var value = cases[key];

            if (isFunction(value)) {
                return value.call(this);
            } else {
                return value;
            }
        }
    }
}

function loadScript(url) {
    let script = document.createElement('script');
    script.async = false;
    script.src = url;
    console.log(script)
    return script;
}

function success(data) {
    console.log(data)
}

function callAjax(url, callback){
    var xmlhttp;
    
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}