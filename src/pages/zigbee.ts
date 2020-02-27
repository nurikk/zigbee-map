import { addEvent, callApi } from "../utils";

const baseUrl = '/zigbee';

const onRenameClick = function () {
    const { ieeeaddr, name } = this.dataset;
    const result = prompt('Enter new name(new)', name);
    if (result != null) {
        const payload = {
            rename: ieeeaddr,
            new: result
        };
        callApi(baseUrl, payload, 'POST');
    }
};

const init = () => {
    console.log('zigbee init');
    addEvent(document, 'click', '[data-role="rename"]', onRenameClick);
};
init();
// document.addEventListener('DOMContentLoaded', init, false);