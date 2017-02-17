/**
 * Created by jorten on 16/3/16.
 */
var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');
var fs = require('fs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var request = require('request');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sen_demo'
});

var proxy = httpProxy.createProxyServer();
var app = express();
var hashTable = {
    1: "伯明翰",
    2: "利物浦",
    3: "伦敦",
    4: "埃克塞特",
    5: "曼彻斯特",
    6: "格拉斯哥",
    7: "纽卡斯尔",
    8: "莱斯特"
}
var dataReceive, userReceive, siteReceive, trueData = [], dataReceiveSearch, userReceiveSearch, siteReceiveSearch, trueDataSearch = [];
var isProduction = process.env.NODE_ENV === "production";
var port = isProduction ? process.env.PORT : 3000;
var publicPath = path.resolve(__dirname, 'public');
app.set('view engine', 'ejs');

var option = {
    backgroundColor: 'rgb(0, 0, 0)',
    color: [],
    tooltip : {
        trigger: 'item',
        formatter: "return param.data.site_name ? param.data.site_name : '英国'"
    },
    legend: {
        show: true,
        orient: 'vertical',
        x:'left',
        y: 'bottom',
        selected: true,
        selectedMode: 'multiple',
        textStyle : {
            color: 'auto'
        },
        data: []
    },
    series: [
        {
            type: 'map',
            mapType: 'world|United Kingdom',
            roam: true,
            hoverable: false,
            itemStyle:{
                normal:{
                    borderColor:'rgb(49, 168, 168)',
                    borderWidth:0.5,
                    areaStyle:{
                        color: '#000'
                    }
                }
            },
            markLine: {
                smooth: true,
                smoothness: 0.4,
                effect : {
                    show: true,
                    scaleSize: 1,
                    period: 30,
                    color: '#fff',
                    shadowBlur: 10,
                },
                itemStyle : {
                    normal: {
                        color: 'white',
                        borderWidth:1,
                        lineStyle: {
                            type: 'solid',
                            shadowBlur: 10
                        }
                    }
                },
                data: []
            },
            markPoint: {
                symbol:'emptyCircle',
                symbolSize : function (v){
                    return 10 + v/10
                },
                effect : {
                    show: true,
                    shadowBlur : 0
                },
                itemStyle:{
                    normal:{
                        label:{show:true}
                    },
                    emphasis: {
                        label:{position:'top'}
                    }
                },
                data: []
            },
            geoCoord: {},
            data: []
        }
    ]
};
function deepCopy(smop, op) {
    for (var key in op) {
        if(Object.prototype.toString.call(op[key]) === '[object Object]') {
            smop[key] = {};
            deepCopy(smop[key], op[key]);
        }else if(Object.prototype.toString.call(op[key]) === "[object Array]") {
            smop[key] = [];
            deepCopy(smop[key], op[key]);
        }else {
            smop[key] = op[key];
        }
    }
}
var smallOption = {};
deepCopy(smallOption, option);
smallOption.legend.show = false;
smallOption.series[0].markLine.itemStyle.normal.color = "red";
var querySel = "select * from s_site";
connection.query(querySel, (err, res1) => {
    if(err) {
        console.log(err);
    } else {
        for(var i = 0, j = res1.length; i < j; i++) {
            option.legend.data.push(res1[i].name);
            smallOption.legend.data.push(res1[i].name);
            option.series[0].geoCoord[res1[i].id] = [res1[i].site_x, res1[i].site_y];
            smallOption.series[0].geoCoord[res1[i].id] = [res1[i].site_x, res1[i].site_y];
            option.series.push({
                name: res1[i].name,
                data: [],
                type: 'map',
                mapType: 'world|United Kingdom',
                hoverable: false,
                itemStyle:{
                    normal:{
                        borderColor:'rgba(100,149,237,1)',
                        borderWidth:0.5,
                        areaStyle:{
                            color: '#1b1b1b'
                        }
                    }
                },
                markPoint: {
                    symbol:'emptyCircle',
                    symbolSize : function (v){
                        return 10 + v/10
                    },
                    effect : {
                        show: true,
                        shadowBlur : 0
                    },
                    itemStyle:{
                        normal:{
                            label:{show:false}
                        },
                        emphasis: {
                            label:{position:'top'}
                        }
                    },
                    data: []
                }
            });
            smallOption.series.push({
                name: res1[i].name,
                data: [],
                type: 'map',
                mapType: 'world|United Kingdom',
                hoverable: false,
                itemStyle:{
                    normal:{
                        borderColor:'rgba(100,149,237,1)',
                        borderWidth:0.5,
                        areaStyle:{
                            color: '#1b1b1b'
                        }
                    }
                },
                markPoint: {
                    symbol:'emptyCircle',
                    symbolSize : function (v){
                        return 10 + v/10
                    },
                    effect : {
                        show: true,
                        shadowBlur : 0
                    },
                    itemStyle:{
                        normal:{
                            label:{show:false}
                        },
                        emphasis: {
                            label:{position:'top'}
                        }
                    },
                    data: [{
                        name: res1[i].id,
                        site_name: res1[i].name,
                        site_x: res1[i].site_x,
                        site_y: res1[i].site_y
                    }]
                }
            })
        }
        var querySel = "select * from s_link";
        connection.query(querySel, (err, res2) => {
            res2.map((data) => {
                if(data.sensitive_ === "true") {
                    //option.series[0].markLine.data.push([
                    //    {
                    //        name: data.site1_id,
                    //        site_name: res1[data.site1_id - 1].name + ' > ' + res1[data.site2_id - 1].name
                    //    },
                    //    {
                    //        name: data.site2_id
                    //    }
                    //]);
                    smallOption.series[0].markLine.data.push([
                        {
                            name: data.site1_id,
                            site_name: res1[data.site1_id - 1].name + ' > ' + res1[data.site2_id - 1].name
                        },
                        {
                            name: data.site2_id
                        }
                    ]);
                }
            });
        })
    }
});

