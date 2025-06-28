/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_1701117401912_4552";
  // 阿里云对象存储oss
  config.oss = {
    accessKeyId: "阿里云keyid",
    accessKeySecret: "阿里云Secret",
    bucket: "对象存储存储桶",
    region: "存储桶区域",
    folder: "存储文件夹",
  };
  // add your middleware config here
  config.middleware = [];
  // 异常处理
  config.onerror = {
    accepts() {
      return "json";
    },
    json(err, ctx) {
      console.log(err);
      // 自定义错误时的响应体
      if (err.status === 422) {
        if (err.errors[0].message == "required") {
          ctx.body = {
            msg: "缺少必传参数",
            field: err.errors[0].field,
          };
          ctx.status = 400;
        } else {
          ctx.body = {
            msg: err.errors[0].message,
            field: err.errors[0].field,
          };
          ctx.status = 422;
        }
      } else {
        ctx.body = {
          msg: err.message,
          ...(err.errors && { errors: err.errors }),
        };
        ctx.status = err.status;
      }
    },
  };

  // 连接·1数据库
  config.mongoose = {
    url: "数据库地址",
  };
  // 腾讯地图key
  config.wxqq = {
    key: "腾讯地图key",
  };
  // 取消安全威胁csrf的防范
  config.security = {
    csrf: {
      enable: false,
    },
  };
  // 配置校验
  config.validate = {
    convert: true,
    // validateRoot: false,
  };
  // 配置jwt
  config.jwt = {
    secret: "wgdgfhguvjkdhgfy46757",
    expiresIn: 60 * 60 * 24 * 3,
  };
  // 跨域
  config.cors = {
    origin: "*",
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH",
  };
  // 文件上传
  config.multipart = {
    mode: "file",
    fileSize: "1mb",
  };
  // 小程序appid和密钥
  config.wxAppid = {
    appid: "小程序appid",
    secret: "小程序密钥",
    mchid: "商户号", //商户号
    serial_no: "证书序列号", //证书序列号
    wxKeyV3: "v3密钥", //v3密钥
  };

  // 即时通讯
  config.io = {
    init: {}, // passed to engine.io
    namespace: {
      "/": {
        // 连接上的调用的中间件
        connectionMiddleware: ["connection"],
        packetMiddleware: [],
      },
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
