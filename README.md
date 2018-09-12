# native-H5-bridge
客户端和h5交互方式，使用WebViewJavascriptBridge开源库，本质上，它也是通过webview的代理拦截scheme，然后注入相应的JS。
优点：可兼容ios6等

register方法就是本地封装以后的registerHandler方法；
callHandler方法是本地封装以后的callHandler方法。


//客户端调用JS方法，无回调
bridge.register("方法名",this.rule);
//客户端调用JS方法，JS有回调
bridge.register('方法名',function(){return {data:'变量'});

//JS调用客户端的方法，无回调
bridge.callHandler({
  method: "方法名",
  data: {'数据'}
})
//JS调用客户端的方法，客户端有回调，回调内容为e
bridge.callHandler({
  method:"方法名",
  data:{'数据'}
},e=>{
  let json = JSON.parse(e);
  if(json.type === 'IOS' && json.token){
    json.type = 'H5';
  }
})