// 静态路径

app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false }));

// We only want to run the workflow when not in production
if (!isProduction) {
    // We require the bundler inside the if block because
    // it is only needed in a development environment. Later
    // you will see why this is a good idea
    var bundle = require('./server/bundle.js');
    bundle();

    // Any requests to localhost:3000/build is proxied
    // to webpack-dev-server
    app.all('/build/*', function(req, res) {
        proxy.web(req, res, {
            target: "http://localhost:8080"
        });
    });
}

app.get('/', function() {

});

app.get('/site/', function(req, res) {
    var ops = {
        option: option,
        smallOption: smallOption
    }
    res.send(JSON.stringify(ops));
    //var data = fs.readFile(__dirname + '/public/json/s_site.json', 'utf-8', function(err, data) {
    //    if(err){
    //        console.log(err);
    //    }else{
    //        var temp = [];
    //        data = JSON.parse(data);
    //        temp[0] = data[0];
    //        temp[1] = [];
    //        for(var i = 0, j = data[1].length; i < j; i++) {
    //            if(data[1][i].sensitive_ === 'true') {
    //                data[1][i].site1_name = data[0][data[1][i]["site1_id"] - 1]["name"];
    //                data[1][i].site2_name = data[0][data[1][i]["site2_id"] - 1]["name"];
    //                temp[1].push(data[1][i]);
    //            }
    //        }
    //        res.send(temp);
    //    }
    //});
});

app.get('/userinit', (req, res) => {
    var querySel = "select * from s_user";
    connection.query(querySel, (err, res1) => {
        if(err) {
            console.log(err);
        } else {
            res.send(JSON.stringify(res1));
        }
    });
});

app.get('/news/', (req, res) => {
    var querySel = "select * from s_news";
    connection.query(querySel, (err, res1) => {
        if(err) {
            console.log(err)
        } else {
            res1.map((temp) => {
                if(temp.sensitive_ === "true") {
                    var pattern = new RegExp(temp.words.split("").map((data) => {
                        return data + "[\\s]*";
                    }).join(""), "gi");
                    temp.news_detail = temp.news_content.replace(pattern, "<span class='sensitive'>$&</span>");
                } else {

                }
            });
            res.send(JSON.stringify(res1));
        }
    })
});

app.get('/tableinit/', (req, res) => {
    var options = {
        url: "http://114.215.164.11:5000/api/v1.0/0"
    }
    request(options, (err, response, body) => {
        if (err) {
            throw err;
        }
        // console.log(body);

        dataReceive = JSON.parse(body)[0];
        deepCopy(trueData, dataReceive);
        userReceive = JSON.parse(body)[1];
        siteReceive = JSON.parse(body)[2];
        // data = fs.readFile(__dirname + '/public/json/s_news.json', 'utf-8', (err, data) => {
        //     if(err) {
        //         console.log(err);
        //     } else {
        var item = {
            sensitive: [],
            normal: []
        };
        dataReceive.map((temp) => {
            if (temp.sensitive_ === true) {
                var pattern = new RegExp(temp.words.map((data) => {
                    return data + "[\\s]*";
                }).join(""), "gi");
                temp.news_content = temp.news_content.replace(pattern, "<span class='sensitive'>$&</span>");
                item.sensitive.push(temp);
            } else {
                item.normal.push(temp);
            }
        });
        res.send(JSON.stringify(item));
    });
        // }
    // });

});

app.get('/userid/', (req, res) => {
    var user = req.query.user;
    var querySel = "select * from s_user where user_id in (" + user + ")";
    connection.query(querySel, (err, res1) => {
        if(err) {
            console.log(err);
        } else {
            var json = {
                sensitive: [],
                normal: []
            };
            res1.map((temp) => {
                if(temp.sensitive_ === "true") {
                    json.sensitive.push(temp.id);
                } else {
                    json.normal.push(temp.id);
                }
            });
            res.send(json);
        }
    })
})

