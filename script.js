// chrome.runtime.connect({ name: "popup" });

const textarea = document.getElementById("tip");
const siteList = document.getElementById("siteList");
var selectedTipHost;

function clear(name) {
    chrome.storage.local.clear(function() {});
}

function serialize(options) {
    var optionsStr = "";
    for (var i = 0; i < options.length; i++) {
        optionsStr += options.item(i).innerText + " ";
    }
    return optionsStr;
}

function deserialize(optionsStr) {
    var array = (""+optionsStr).split(" ");
    for (var i = 0; i < array.length - 1; i++) {
        siteList.add(new Option(array[i]));
    }
}

function loadSiteList() {
    chrome.tabs.getSelected(null, function(tab) {
        let url = new URL(tab.url);
        chrome.storage.local.get(['siteList'], function(result) {
            let res = result["siteList"];
            if (res != undefined) {
                deserialize(res);
            }
            var contains = false;
            for (var i = 0; i < siteList.length; i++) {
                if (siteList.item(i).innerText == url.host) {
                    siteList.item(i).selected = true;
                    contains = true;
                    break;
                }
            }
            if (!contains) {
                siteList.add(new Option(url.host, null, false, true));
                chrome.storage.local.set({'siteList': serialize(siteList.options)}, function() {});
            }
            siteList.addEventListener("change", function() {
                selectedTipHost = siteList.selectedOptions[0].innerText;
                refreshTextArea();
            });
        });
    });
}

function refreshTextArea() {
    chrome.storage.local.get([selectedTipHost], function(result) {
        let res = result[selectedTipHost];
        if (res != undefined) {
            textarea.value = res;
        }
    });
}

function loadTextArea() {
    chrome.tabs.getSelected(null, function(tab) {
        let host = new URL(tab.url).host;
        selectedTipHost = host;
        refreshTextArea();
    
        textarea.addEventListener("change", function() {
            chrome.storage.local.set({[selectedTipHost]: textarea.value}, function() {});
        });
    });

}

window.onload = function() {
    loadSiteList();
    loadTextArea();
}

