var callApi = function (url, params, method) {
    if (method === void 0) { method = 'GET'; }
    var formData = new FormData();
    Object.entries(params).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        formData.append(key, value);
    });
    return fetch(url, {
        body: formData,
        method: method
    });
};
var addEvent = function (parent, evt, selector, handler) {
    parent.addEventListener(evt, function (event) {
        var _a, _b;
        if ((_b = (_a = event) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.matches(selector + ', ' + selector + ' *')) {
            handler.apply(event.target.closest(selector), arguments);
        }
    }, false);
};

var baseUrl = '/zigbee';
var onRenameClick = function () {
    var _a = this.dataset, ieeeaddr = _a.ieeeaddr, name = _a.name;
    var result = prompt('Enter new name(new)', name);
    if (result != null) {
        var payload = {
            rename: ieeeaddr,
            "new": result
        };
        callApi(baseUrl, payload, 'POST');
    }
};
var init = function () {
    console.log('zigbee init');
    addEvent(document, 'click', '[data-role="rename"]', onRenameClick);
};
init();
// document.addEventListener('DOMContentLoaded', init, false);