app.get('/location/', (req, res) => {
    var site = req.query.site - 1;
    // var querySel = "select * from s_user where site_id = " + site;
    // connection.query(querySel, (err, res1) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    var res1 = siteReceive[site];
    var res2 = {};
    res2.active = [];
    res2.normal = [];
    res1.forEach((data) => {
        if(data.sensitive_ === true) {
            res2.active.push(data);
        } else {
            res2.normal.push(data);
        }
    })
    res.send(res2);
        // }
    // })
});

app.get("/siteinit/", (req, res) => {
    var querySel = "select * from s_site";
    connection.query(querySel, (err, res1) => {
        res.send(JSON.stringify(res1));
    })
})

app.get('/connection/', (req, res) => {
    var site1 = req.query.site1;
    var site2 = req.query.site2;
    // var querySel = "select * from s_link where site1_id = " + site1 + " and site2_id = " + site2;
    // connection.query(querySel, (err, res1) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    var res1 = [];
    trueData.map((temp) => {
        if(temp.users.length >= 2) {
            for(var i = 0, j = temp.users.length - 1; i < j; i++) {
                // console.log(temp.users[i].site_id);
                // console.log(temp.users[i + 1].site_id);
                if((temp.users[i].site_id == site1 && temp.users[i + 1].site_id == site2) || (temp.users[i].site_id == site2 && temp.users[i + 1].site_id == site1)) {
                    res1.push(temp);
                }
            }
        }
    })
    var res2 = {};
    res2.active = [];
    res2.normal = [];
    res1.forEach((data) => {
        if(data.sensitive_ === true) {
            res2.active.push(data);
        } else {
            res2.normal.push(data);
        }
    });
    res.send(res2);
        // }
    // })
});

