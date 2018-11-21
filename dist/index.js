"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(value => P.resolve(callback && callback()).then(() => value), reason => P.resolve(callback && callback()).then(() => { throw reason; }));
};
var WxMiniEnv;
(function (WxMiniEnv) {
    WxMiniEnv["DEVELOP"] = "develop";
    WxMiniEnv["TRIAL"] = "trial";
    WxMiniEnv["RELEASE"] = "release";
})(WxMiniEnv = exports.WxMiniEnv || (exports.WxMiniEnv = {}));
class ApiConfig {
}
ApiConfig.baseImageURL = '';
ApiConfig.wxEnv = WxMiniEnv.DEVELOP;
exports.ApiConfig = ApiConfig;
exports.doGet = (path, data = {}) => {
    return exports.doRequest(path, data, 'GET');
};
exports.doPost = (path, data = {}) => {
    return exports.doRequest(path, data, 'POST');
};
exports.doLogin = (path, data = {}) => {
    return exports.doRequest(path, data, 'POST', true);
};
exports.doDelete = (path, data = {}) => {
    return exports.doRequest(path, data, 'DELETE');
};
exports.doPut = (path, data = {}) => {
    return exports.doRequest(path, data, 'PUT');
};
exports.doRequest = (path, data = {}, method = 'GET', isLogin = false) => {
    const cacheCookieKey = 'WX-MINI__COOKIE';
    let baseURL = ApiConfig.baseURL(path);
    if (path.startsWith('/') && baseURL.endsWith('/')) {
        baseURL = baseURL.substr(0, baseURL.length - 1);
    }
    let needSplitLine = !path.startsWith('/') && !baseURL.endsWith('/');
    let requestURL = `${baseURL}${needSplitLine ? '/' : ''}${path}`;
    let header = {};
    if (!isLogin) {
        let cookie = wx.getStorageSync(cacheCookieKey) || '';
        header['Cookie'] = cookie;
    }
    return new Promise((resolve, reject) => {
        wx.request({
            url: requestURL,
            method: method,
            data: data,
            header: header,
            success: function (resp) {
                let data = resp.data || {};
                if (resp.statusCode == 200) {
                    if (isLogin) {
                        let cookie = (resp.header || {})['Set-Cookie'] || '';
                        wx.setStorage({
                            key: cacheCookieKey,
                            data: cookie,
                            complete: function () {
                                resolve(data);
                            }
                        });
                    }
                    else {
                        resolve(data);
                    }
                }
                else {
                    reject({
                        message: data.message || '服务器繁忙，请稍后重试',
                        code: data.code || -1
                    });
                }
            },
            fail: function (error) {
                reject({
                    message: error.errMsg || '服务器繁忙，请稍后重试',
                    code: -1
                });
            }
        });
    });
};
