/**
 * Created by chenchen on 2018/4/10.
 */

const userAgentInfo = navigator.userAgent;
const isPhone = userAgentInfo.indexOf('iPhone') >= 0 || userAgentInfo.indexOf('iPad') > -1;

let _data = {};
function setupWebViewJavascriptBridge(callback) {
  console.log(callback);
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
    setTimeout(function() {
      document.documentElement.removeChild(WVJBIframe)
    }, 0)
  }
  else {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge)
    } else{

      document.addEventListener(
        'WebViewJavascriptBridgeReady',
        function() {
          callback(WebViewJavascriptBridge)
        },
        false
      );
    }
  }

}
function aaa(){
  setupWebViewJavascriptBridge(function(bridge) {

    if (!isPhone) {
      bridge.init(function(message, responseCallback) {
        console.log('JS got a message', message);
        var data = {
          'Javascript Responds': 'Wee!'
        };
        console.log('JS responding with', data);
        responseCallback(data);
      });
    }

    if(bridge.registerHandler){
      bridge.registerHandler("finupCredit_bridgeCallJavaScript", function(data, responseCallback) {
        // {"method":"rule"[,"data":{}]}
        // alert(data);
        // alert('c');
        // for(var key in _data){
        //   alert(key);
        // }
        if(!isPhone){
          data = JSON.parse(data);
        }
        let result = {};
        if (_data.hasOwnProperty(data.method)) {
          if (!!data.data) {
            result = _data[data.method](data);
          } else {
            result = _data[data.method]();
          }
          // alert('oo');
        }
        if(!!responseCallback){
          if(!!result){
            responseCallback(result);
          }else{
            responseCallback();
          }
        }
      })
    }
  })
}
aaa();
let obj = {};
obj.callHandler = function(data,callBackFunc) {
  setupWebViewJavascriptBridge(function(bridge) {
    bridge.callHandler("finupCredit_bridgeCallNative", data, function responseCallback(responseData) {
      console.log("JS received response:", responseData)
      if(!!callBackFunc){
        callBackFunc(responseData);
      }
    })
  })
}

obj.register = function(name, callbackFunc) {
  _data[name] = callbackFunc;
}

export default obj;
