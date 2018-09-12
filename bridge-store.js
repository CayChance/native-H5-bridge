/**
 * Created by chenchen on 2018/4/10.
 */
const userAgentInfo = navigator.userAgent;
const isPhone = userAgentInfo.indexOf('iPhone') >= 0 || userAgentInfo.indexOf('iPad') > -1;

let _data = {};
let calling = false;

function setupWebViewJavascriptBridge(callback) {
  if (isPhone) {
    if (window.WebViewJavascriptBridge) {
      return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
      return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
      document.documentElement.removeChild(WVJBIframe)
    }, 0);
  }
  else {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge)
    }
    else {
      document.addEventListener('WebViewJavascriptBridgeReady', function () {
        console.warn('WebViewJavascriptBridgeReady reday');
        callback(WebViewJavascriptBridge)
      }, false);
    }
  }
}

setupWebViewJavascriptBridge(function (bridge) {
  if (bridge) {
    try{
      if (!isPhone) {
        bridge.init(function (message, responseCallback) {
          console.log('JS got a message', message);
          var data = {
            'Javascript Responds': 'Wee!'
          };
          console.log('JS responding with', data);
          responseCallback(data);
        });
      }
      bridge.registerHandler("finupCredit_bridgeCallJavaScript", function (payload, responseCallback) {
        console.warn(`NATIVE call JS:  ${payload && payload.method}`);
        try{
          if (!isPhone && typeof payload === 'string') {
            try {
              payload = JSON.parse(payload);
            } catch (error) {
              console.warn(error, 'bridge error 4')
            }
          }
          let result;
          if (payload.method && _data[payload.method]) {
            result = _data[payload.method](payload.data);
          } else if (payload.method && !_data[payload.method]) {
            console.warn(`JSBridge ERROR: H5没有注册这个方法  ${payload.method}, 但是 native 调用了`);
          }
          if (responseCallback) {
            responseCallback(result);
          }
        } catch(e) {
          console.warn(e, 'bridge error 1');
        }
        // console.warn('done registerHandler');
      });
    } catch(e) {
      console.warn(e, 'bridge error 2');
    }
  }

});


let obj = {};
obj.callHandler = function (data, callBackFunc) {
  try {
    if (typeof data == 'string') {
      data = {
        method: data,
        data: {}
      };
    }
    if (calling === data.method) return;
    calling = data.method;
    console.warn(`JS call NATIVE:  ${data.method}`);
    setTimeout(() => {calling = false}, 500);
    console.info('Will CallNative with: ' + JSON.stringify(data));
    setupWebViewJavascriptBridge(function (bridge) {
      console.info('CallNative:' + JSON.stringify(data));
      if (bridge) {
        bridge.callHandler("finupCredit_bridgeCallNative", data, function responseCallback(responseData) {
          console.info("JS received response:", responseData);
          if (callBackFunc) {
            responseData = typeof responseData == 'object' ? responseData : JSON.parse(responseData);
            callBackFunc(responseData);
          }
        });
      }
      else {
        if (callBackFunc) {
          callBackFunc();
        }
      }
    });
  } catch (error) {
    console.warn(error, 'bridge error 3')
  }
}

obj.register = function (name, callbackFunc) {
  _data[name] = callbackFunc;

  console.warn(`${name}  register`);
}
export default obj;
