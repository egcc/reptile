var http=require('http');
var https = require('https');
var fs=require('fs');
var cheerio=require('cheerio');
var request=require('request');
var iconv = require('iconv-lite');
var url='https://www.ybdu.com/xiaoshuo/13/13607/';


function startRequest(urls,callback,i) {
    var isdeep=urls instanceof Array;
    var _url=isdeep?urls[i]:urls;
     //采用http模块向服务器发起一次get请求      
     https.get(_url, function (res) {     
        var htmlData = [];
        var htmlDataLength = 0;
        //监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            htmlData.push(chunk);  
            htmlDataLength+=chunk.length;  
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {
            var data=Buffer.concat(htmlData,htmlDataLength);
            data=iconv.decode(data,'gbk');
            callback&&callback(data);

            isdeep?console.log('第'+i+'次完成!'):console.log('菜单获取完成！');
            if(isdeep&&urls.length>i){
                startRequest(urls,callback,i+1);
            }
        });

    }).on('error', function (err) {
        console.log(err);
    });
}

function menuCallBack(html){
    var $ = cheerio.load(html); //采用cheerio模块解析html
    var mulist = $('.mulu_list li a');
    var urls=[];
    mulist.each(function(i,d){
            var contenturl=url+$(d).attr('href');
            urls.push(contenturl);
    });
    startRequest(urls,contentCallBack,0);
}

function contentCallBack(html){
    var $ = cheerio.load(html);
    var title=$('.h1title h1').text();
    var content=$('#htmlContent').text();
    console.log(title);
    appendConent(title+'\r\n',content+'\r\n');
}

function appendConent(title,content){
    fs.appendFile('./data/权力巅峰.txt',title+content, 'utf-8', 
        function (err) {
            if (err) console.log(err);
        });
}

// var arr=[];
// arr.push(url);
startRequest(url,menuCallBack);      //主程序开始运行