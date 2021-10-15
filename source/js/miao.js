// setInterval(function() { console.log("hello"); }, 1000);
var http = require("http");


//  node.js 載入模組


http.createServer(function(request, response) {
  console.log(request.url);
  // response.write("<head><meta charset='UTF-8'></head>");
  if(request.url == '/'){
// 路由
    // 資料庫
    console.log("接收到網頁請求！");
    response.writeHead(200, {"Content-Type": "text/HTML"});
    response.write("<h1>index</h1>");
    response.end();
  }else if(request.url == '/index'){
     console.log("接收到網頁請求！");
    response.writeHead(200, {"Content-Type": "text/HTML"});
    response.write("<head><meta charset='UTF-8'></head>");
    response.write("<h1>進主頁啦！</h1>");
    response.end();
  }else if(request.url == '/search'){
     console.log("接收到網頁請求！");
    response.writeHead(200, {"Content-Type": "text/HTML"});
    response.write("<h1>search</h1>");
    response.end();
  }else{
    response.writeHead(200, {"Content-Type": "text/HTML"});
    response.write("<head><meta charset='UTF-8'></head>");
    response.write("<h1>好興奮</h1>");
    response.end();
  }
  
}).listen(process.env.PORT ||3000);
console.log("Server已開啟port: 3000.");

