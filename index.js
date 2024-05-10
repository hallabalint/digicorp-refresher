function refresh() {
    const races = document.getElementsByClassName("linked");
    Array.prototype.forEach.call(races, function(element) {
        if (element.getAttribute("closed") != 'true') {
            let id = element.childNodes[1].childNodes[1].innerText;
            let request = new XMLHttpRequest();
            //request https://results.szeged2024.com/broadcast/competition/1/futamstatusz/+id
            request.open('GET', 'https://results.szeged2024.com/broadcast/competition/1/futamstatusz/' + id, true);
            //get anwser as a string
            request.onload = function () {
                let data = request.responseText;
                console.log(data);
                //remove \r \n
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
                let closed = document.getElementsByClassName("closed");
                closed[closed.length-1].scrollIntoView(true);
            }
            request.send();
        }
    });
    
}
setInterval(refresh, 60000);