app.post('/search/', (req, res) => {
    var id = req.body.id;
    var type = req.body.type;
    if(type === 'user') {
        var options = {
            url: "http://114.215.164.11:5000/api/v1.0/search_userid/" + id
        }
    } else if(type === 'news') {
        var options = {
            url: "http://114.215.164.11:5000/api/v1.0/search_newsid/" + id
        }
    } else {
        var options = {
            url: "http://114.215.164.11:5000/api/v1.0/search_content/" + id
        }
    }
    // var querySel = "select * from s_news where news_id = " + id;
    // connection.query(querySel, (err, res1) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         var user_id = res1[0].user_id;
    //         var querySel = "select distinct site_id from s_user where user_id in (" + user_id + ")";
    //         connection.query(querySel, (err, res2) => {
    //             if(err) {
    //                 console.log(err);
    //             } else {

    request(options, (err, response, body) => {
        dataReceiveSearch = JSON.parse(body)[0];
        deepCopy(trueDataSearch, dataReceiveSearch);
        userReceiveSearch = JSON.parse(body)[1];
        siteReceiveSearch = JSON.parse(body)[2];
        var item = {
            sensitive: [],
            normal: []
        };
        dataReceiveSearch.map((temp) => {
            if (temp.sensitive_ === true) {
                var pattern = new RegExp(temp.words.map((data) => {
                    return data + "[\\s]*";
                }).join(""), "gi");
                temp.news_content = temp.news_content.replace(pattern, "<span class='sensitive'>$&</span>");
                item.sensitive.push(temp);
            } else {
                item.normal.push(temp);
            }
        });
        var res1 = dataReceiveSearch;
        var tempOption = {};
        deepCopy(tempOption, option);
        for(var i = 1, j = tempOption.series.length; i < j; i++) {
            tempOption.series[i].markPoint.data = [];
        }
        tempOption.legend.selected = {};
        tempOption.legend.data.map((data) => {
            tempOption.legend.selected[data] = false;
        });
        tempOption.series[0].markLine.data = [];
        res1.map((data) => {
            var res2 = data.users;
            if(res2.length === 1) {
                if(tempOption.series[res2[0].site_id].markPoint.data.length === 0) {
                    tempOption.legend.selected[smallOption.series[res2[0].site_id].name] = true;
                    tempOption.series[res2[0].site_id].markPoint.data = smallOption.series[res2[0].site_id].markPoint.data;
                }
            } else {
                for(var i = 0, j = res2.length - 1; i < j; i++) {
                    var result = false;
                    tempOption.legend.selected[smallOption.series[res2[i].site_id].name] = true;
                    tempOption.legend.selected[smallOption.series[res2[i + 1].site_id].name] = true;
                    tempOption.series[res2[i].site_id].markPoint.data = smallOption.series[res2[i].site_id].markPoint.data;
                    tempOption.series[res2[i + 1].site_id].markPoint.data = smallOption.series[res2[i + 1].site_id].markPoint.data;
                    result = tempOption.series[0].markLine.data.some((temp) => {
                        if(temp[0].name === res2[i].site_id && temp[1].name === res2[i + 1].site_id) {
                            return true;
                        }
                    })
                    //console.log(result);
                    if(!result) {
                        if(data.sensitive_ === false) {
                            tempOption.series[0].markLine.data.push([
                                {
                                    name: res2[i].site_id,
                                    site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
                                },
                                {
                                    name: res2[i + 1].site_id
                                }
                            ])
                        } else {
                            tempOption.series[0].markLine.data.push([
                                {
                                    name: res2[i].site_id,
                                    site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
                                    itemStyle: {
                                        normal: {
                                            color: 'red'
                                        }
                                    }
                                },
                                {
                                    name: res2[i + 1].site_id
                                }
                            ])
                        }
                    }
                }
            }
        });
        console.log(item)
        res.send(JSON.stringify({
            option: tempOption,
            data: item
        }));
    })
        // if (err) {
        //     throw err;
        // }
        // var series = [];
        // var legend = {};
        // deepCopy(series, smallOption.series);
        // deepCopy(legend, smallOption.legend);
        // legend.selected = {};
        // legend.show = true;
        // legend.data.map((data) => {
        //     legend.selected[data] = false;
        // })
        // for(var i = 1, j = 9; i < j; i++) {
        //     series[i].markPoint.data = [];
        // }
        // var res1 = JSON.parse(body)[0];
        // series[0].markLine.data = [];
        // for(var p = 0, q = res1.length; p < q; p++) {
        //     var res2 = res1[p].users;
            // for(var i = 0, j = res2.length; i < j; i++) {
            //     series[res2[i].site_id].markPoint.data = smallOption.series[res2[i].site_id].markPoint.data;
            //     if(series[res2[i].site_id].markPoint.data[0].user_id) {
            //         series[res2[i].site_id].markPoint.data[0].user_id = [];
            //         series[res2[i].site_id].markPoint.data[0].user_id.push(res2[i].user_id)
            //     } else {
            //         series[res2[i].site_id].markPoint.data[0].user_id.push(res2[i].user_id)
            //     }
            //     legend.selected[smallOption.series[res2[i].site_id].name] = true;
            // }
    //         if(res2.length > 1) {
    //             if(res1[p].sensitive_ === false) {
    //                 for (var i = 0, j = res2.length - 1; i < j; i++) {
    //                     series[0].markLine.data.push([
    //                         {
    //                             name: res2[i].site_id,
    //                             site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
    //                             itemStyle: {
    //                                 normal: {
    //                                     color: 'white'
    //                                 }
    //                             }
    //                         },
    //                         {
    //                             name: res2[i + 1].site_id
    //                         }
    //                     ])
    //                 }
    //             } else {
    //                 for (var i = 0, j = res2.length - 1; i < j; i++) {
    //                     series[0].markLine.data.push([
    //                         {
    //                             name: res2[i].site_id,
    //                             site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
    //                         },
    //                         {
    //                             name: res2[i + 1].site_id
    //                         }
    //                     ])
    //                 }
    //             }
    //         }
    //     }
    //     res.send(JSON.stringify({
    //         legend: legend,
    //         series: series
    //     }));
    // });

    // if(res2.length > 1) {
    //     for(var i = 0, j = res2.length - 1; i < j; i++) {
    //         series[0].markLine.data.push([
    //             {
    //                 name: res2[i].site_id,
    //                 site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
    //                 newsid: id
    //             },
    //             {
    //                 name: res2[i + 1].site_id
    //             }
    //         ])
    //     }
    // }
    //             }
    //         })
    //     }
    // });
});

app.get('/locationSearch', (req, res) => {
    var site = req.query.site - 1;
    var res1 = siteReceiveSearch[site];
    var res2 = {};
    res2.active = [];
    res2.normal = [];
    res1.forEach((data) => {
        if(data.sensitive_ === true) {
            res2.active.push(data);
        } else {
            res2.normal.push(data);
        }
    })
    console.log(res2);
    res.send(res2);
})

app.get('/connectionSearch', (req, res) => {
    var site1 = req.query.site1;
    var site2 = req.query.site2;
    var res1 = [];
    trueDataSearch.map((temp) => {
        if(temp.users.length >= 2) {
            for(var i = 0, j = temp.users.length - 1; i < j; i++) {
                // console.log(temp.users[i].site_id);
                // console.log(temp.users[i + 1].site_id);
                if((temp.users[i].site_id == site1 && temp.users[i + 1].site_id == site2) || (temp.users[i].site_id == site2 && temp.users[i + 1].site_id == site1)) {
                    res1.push(temp);
                }
            }
        }
    })
    var res2 = {};
    res2.active = [];
    res2.normal = [];
    res1.forEach((data) => {
        if(data.sensitive_ === true) {
            res2.active.push(data);
        } else {
            res2.normal.push(data);
        }
    });
    res.send(res2);
})

