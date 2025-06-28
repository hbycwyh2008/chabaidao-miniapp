export const requestUrl: string = "http://127.0.0.1:7001";
const requestAddress = requestUrl + "/api/wx";
export const uploadFileUrl = requestUrl + "/api/admin/uploadFile";
import { Base64 } from "js-base64";

// 取出本地缓存的用户token
function getToken(): string {
  const token: string = uni.getStorageSync("wxUserInfo").user_Token || "";
  const base64Toekn = Base64.encode(token + ":");
  return "Basic " + base64Toekn;
}

interface Data<T> {
  data: T;
  error: any;
  msg: string;
}

export const request = <T>(url: string, data: object = {}, method: "GET" | "POST" = "GET") => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      url: requestAddress + url,
      method,
      data,
      header: { Authorization: getToken() },
      success: (res) => {
        const status = res.statusCode;
        switch (status) {
          case 200:
            resolve(res.data as Data<T>);
            break;
          case 404:
            console.error("接口不存在");
            reject("404");
            break;
          case 401:
            uni.navigateTo({ url: "/pages/login/index" });
            console.error("没有权限");
            reject("401");
            break;
          case 500:
          case 501:
          case 503:
            console.log(res.data);
            uni.showToast({
              title: "出现异常错误",
              icon: "none",
            });
            console.error("出现异常错误");
            reject("出现异常错误");
            break;
          case 400:
            console.error((res.data as Data<T>).msg);
            reject("400");
            break;
          case 422:
            uni.showToast({
              title: (res.data as Data<T>).msg,
              icon: "none",
            });
            reject("422");
            break;
        }
      },
      fail: (err: any) => {
        uni.showToast({
          title: err,
          icon: "none",
        });
        reject(err);
      },
    });
  });
};
