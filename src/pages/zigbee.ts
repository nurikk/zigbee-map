import { callApi, addEvent } from "../utils";
const baseUrl = '/zigbee';

const onRenameClick = function () {
    const { ieeeaddr, name } = this.dataset;
    const result = prompt('Enter new name', name);
    if (result != null) {
        const payload = {
            rename: ieeeaddr,
            new: result
        };
        callApi(baseUrl, payload, 'POST').then(()=> {
            window.location.reload();
        });
    }
};

const init = () => {
    addEvent(document, 'click', '[data-role="rename"]', onRenameClick);
};
document.addEventListener('DOMContentLoaded', init, false);