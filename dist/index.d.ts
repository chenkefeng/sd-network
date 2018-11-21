export declare enum WxMiniEnv {
    DEVELOP = "develop",
    TRIAL = "trial",
    RELEASE = "release"
}
export declare class ApiConfig {
    static baseURL: (path: string) => string;
    static baseImageURL: string;
    static wxEnv: WxMiniEnv;
}
export declare const doGet: (path: string, data?: IAnyObject) => Promise<any>;
export declare const doPost: (path: string, data?: IAnyObject) => Promise<IAnyObject>;
export declare const doLogin: (path: string, data?: IAnyObject) => Promise<IAnyObject>;
export declare const doDelete: (path: string, data?: IAnyObject) => Promise<IAnyObject>;
export declare const doPut: (path: string, data?: IAnyObject) => Promise<IAnyObject>;
export declare const doRequest: (path: string, data?: IAnyObject, method?: IRequestMethod, isLogin?: boolean) => Promise<IAnyObject>;
export declare type IAnyObject = string | AnyMapObject | ArrayBuffer;
export declare type IRequestMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';
interface AnyMapObject {
    [propName: string]: IAnyObject;
}
export {};
