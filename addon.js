// ==UserScript==
// @name         GeoFS Chat Addon
// @namespace
// @version      0.0.2
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
    }
    init();
})();