app.get("/refresh/", (req, res) => {
    var time = req.query.time;
    // var querySel = "select * from s_news where news_id >=" + Number(70 * (time - 1) + 1) + " and news_id <=" + Number(70 * time) + " order by sensitive_ desc";
    // connection.query(querySel, (err, res1) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    var res1 = dataReceive.splice(0, 20);
    // console.log(res1)
    var tempOption = {};
    deepCopy(tempOption, option);
    for(var i = 1, j = tempOption.series.length; i < j; i++) {
        tempOption.series[i].markPoint.data = [];
    }
    tempOption.legend.selected = {};
    tempOption.legend.data.map((data) => {
        tempOption.legend.selected[data] = false;
    });
    tempOption.series[0].markLine.data = [];
    res1.map((data) => {
        // var querySel = "select * from s_user where user_id in (" + data.user_id + ")";
        // connection.query(querySel, (err, res2) => {
        //     if(err) {
        //         console.log(err);
        //     } else {
        var res2 = data.users;
        if(res2.length === 1) {
            if(tempOption.series[res2[0].site_id].markPoint.data.length === 0) {
                tempOption.legend.selected[smallOption.series[res2[0].site_id].name] = true;
                tempOption.series[res2[0].site_id].markPoint.data = smallOption.series[res2[0].site_id].markPoint.data;
            }
        } else {
            for(var i = 0, j = res2.length - 1; i < j; i++) {
                var result = false;
                tempOption.legend.selected[smallOption.series[res2[i].site_id].name] = true;
                tempOption.legend.selected[smallOption.series[res2[i + 1].site_id].name] = true;
                tempOption.series[res2[i].site_id].markPoint.data = smallOption.series[res2[i].site_id].markPoint.data;
                tempOption.series[res2[i + 1].site_id].markPoint.data = smallOption.series[res2[i + 1].site_id].markPoint.data;
                result = tempOption.series[0].markLine.data.some((temp) => {
                    if(temp[0].name === res2[i].site_id && temp[1].name === res2[i + 1].site_id) {
                        return true;
                    }
                })
                //console.log(result);
                if(!result) {
                    if(data.sensitive_ === false) {
                        tempOption.series[0].markLine.data.push([
                            {
                                name: res2[i].site_id,
                                site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
                            },
                            {
                                name: res2[i + 1].site_id
                            }
                        ])
                    } else {
                        tempOption.series[0].markLine.data.push([
                            {
                                name: res2[i].site_id,
                                site_name: smallOption.series[res2[i].site_id].name + ' > ' + smallOption.series[res2[i + 1].site_id].name,
                                itemStyle: {
                                    normal: {
                                        color: 'red'
                                    }
                                }
                            },
                            {
                                name: res2[i + 1].site_id
                            }
                        ])
                    }
                }
            }
        }
            // }
        // })
    });
    setTimeout(function() {
        option = tempOption;
        // console.log(option);
        res.send(JSON.stringify(tempOption));
    }, 2000);
        // }
    // })
});

app.get("/light/", (req, res) => {
    var newsid = req.query.newsid;
    // var querySel = "select * from s_news where news_id = " + newsid;
    // connection.query(querySel, (err, res1) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    // if(res1[0].sensitive_ === "true") {
    //
    // }
    var res1;
    trueData.map((data) => {
        if(data.news_id == newsid) {
            res1 = data;
        }
    })
    console.log(res1);
    // var querySel = "select distinct site_id from s_user where user_id in ( " + res1[0].user_id + ")";
    // connection.query(querySel, (err, res2) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    var res2 = res1.users;
    var series = [];
    deepCopy(series, option.series);
    if(res2.length > 1) {
        for(var i = 0, j = res2.length - 1; i < j; i++) {
            var result = series[0].markLine.data.some((temp) => {
                if(temp[0].name === res2[i].site_id && temp[1].name === res2[i + 1].site_id) {
                    temp[0].itemStyle = {
                        normal: {
                            color: 'rgb(249, 113, 4)'
                        }
                    }
                    return true;
                }
            });
            if(!result) {
                series[0].markLine.data.push([
                    {
                        name: res2[i].site_id,
                        site_name: option.series[res2[i].site_id].name + ' > ' + option.series[res2[i + 1].site_id].name,
                        itemStyle: {
                            normal: {
                                color: 'rgb(249, 113, 4)'
                            }
                        }
                    },
                    {
                        name: res2[i + 1].site_id
                    }
                ])
            }
        }
    } else {
        series[res2[0].site_id].markPoint.symbolSize = 30;
        series[res2[0].site_id].markPoint.itemStyle = {
            normal: {
                color: 'rgb(249, 113, 4)'
            }
        };
    }
    res.send(JSON.stringify(series));
        // }
    // });
        // }
    // })
});

