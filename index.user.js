// ==UserScript==
// @name         Digicorp Refresher
// @namespace    http://hbj.hu/
// @version      3.6
// @description  Auto refresh and scroll for digicorp results page
// @downloadURL  https://github.com/hallabalint/digicorp-refresher/releases/latest/download/index.user.js
// @updateURL    https://github.com/hallabalint/digicorp-refresher/releases/latest/download/index.user.js
// @author       github.com/hallabalint
// @match        https://results.szeged2024.com/results/*
// @match        https://results.szeged2025.com/results/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let p = document.createElement("div");
    p.innerHTML = '<label for="interval">Refresh interval (s)</label><input type="number" id="interval" value="60"><label for="scroll">Auto scroll</label><input type="checkbox" id="scroll"><label for="scroll">Last race intensive update</label><input type="checkbox" id="force"><input type="button" value="Refresh" onClick="refresh();">';
    p.style = 'position: -webkit-sticky;position: sticky;top: 0; border: 1px solid black; z-index:999;background-color: white;';
    document.body.insertBefore(p, document.body.firstChild);
    loadConfig();

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
                        element.classList.add("colored");
                        element.style.backgroundColor = "#99ffcc";
                    }
                    if (data[1] == 'unofficial') {
                        element.classList.add("colored");
                        element.style.backgroundColor = "#99ccff";
                    }
                    if (document.getElementById("scroll").checked) {
                        let colored = document.getElementsByClassName("colored");
                        try {
                            colored[colored.length - 1].scrollIntoView({ block: "center" });
                        } catch {
                            console.log("Error scrolling");
                        }

                    }
                }
                request.send();
            }
        });

    }
    let updater = setInterval(refresh, document.getElementById("interval").value * 1000);
    document.getElementById("interval").onchange = function () {
        clearInterval(updater);
        updater = setInterval(refresh, this.value * 1000);
        saveConfig();
    }

    refresh();

    document.getElementById("scroll").addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            let colored = document.getElementsByClassName("colored");
            colored[colored.length - 1].scrollIntoView({ block: "center" });
        }
        saveConfig();
    }
    );

    document.getElementById("force").addEventListener('change', (event) => {
        saveConfig();
    }
    );

    function saveConfig() {
        console.log("Saving config");
        let config = {
            interval: document.getElementById("interval").value,
            scroll: document.getElementById("scroll").checked,
            force: document.getElementById("force").checked
        };
        localStorage.setItem('UpdaterConfig', JSON.stringify(config));

    }
    function loadConfig() {
        console.log("Loading config");
        let config = localStorage.getItem('UpdaterConfig');
        if (config != null) {
            console.log("Config found");
            config = JSON.parse(config);
            console.log(config);
            document.getElementById("interval").value = config.interval;
            document.getElementById("scroll").checked = config.scroll;
            document.getElementById("force").checked = config.force;
        }
    }

    function lastRace() {
        if (document.getElementById("force").checked) {
            let races = Array.from(document.getElementsByClassName("linked"));
            let lastClosedIndex = -1;

            for (let i = 0; i < races.length; i++) {
                if (races[i].getAttribute("closed") === "true") {
                    lastClosedIndex = i;
                }
            }
            if (lastClosedIndex >= 0 && lastClosedIndex < races.length - 1) {
                let nextRace = races[lastClosedIndex + 1];
                let date = nextRace.childNodes[3].childNodes[1].innerText;
                var now = new Date();
                const [inputHours, inputMinutes] = date.split(":");
                let raceDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    inputHours,
                    inputMinutes,
                    0
                );
                if (nextRace && raceDate < now) {
                    // Do something with nextRace — for example, refresh its data
                    let id = nextRace.childNodes[1].childNodes[1].innerText;
                    let request = new XMLHttpRequest();
                    let server = window.location.hostname;
                    request.open('GET', 'https://' + server + '/broadcast/competition/1/futamstatusz/' + id, true);
                    request.onload = function () {
                        let data = request.responseText;
                        console.log("Force update for next race:", data);
                        data = data.replace(/(\r\n|\n|\r)/gm, "");
                        data = data.split(',');
                        if (data[1] == 'official') {
                            nextRace.setAttribute("closed", "true");
                            nextRace.classList.add("closed");
                            nextRace.classList.add("colored");
                            nextRace.style.backgroundColor = "#99ffcc";
                        }
                        if (data[1] == 'unofficial') {
                            nextRace.classList.add("colored");
                            nextRace.style.backgroundColor = "#99ccff";
                        }
                    };
                    request.send();
                }
            }
        }
    }

    setInterval(lastRace, 1000);

})();
