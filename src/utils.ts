interface KeyValuePairs {
    [k: string]: string;
}
type RequestMethod = "POST" | "GET";
export const callApi = (url: string, params: KeyValuePairs, method: RequestMethod = 'GET'): Promise<any> => {
    const formData = new FormData();
    Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return fetch(url, {
        body: formData,
        method
    })
};

export const addEvent = (parent: Document | HTMLElement, evt: string, selector: string, handler: () => void) => {
    parent.addEventListener(evt, function (event: UIEvent) {
        if ((event?.target as HTMLElement)?.matches(selector + ', ' + selector + ' *')) {
            handler.apply((event.target as HTMLElement).closest(selector), arguments);
        }
    }, false);
};