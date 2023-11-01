import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";
let apiRoot = process.env.BACKEND_URL;

const config = {
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
}
console.log("apiRoot" + apiRoot);
const axiosInstance = axios.create({
    baseURL: apiRoot,
});

const requestHandler = (request) => {
    request.headers.Platform = "Web";

    if (localStorage.user && request.url.indexOf("login") == -1) {
        let { accessToken, refreshToken } = userData();
        if (accessToken) {
            request.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (refreshToken) {
            request.headers.RefreshToken = refreshToken;
        }
    }
    return request;
};

const responseFailed = (error) => {
    // trackfn("responseFailed", error);
    if (error && error.response && error.response.data && error.response.data.statusCode === 401) {
        var queryStrings = window.location.search.replace("?", "").split("&");
        var datasetQuery = queryStrings.filter((x) => x.toLowerCase().indexOf("dataset=") != -1);
        if (datasetQuery && datasetQuery.length > 0) {
            var dataset = datasetQuery[0].split("=")[1];
            if (dataset) {
                localStorage.clear();

                window.location.href = "" + window.location.href;
            }
        }
        if (localStorage.userData) {
            let { roleId } = JSON.parse(localStorage.userData).user;
            if (roleId == 5) {
                localStorage.clear();

                window.location.href = "" + window.location.href;
            }
        }
        localStorage.clear();
        //console.log(history);
        history.pushState({}, "", "/account/login");
        window.location.href = "#logout";
        // history.push('/account/login');
        return Promise.reject({ ...error });
    }
    if (error.request && error.request.status && (error.request.status === "400" || error.request.status === "404")) {
        return Promise.reject({ ...error });
    }

    return Promise.reject({ ...error });
};

const responseSuccess = (response) => {
    if (localStorage.userData) {
        let userData = JSON.parse(localStorage.userData);
        let { accesstoken, refreshtoken } = response.headers;
        if (accesstoken != null && refreshtoken !== null) {
            if (accesstoken !== userData.accessToken && refreshtoken !== userData.refreshToken) {
                userData.accessToken = accesstoken;
                userData.refreshToken = refreshtoken;
                localStorage.removeItem("userData");
                localStorage.setItem("userData", JSON.stringify(userData));
            }
        }
    }
    return response;
};
function errorHandler(error) {
    // trackfn("errorHandler", error);
    if (error) {
        let { response } = error;
        let { data } = response || {};
        //console.log(error.message);
        if (error && error.isAxiosError && !response) {
            toast.error("Network Issue or Server Down", {
                autoClose: 3000,
                toastId: "network",
            });
        } else if (response && response.status == 401 && data.message && typeof data.message == "string") {
            toast.error(data.message, {
                autoClose: 3000,
                toastId: "network",
            });
        } else if (response && response.status == 401) {
            toast.error(JSON.stringify(data), {
                autoClose: 3000,
                toastId: "network",
            });
        } else if (data && data.statusCode && data.statusCode == 400 && data.message && typeof data.message == "string") {
            toast.error(data.message, {
                autoClose: 3000,
                toastId: "network",
            });
        } else if (data && data.statusCode && data.statusCode == 400 && data.message) {
            toast.error(data.message, {
                autoClose: 3000,
                toastId: "network",
            });
        } else {
            toast.error(JSON.stringify(data), {
                autoClose: 3000,
                toastId: "network",
            });
        }
    }
}
function argumentsToQuery(url, urlArguments, filter) {
    if (urlArguments) {
        url += "?";
        let items = [];
        let unAllowedItems = ["query", "createUrl", "filter"];
        for (const k in urlArguments) {
            if (Object.hasOwnProperty.call(urlArguments, k)) {
                let v = urlArguments[k];

                if (unAllowedItems.indexOf(k.toString()) === -1 && v != null) {
                    items.push(`${k}=${v.toString()}`);
                }
            }
        }
        let filters = [];
        for (const k in filter) {
            if (Object.hasOwnProperty.call(filter, k)) {
                let v = filter[k];
                if (typeof v == "string") {
                    filters.push(`${k}=${v}`);
                } else {
                    filters.push(`${k}=${v}`);
                }
            }
        }
        if (filters.length) {
            items.push(`${filters.join("&")}`);
        }
        url += items.join("&");
        return url;
    }
    return url;
}

class httpService {
    constructor() {
        if (axiosInstance.interceptors.request.handlers.length === 0) {
            axiosInstance.interceptors.request.use((request) => requestHandler(request));

            axiosInstance.interceptors.response.use(
                (response) => responseSuccess(response),
                (error) => responseFailed(error)
            );
        }
    }

    getWithHeader(path, header) {
        if (path) {
            return axiosInstance.get(apiRoot + path, header, config);
        }
    }
    async get(path, select, filter, sort, offset, limit) {
        let body = {};
        body["select"] = select ?? ["id"];
        if (sort?.sortOrder && sort?.sortField) {
            body["sortField"] = sort.sortField;
            body["sortOrder"] = sort.sortOrder;
        }
        body["filter"] = filter;
        body["page"] = offset + 1 ?? 1;
        body["take"] = limit ?? 10;
        // /let model = body;
        path = argumentsToQuery(path, body, filter);
        return new Promise((resolve, reject) => {
            if (path) {
                try {
                    axiosInstance
                        .get(apiRoot + path, config)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            errorHandler(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    async blob(path, model) {
        return new Promise((resolve, reject) => {
            if (path) {
                try {
                    axiosInstance
                        .get(
                            apiRoot + path,
                            // (path.includes('?') ? '&date=' : '?date=') +
                            // new Date(),
                            model,
                            {
                                ...config,
                                responseType: "blob",
                            }
                        )
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            errorHandler(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    post(path, model) {
        return new Promise((resolve, reject) => {
            if (path) {
                try {
                    return axiosInstance
                        .post(apiRoot + path, model, config)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            errorHandler(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    upload(path, model) {
        return new Promise((resolve, reject) => {
            if (path) {
                try {
                    return axiosInstance
                        .post(apiRoot + path, model, {
                            ...config,
                            ...{ headers: { ...config.headers, "Content-Type": "multipart/form-data" } },
                        })
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            errorHandler(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
    put(path, model) {
        return new Promise((resolve, reject) => {
            if (path) {
                try {
                    return axiosInstance
                        .put(apiRoot + path, model, config)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            errorHandler(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    remove(path, model) {
        return new Promise((resolve, reject) => {
            if (path) {
                try {
                    return axiosInstance
                        .delete(apiRoot + path, { data: model }, config)
                        .then((result) => {
                            resolve(result);
                        })
                        .catch((error) => {
                            errorHandler(error);
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
}

export const http = new httpService();
export const { getWithHeader } = new httpService();
export const { get } = new httpService();
export const { blob } = new httpService();
export const { getAsync } = new httpService();
export const { post } = new httpService();
export const { upload } = new httpService();
export const { put } = new httpService();
export const { remove } = new httpService();