app.get('/relation', (req, res) => {
    res.render('relation/index')
})

app.get('/relationAll', (req, res) => {
    res.send([["1913787720","1412983819","701152022","355741893","803075100","115044590","2423724018","176915547","80422871","146650535","2664738440","2637324472","2419300880","1142788567","1108015507","1440135576","105450534","370157198","3255145440","2994441484","24925341","310830119","257858274","46462514","266019944","297412464","1323680444","519571464","17688283","194021607","43287768","2223592112","213350659","17248920","2293399496","34351681","871963218","123662382","3216548288","27839828","1495742436","184977919","415815973","418639169","729611736","554745717","2533427480","85521177","34232288","166990746","57609789","162802181","900041394","841971260","2995996459","3305806895","3010605300","410341157","543399679","39392910","40033921","3240952765","36602660","226988064","290315972","1968899810","152215621","1912352094","200146997","2312825792","62873899","2485131367","2586288284","2946491985","49636798","200620376","183022054","2821285640","99034397","88716910","1135222831","3250735069","709743942","243100683","330143954","51869212","243240424","266706668","556848098","1574160193","392508844","310887462","321787309","27776098","348925593","1043578903","346073703","2746514595","3171566951","69028197","109226535","382270493","945505098","438192834","2784175517","341391332","2724125411","1379288282","29221910","23642374","19346439","2972989222","2188896816","863732094","111442679","2895324383","2319233385","3127069474","3132971004","40931019","248380098","403245020","16682484","19333738","264058981","230826518","528664312","2801148911","87818409","41994925","92236896","179084115","136783758","187446525","320965983","28969593","303167814","1943129364","33936138","260875418","2991432401","14801539","101585197","1024789038","914875898","240595042","2177053338","403687580","545977995","1092242737","557048013","2815284507","3250354656","21303978","3100687943","85603854","263010317","326557654","429375182","30914431","1670601529","505132463","377567696","422872797","869209404","69008563","216776631","44733150","31318016","491605443","2195284522","1167177553","387260239","119333516","2961834682","2219278403","298301187","563946038","498530673","83739434","266740382","55406010","2677985888","45900567","1492810471","546575244","154169277","198859248","318817601","2762760665","322183670","974831917","2291930798","469745465","1675893276","28174274","58616794","2272328204","2264188760","449406924","2569461415","236842564","329940530","19676294","3248734003","258798379","132064939","257137001","58531272","2823447707","1541077633","339950746","316322298","59843216","2911330237","219004568","2832715221","241539181","103983129","492813133","15518710","50168277","2278332463","2906854928","363972381","35931022","430856137","18073623","513538631","2875597940","914855779","305735144","41590593","738730195","280983491","506576497","374154834","3087798564","16988154","340916071","612859753","195453684","3248018899","1364532703","3250336610","2722735394","2466610410","34562480","1053529543","565922653","18302753","274206539","932163222","2207199450","1100877896","708143063","17720657","169605328","2789057836","3222710833","524538459","2418545824","2264821662","415798967","31182204","70107788","229151569","3229250622","439125710","94014267","1480107517","374999248","183229317","20945176","2559195345","54544550","2750667731","2394457285","1380633426","405736288","457635895","29919273","3253004103","38771902","115038550","272044355","157996395","3187136872","305129998","3236288720","118172510","23125238","3017330082","135116543","2214377870","1688136174","3082888488","442455728","1557315432","475284394","20264905","2843401829","63984885","2957738320","162686426","3001107519","210637441","2191198595","2328546882","406704803","1208688338","140228528","2399402691","2437645526","19089408","1636940750","3245501900","2430121958","3039210384","547969112","41107193","869912299","2445365048","20779873","2866128204","273346020","94529233","713059115","175711368","22910295","2282865007","2970464175","33858208","108452049","1015980134","2721220907","599606014","466519303","2975384986","217448715","19346002","472554463","3247893690","56669709","2588646234","43032508","326907278","45985345","57106150","2951430912","250588269","2889702218","471324936","621272930","47319664","497162873","403246803","209003577","96864143","3040513825","1093688526","47296660","1584236773","220009094","208083510","842001846","113655965","19583545","3145386585","1382581100","2523433224","631168571","3135062278","256679007","32577219","3291550739","15665473","890891","1337301116","878418000","1099108880","509133298","419008549","2363153406","989001540","111548466","20012270","26205064","2154743525","297935193","20154994","366843213","2968594919","52857619","2625903878","254135661","308462808","3143536900","117102398","343583867","231654644","18485040","980595266","65988257","2207392993","403255314","21405190","3024816955","754961546","720934412","259435698","3042401235","213969309","391209163","907018699","20151466","294383735","829465538","114579382","739784130","572297334","3265656782","928142569","1117890128","24742040","1548426074","214447648","631078417","334720088","619070934","2172532502","834316544","492878714","19113188","357382924","1076880614","2798263046","1337543342","20132853","30709245","271676592","2194275287","79826674","2648348845","19454665","2510015247","3250420716",""],["2214377870 572297334 1043578903 294383735 2214377870 46462514 65988257 2399402691 2177053338 ","869209404 45900567 3145386585 23642374 1382581100 ","3240952765 405736288 2970464175 85603854 ","28174274 3236288720 524538459 554745717 240595042 ","1636940750 1024789038 1636940750 1024789038 ","162802181 329940530 374154834 914855779 ","195453684 113655965 99034397 47296660 ","509133298 429375182 2762760665 2154743525 1135222831 ","176915547 57106150 19454665 841971260 1913787720 ","260875418 20154994 339950746 343583867 ","387260239 22910295 22910295 58531272 ","320965983 22910295 22910295 58531272 ","266019944 22910295 22910295 58531272 ","298301187 22910295 22910295 58531272 ","374999248 22910295 22910295 58531272 ","403687580 22910295 22910295 58531272 ","200620376 22910295 22910295 58531272 ","69028197 22910295 22910295 58531272 ","79826674 22910295 22910295 58531272 ","415798967 22910295 22910295 58531272 ","513538631 22910295 22910295 58531272 ","257137001 22910295 22910295 58531272 ","2906854928 22910295 22910295 58531272 ","318817601 22910295 22910295 58531272 ","366843213 22910295 22910295 58531272 ","254135661 22910295 22910295 58531272 ","442455728 3143536900 256679007 442455728 ","471324936 38771902 194021607 17720657 471324936 ","51869212 22910295 22910295 58531272 ","418639169 22910295 22910295 58531272 ","241539181 2319233385 1675893276 1412983819 ","1688136174 22910295 22910295 58531272 ","118172510 305129998 472554463 17248920 505132463 ","136783758 2588646234 30709245 1912352094 1364532703 370157198 ","43287768 22910295 22910295 58531272 ","2219278403 22910295 22910295 58531272 ","3127069474 22910295 22910295 58531272 ","422872797 22910295 22910295 58531272 ","438192834 41590593 94014267 28969593 ","1541077633 70107788 41994925 498530673 229151569 3247893690 ","83739434 22910295 22910295 58531272 ","152215621 1093688526 346073703 56669709 162686426 33858208 334720088 430856137 236842564 2394457285 19089408 ","19346002 330143954 45985345 19346002 ","2272328204 31318016 2957738320 406704803 2994441484 3265656782 ","2875597940 16682484 226988064 114579382 2815284507 219004568 41107193 ","321787309 3245501900 271676592 321787309 ","701152022 22910295 22910295 58531272 ","410341157 863732094 34232288 18073623 ","1092242737 869912299 154169277 2328546882 ","2972989222 1670601529 907018699 23125238 ","1142788567 310830119 1099108880 1142788567 ","187446525 382270493 111548466 2746514595 ","248380098 556848098 2961834682 357382924 ","2194275287 2510015247 878418000 900041394 ","449406924 29919273 2437645526 32577219 ","415815973 2721220907 621272930 403245020 403246803 439125710 403255314 ","543399679 3291550739 878418000 900041394 ","273346020 1943129364 19333738 2843401829 ","3040513825 40931019 184977919 980595266 ","2866128204 2889702218 36602660 2866128204 3255145440 3229250622 ","3171566951 2946491985 739784130 363972381 27776098 259435698 209003577 ","2312825792 2466610410 2569461415 2312825792 ","1440135576 348925593 392508844 1108015507 ","2821285640 200146997 175711368 466519303 2363153406 216776631 ","3087798564 50168277 2951430912 231654644 ","546575244 377567696 546575244 2282865007 ","989001540 1076880614 2832715221 2724125411 989001540 217448715 ","3001107519 297935193 3305806895 2195284522 2784175517 2823447707 2798263046 ","85521177 80422871 932163222 117102398 ","19113188 1100877896 88716910 1100877896 ","109226535 243240424 2264821662 266740382 ","457635895 2533427480 457635895 1015980134 2968594919 ","1323680444 2801148911 24742040 2188896816 ","303167814 22910295 22910295 58531272 ","3010605300 2418545824 3010605300 2991432401 2291930798 ","59843216 62873899 34351681 57609789 ","250588269 2485131367 140228528 54544550 619070934 ","3187136872 132064939 94529233 316322298 ","1337543342 2664738440 1574160193 1584236773 ","214447648 3042401235 1053529543 18485040 ","2172532502 1492810471 2172532502 2430121958 2648348845 1480107517 ","3082888488 3017330082 2995996459 631168571 ","3248734003 3250735069 41994925 3250354656 498530673 ","1495742436 2445365048 290315972 103983129 ","55406010 708143063 17688283 24925341 20012270 ","208083510 1379288282 166990746 547969112 ","3248018899 3250735069 41994925 3250354656 3250420716 ","391209163 69008563 213969309 115044590 ","308462808 179084115 21405190 52857619 2895324383 34562480 ","2750667731 2278332463 2677985888 3039210384 ","2523433224 33936138 738730195 20132853 ","1968899810 3250336610 21303978 49636798 26205064 ","565922653 2207199450 264058981 871963218 ","326557654 945505098 355741893 492878714 1380633426 ","497162873 829465538 528664312 280983491 ","729611736 419008549 834316544 1557315432 ","557048013 96864143 557048013 183229317 3222710833 ","272044355 44733150 272044355 30914431 ","198859248 243100683 198859248 2911330237 ","123662382 305735144 305735144 135116543 ","27839828 713059115 119333516 341391332 111442679 2223592112 ","2207392993 1337301116 3216548288 16988154 3253004103 2586288284 ","322183670 20779873 928142569 1548426074 29221910 322183670 475284394 ","2559195345 257858274 2559195345 2264188760 220009094 1208688338 169605328 ","492813133 63984885 213350659 101585197 263010317 ","720934412 709743942 115038550 210637441 ","183022054 39392910 40931019 803075100 ","105450534 274206539 19346439 19676294 ","15518710 310887462 612859753 15518710 ","58616794 40033921 108452049 20945176 ","2293399496 2625903878 2191198595 599606014 2722735394 ","31182204 519571464 842001846 890891 ","3135062278 3100687943 19583545 545977995 18302753 491605443 326907278 974831917 ","914875898 20151466 87818409 157996395 47319664 ","35931022 258798379 266706668 631078417 ","1167177553 506576497 2637324472 3132971004 ","230826518 563946038 230826518 754961546 146650535 340916071 ","1117890128 2789057836 14801539 20264905 ","3024816955 2419300880 469745465 297412464 43032508 ","2975384986 15665473 2423724018 92236896 ",""]])
})

