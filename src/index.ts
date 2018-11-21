// @ts-ignore
Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback && callback()).then(() => value),
        reason => P.resolve(callback && callback()).then(() => { throw reason })
    );
}

declare namespace wx {
    function request(options: RequestOption): IRequestTask;
    function setStorageSync(key: string, data: any | string): void
    function setStorage(OBJECT: {
        key: string,
        data: any | string,
        success?(result: any): void,
        complete?(): void
    }): Promise<any>
    function getStorageSync(key: string): any | undefined
}



/**
 * 微信小程序环境
 */
export enum WxMiniEnv {
    DEVELOP = 'develop',
    TRIAL = 'trial',
    RELEASE = 'release'
}

/**
 * 微信小程序API配置信息
 */
export class ApiConfig {
    static baseURL: (path: string) => string
    static baseImageURL: string = ''
    static wxEnv: WxMiniEnv = WxMiniEnv.DEVELOP
}

/**
 * 发生GET请求
 * @param path 请求路径
 * @param data 请求参数
 */
export const doGet = (path: string, data: IAnyObject = {}): Promise<any> => {
    return doRequest(path, data, 'GET')
}

export const doPost = (path: string, data: IAnyObject = {}) => {
    return doRequest(path, data, 'POST')
}

export const doLogin = (path: string, data: IAnyObject = {}) => {
    return doRequest(path, data, 'POST', true)
}

export const doDelete = (path: string, data: IAnyObject = {}) => {
    return doRequest(path, data, 'DELETE')
}

export const doPut = (path: string, data: IAnyObject = {}) => {
    return doRequest(path, data, 'PUT')
}

export const doRequest = (path: string, data: IAnyObject = {}, method: IRequestMethod = 'GET', isLogin: boolean = false): Promise<ResponseData> => {
    const cacheCookieKey: string = 'WX-MINI__COOKIE'

    let baseURL = ApiConfig.baseURL(path)

    if(path.startsWith('/') && baseURL.endsWith('/')){
        baseURL = baseURL.substr(0, baseURL.length - 1)
    }
    let needSplitLine = !path.startsWith('/') && !baseURL.endsWith('/')

    let requestURL = `${baseURL}${needSplitLine ? '/' : ''}${path}`

    let header: AnyMapObject = {};
    if(!isLogin){
        let cookie = wx.getStorageSync(cacheCookieKey) || ''
        header['Cookie'] = cookie
    }
    return new Promise<ResponseData>((resolve, reject) => {
        wx.request({
            url: requestURL,
            method: method,
            data: data,
            header: header,
            success: function (resp) {
                let data: IAnyObject = resp.data || {};
                if(resp.statusCode == 200) {
                    if(isLogin){
                        let cookie: string = (resp.header || {})['Set-Cookie'] || ''
                        wx.setStorage({
                            key: cacheCookieKey,
                            data: cookie,
                            complete: function () {
                                resolve(data);
                            }
                        })
                    } else {
                        resolve(data);
                    }

                } else {
                    reject({
                        // @ts-ignore
                        message: data.message || '服务器繁忙，请稍后重试',
                        // @ts-ignore
                        code: data.code || -1
                    })
                }
            },
            fail: function (error) {
                reject({
                    message: error.errMsg || '服务器繁忙，请稍后重试',
                    code: -1
                })
            }
        })
    })
}


export type IAnyObject = string | AnyMapObject | ArrayBuffer

export type IRequestMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

type RequestSuccessCallback = (result: RequestSuccessCallbackResult) => void;
type ResponseData = string | IAnyObject | ArrayBuffer

declare interface IRequestTask {
    abort()
}

interface RequestSuccessCallbackResult {
    data: string | IAnyObject | ArrayBuffer;
    statusCode: number;
    header: IAnyObject;
}

interface RequestOption {
    url: string;
    data?: string | IAnyObject | ArrayBuffer;
    header?: IAnyObject;
    method?: IRequestMethod;
    dataType?: 'json' | string;
    responseType?: 'text' | 'arraybuffer' | string;
    success?: RequestSuccessCallback;
    fail?: RequestFailCallback;
    complete?: RequestCompleteCallback;
}
type RequestCompleteCallback = (res: GeneralCallbackResult) => void;
type RequestFailCallback = (res: GeneralCallbackResult) => void;
interface AnyMapObject {
    [propName:string]: IAnyObject
}
interface GeneralCallbackResult {
    errMsg: string;
}