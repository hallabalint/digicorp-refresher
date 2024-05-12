p = document.createElement("div");
p.innerHTML = '<label for="interval">Refresh interval (s)</label><input type="number" id="interval" value="60"><label for="scroll">Auto scroll</label><input type="checkbox" id="scroll"><input type="button" value="Refresh" onClick="refresh();">';
p.style = 'position: -webkit-sticky;position: sticky;top: 0; border: 1px solid black; z-index:999;background-color: white;';
document.body.insertBefore(p, document.body.firstChild);

function refresh() {
    const races = document.getElementsByClassName("linked");
    Array.prototype.forEach.call(races, function (element) {
        if (element.getAttribute("closed") != 'true') {
            let id = element.childNodes[1].childNodes[1].innerText;
            let request = new XMLHttpRequest();
            let server = window.location.hostname;
            request.open('GET', 'https://' + server + '/broadcast/competition/1/futamstatusz/' + id, true);
            request.onload = function () {
                let data = request.responseText;
                console.log(data);
                data = data.replace(/(\r\n|\n|\r)/gm, "");
                data = data.split(',');
                if (data[1] == 'official') {
                    element.setAttribute("closed", "true");
                    element.classList.add("closed");
                    element.style.backgroundColor = "#99ffcc";
                }
                if (data[1] == 'unofficial') {
                    element.style.backgroundColor = "#99ccff";
                }
                if (document.getElementById("scroll").checked) {
                    let closed = document.getElementsByClassName("closed");
                    closed[closed.length - 1].scrollIntoView({ block: "center" });
                }
            }
            request.send();
        }
    });

}
let updater = setInterval(refresh, 60000);
document.getElementById("interval").onchange = function () {
    clearInterval(updater);
    updater = setInterval(refresh, this.value * 1000);
}
refresh();