app.get('/relationSearch', (req, res) => {
    var userId = req.query.userId;
    var options = {
        url: "http://114.215.164.11:5000/api/v1.0/search/" + userId
    }
    request(options, (err, response, body) => {
        if (err) {
            throw err;
        }
        res.send(body);
    });
})

app.get('/relationDetail', (req, res) => {
    var name = req.query.name;
    var options = {
        url: "http://114.215.164.11:5000/api/v1.0/get_user/" + name
    }
    request(options, (err, response, body) => {
        if (err) {
            throw err;
        }
        var html = "";
        body = JSON.parse(body);
        html += "<h3>推文id: " + body.news_id + "</h3>";
        html += "<h3>用户id: " + body.user_id + "</h3>";
        if(body.site_id) {
            html += "<h3>地点: " + hashTable[body.site_id] + "</h3>";
        }
        if(body.sensitive_ === true) {
            html += "<h3 style='color: red;'>是否敏感: 敏感</h3>";
        } else {
            html += "<h3>是否敏感: 不敏感</h3>";
        }
        html += "<h3>时间: " + body.time + "</h3>";
        res.send(html);
    });
})

app.get('/threat', (req, res) => {
    res.render('threat/index');
})

app.get('/threatInit', (req, res) => {
    var options = {
        url: "http://114.215.164.11:5000/api/v1.0/model_init/0"
    }
    request(options, (err, response, body) => {
        if (err) {
            throw err;
        }
        var data = {
            terror: [],
            normal: []
        }
        JSON.parse(body).map((temp) => {
            if(temp.isTerrorism === "true") {
                data.terror.push(temp);
            } else {
                data.normal.push(temp);
            }
        })
        res.send(data);
    });
})

app.get('/threatSearch', (req, res) => {
    var options = {
        url: "http://114.215.164.11:5000/api/v1.0/model_pre/" + req.query.content
    }
    request(options, (err, response, body) => {
        if (err) {
            throw err;
        }
        if(JSON.parse(body).isTerrorism === 'true') {
            res.send('该内容为敏感信息')
        } else {
            res.send('该内容不为敏感信息')
        }
    });
})

app.get('/heatInit', (req, res) => {
    var querySel = 'select * from s_site';
    connection.query(querySel, (err, res1) => {
        if(err) {
            console.log(err)
        }
        var data = [];
        res1.map((temp) => {
            data.push({
                id: Number(temp.id),
                site_x: Number(temp.site_x),
                site_y: Number(temp.site_y)
            })
        })
        res.send(data);
    })
})

// It is important to catch any errors from the proxy or the
// server will crash. An example of this is connecting to the
// server when webpack is bundling
proxy.on('error', function(e) {
    console.log('Could not connect to proxy, please try again...');
});


app.listen(port, function() {
    console.log('Server running on port' + port);
});
