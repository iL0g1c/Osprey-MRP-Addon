// ==UserScript==
// @name         GeoFS Chat Addon
// @namespace
// @version      0.2.0
// @description  General Addon for GeoFS chat
// @author       Osprey
// @license
// @match        https://www.geo-fs.com/geofs.php?v=3.9
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Define the code you want to inject in a normal JS function
    function overrideChatPublish() {
        function check() {
            if (
                typeof window.ui !== "object" ||
                typeof window.ui.chat !== "object" ||
                typeof window.ui.chat.publish !== "function"
            ) {
                return requestAnimationFrame(check);
            }

            ui.chat.publish = function(e) {
                if (geofs.preferences.chat) {
                    var t = decodeURIComponent(e.msg);
                    ui.chat.$container = ui.chat.$container || $(".geofs-chat-messages");
                    var a = "";
                    e.acid == geofs.userRecord.id && (a = "myself");

                    ui.chat.$container.prepend(
                        '<div class="geofs-chat-message ' + e.rs + '">' +
                        '<b class="label ' + a + '" data-player="' + e.uid + '" acid="' + e.acid + '" callsign="' + e.cs + '">' +
                        e.cs + ' [' + e.acid + ']:' +
                        '</b> ' + t + '</div>'
                    );

                    ui.chat.$container.find(".geofs-chat-message").each((e, t) => {
                        $(t).css("opacity", (ui.chat.maxNumberMessages - e) / ui.chat.maxNumberMessages)
                    }).eq(ui.chat.maxNumberMessages).remove();
                }
            };
        }
        check();
    }

    function injectHostilePilotIcon() {
        function check() {
            if (
                typeof geofs.map !== "object" ||
                typeof geofs.map.icons !== "object"
            ) {
                return requestAnimationFrame(check);
            }

            geofs.map.icons = {
                ILS: {
                    url: "images/map/icons/ils.png?v=1",
                    size: [30, 30],
                    anchor: [0, 0],
                    offset: [0, 15],
                    minZoom: 8
                },
                DME: {
                    url: "images/map/icons/dme.png",
                    size: [20, 20],
                    anchor: [10, 10],
                    minZoom: 5
                },
                NDB: {
                    url: "images/map/icons/ndb.png",
                    size: [40, 40],
                    anchor: [20, 20],
                    minZoom: 7
                },
                "NDB-DME": {
                    url: "images/map/icons/ndb-dme.png",
                    size: [40, 40],
                    anchor: [20, 20],
                    minZoom: 7
                },
                TACAN: {
                    url: "images/map/icons/tacan.png",
                    size: [20, 20],
                    anchor: [10, 10],
                    minZoom: 6
                },
                VOR: {
                    url: "images/map/icons/vor.png",
                    size: [20, 20],
                    anchor: [10, 10],
                    minZoom: 6
                },
                "VOR-DME": {
                    url: "images/map/icons/vor-dme.png",
                    size: [20, 20],
                    anchor: [10, 10],
                    minZoom: 6
                },
                VORTAC: {
                    url: "images/map/icons/vortac.png",
                    size: [20, 20],
                    anchor: [10, 10],
                    minZoom: 6
                },
                FIX: {
                    url: "images/map/icons/fixflyby.png",
                    size: [30, 30],
                    anchor: [15, 15],
                    minZoom: 1
                },
                WPT: {
                    url: "images/map/icons/wptflyby.png",
                    size: [40, 40],
                    anchor: [20, 20],
                    minZoom: 1
                },
                yellow: {
                    url: geofs.localUrl + "images/map/icons/yellow.png",
                    size: [40, 40],
                    anchor: [20, 20],
                    className: "geofs-myself-icon"
                },
                blue: {
                    url: geofs.localUrl + "images/map/icons/blue.png",
                    size: [30, 30],
                    anchor: [15, 15],
                    className: "geofs-map-icon"
                },
                traffic: {
                    url: geofs.localUrl + "images/map/icons/blue.png",
                    size: [20, 20],
                    anchor: [10, 10],
                    className: "geofs-traffic-icon"
                },
                hostile: {
                    url: "https://raw.githubusercontent.com/iL0g1c/Osprey-MRP-Addon/refs/heads/main/assets/hostile.png",
                    size: [30, 30],
                    anchor: [15, 15],
                    className: "geofs-map-icon"
                },
                friendly: {
                    url: "https://raw.githubusercontent.com/iL0g1c/Osprey-MRP-Addon/refs/heads/main/assets/friendly.png",
                    size: [30, 30],
                    anchor: [15, 15],
                    className: "geofs-map-icon"
                }
            }
        }
        check();
    }

    function injectGeofsApiMapMarker() {
        function check() {
            if (
                typeof geofs.api?.map?.marker !== "function" ||
                typeof geofs.map?.icons !== "object"
            ) {
                return requestAnimationFrame(check);
            }

            const _origUpdate = geofs.api.map.marker.prototype.update;

            geofs.api.map.marker.prototype.update = function(lat, lon, rotation, label) {
                // if the callsign contains "[U]", use the hostile icon
                if (typeof label === "string" && label.includes("[U]")) {
                    this._marker.setIcon(
                        geofs.api.map.getIcon("hostile", geofs.map.icons.hostile)
                    );
                }
                // otherwise it stays with whatever icon it already had
                return _origUpdate.call(this, lat, lon, rotation, label);
            };
        }
        check();
    }

    function pageInjectOMAConfigPanel() {
        function check() {
            const geofsUILeft = document.querySelector(".geofs-ui-left");
            const geofsUIBottom = document.querySelector(".geofs-ui-bottom");
            const ch = window.componentHandler;
            if (
                !geofsUILeft ||
                !geofsUIBottom ||
                !ch ||
                typeof ch.upgradeElement !== "function"
            ) {
                return requestAnimationFrame(check)
            }

            const btnUrl = "https://raw.githubusercontent.com/iL0g1c/Osprey-MRP-Addon/configurable-colors/config-panel/config-panel-button.html";
            const panelUrl = "https://raw.githubusercontent.com/iL0g1c/Osprey-MRP-Addon/configurable-colors/config-panel/config-panel.html";
            
            Promise.all([
                fetch(btnUrl).then(r => {
                    if (!r.ok) throw new Error(`Config Panel Button failed: ${r.status}`);
                    return r.text();
                }),
                fetch(panelUrl).then(r => {
                    if (!r.ok) throw new Error(`Config Panel failed: ${r.status}`);
                    return r.text();
                })
            ])
                .then(([btnHtml, panelHtml]) => {
                    // 1) parse & append button into bottom bar
                    const btnWrapper = document.createElement("div");
                    btnWrapper.innerHTML = btnHtml.trim();
                    const btnEl = btnWrapper.firstElementChild;
                    geofsUIBottom.appendChild(btnEl);

                    // 2) parse & append panel into left sidebar
                    const panelWrapper = document.createElement("div");
                    panelWrapper.innerHTML = panelHtml.trim();
                    const panelEl = panelWrapper.firstElementChild;
                    geofsUILeft.appendChild(panelEl);

                    // 3) theme them with MDL
                    try {
                        if (window.componentHandler?.upgradeElement) {
                            componentHandler.upgradeElement(btnEl);
                            componentHandler.upgradeElement(panelEl);
                        }
                    } catch (e) {
                        console.warn("MDL upgradeElement failed:", e);
                    }

                    geofs.preferences.threat = geofs.preferences.threat || {};

                    window.updateThreatMode = function() {
                        const adv = !!geofs.preferences.threat.advanced;
                        document.getElementById('threat-basic').style.display     = adv ? 'none' : '';
                        document.getElementById('threat-advanced').style.display = adv ? ''   : 'none';
                    };
                    updateThreatMode();
                })
                .catch((err) =>
                    console.error("OMA Config Panel failed to load:", err)
                );
            
        }
        check();
    }

    function init() {
        // Inject code that will not function sandbox-side.
        [ overrideChatPublish, pageInjectOMAConfigPanel ].forEach(fn => {
            const s = document.createElement('script');
            s.textContent = `(${fn.toString()})();`;
            document.body.appendChild(s);
        });

        // --- Begin Zeta's Contribution ---
        // The following section of code was originally written by Zeta.
        // Credit: Zeta
        // Description: This ccode was written to re-enable the "t" keybind to open chat after Xavier removed it.
        // Modified by: Osprey for integration into addon.
        window.addEventListener("keyup", function(e) {
            // Only trigger when no input field is focused
            if (document.activeElement.tagName.toLowerCase() !== "input" &&
                document.activeElement.tagName.toLowerCase() !== "textarea") {

                // T key (keyCode 84)
                if (e.keyCode === 84) {
                    e.stopPropagation();
                    ui.chat.showInput();
                }
            }
        });
        // --- End Zeta's Contribution ---

        // --- Hostility Denoters ---
        injectHostilePilotIcon(); // Adds colored plane marker asset references.
        injectGeofsApiMapMarker(); // allows the change of a plane marker color during regular map updates.
    }
    init();
})();