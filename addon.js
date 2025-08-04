// ==UserScript==
// @name         GeoFS Chat Addon
// @namespace
// @version      0.1.0
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
                typeof window.ui === "object" &&
                typeof window.ui.chat === "object" &&
                typeof window.ui.chat.publish === "function"
            ) {
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
            } else {
                requestAnimationFrame(check);
            }
        }
        check();
    }

    function injectHostilePilotIcon() {
        function check() {
            if (
                typeof geofs === "object" &&
                typeof geofs.map === "object" &&
                typeof geofs.map.icons === "object"
            ) {
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
                        url: "https://raw.githubusercontent.com/iL0g1c/Osprey-MRP-Addon/refs/heads/hostiles/hostile.png",
                        size: [30, 30],
                        anchor: [15, 15],
                        className: "geofs-map-icon"
                    }
                }
            } else {
                requestAnimationFrame(check);
            }
        }
        check();
    }

    function injectGeofsApiMapMarker() {
        function check() {
            console.log("test");
            if (
                typeof geofs.api?.map?.marker === "function" &&
                typeof geofs.map?.icons === "object"
            ) {
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

            } else {
                requestAnimationFrame(check);
            }
        }
        check();
    }

    function init() {
        // Inject acid listing into chat. (ui.chat.publish())
        const script = document.createElement('script');
        script.textContent = `(${overrideChatPublish.toString()})();`;
        document.body.appendChild(script);

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

        // UTP player markers
        injectHostilePilotIcon();
        injectGeofsApiMapMarker();
    }
    init();
})();