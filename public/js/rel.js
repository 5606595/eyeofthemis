/**
 * Created by jorten on 16/3/14.
 */
var myChart = echarts.init(document.getElementById("container"));
var categories = [], isSearch = false;
for (var i = 0; i < 9; i++) {
    categories[i] = {
        name: '类目' + i
    };
}
var option = {
    title: {
        text: 'Les Miserables',
        subtext: 'Default layout',
        top: 'bottom',
        left: 'right'
    },
    tooltip: {
        formatter: function(param) {
            return param.name;
        }
    },
    series : [
        {
            name: 'Les Miserables',
            type: 'graph',
            layout: 'none',
            hoverAnimation: false,
            data: [],
            links: [],
            categories: categories,
            roam: true,
            label: {
                normal: {
                    position: 'right',
                    formatter: '{b}'
                }
            },
            lineStyle: {
                normal: {
                    curveness: 0.3
                }
            },

        }
    ]
};
myChart.showLoading();

$.ajax({
    cache: false,
    async: false,
    // contentType: "application/x-www-form-urlencoded; charset=utf-8",
    url: "/relationAll",
    // dataType: "json",
    type: "GET",
    // traditional: true,
    data: {
        id: ""
    },
    error: function () {
        alert('请求超时');
    },
    success: function(data) {
        var arr = [];
        var hash = {};
        var mainX, mainY;
        for(var i = 0, j = data[1].length - 1; i < j; i++) {
            arr.push(data[1][i].split(' '));
        }
        var count = 0;
        var odd = true;
        var j = arr.length;
        var sqrt = (Math.floor(Math.sqrt(j)) + 1);
        var initangel = 0;
        var nowangel;
        var deta;
        var radius;
        for(var line = 0, m = sqrt - 1; line < m; line++) {
            for(var col = Number(odd), n = (sqrt - 1) * 2; col < n; col = col + 2) {
                var q = arr[count].length;
                if(!hash[arr[count][0]]) {
                    mainX = col;
                    mainY = line;
                    realX = mainX + (Math.random() - 0.5) * 0.8;
                    realY = mainY + (Math.random() - 0.5) * 0.8;
                    option.series[0].data.push({
                        //id: arr[count][0],
                        name: arr[count][0],
                        x: realX,
                        y: realY,
                        symbolSize: q * 0.08,
                        category: count % 9
                    });
                    hash[arr[count][0]] = 1;
                }
                deta = Math.PI * 2 / (q - 2);
                nowangel = initangel;
                for(var p = 1; p < q - 1; p++) {
                    if(!hash[arr[count][p]]) {
                        nowangel = nowangel + deta;
                        radius = Math.random() * 0.1 + 0.45;
                        option.series[0].data.push({
                            //id: arr[count][p],
                            name: arr[count][p],
                            x: realX + radius * Math.cos(nowangel),
                            y: realY + radius * Math.sin(nowangel),
                            symbolSize: 0.1 + Math.random() * 0.1,
                            category: Math.floor(Math.random() * 10)
                        });
                        hash[arr[count][p]] = 1;
                    }
                }
                count++;
                initangel += Math.PI / 6;
            }
            odd = !odd;
        }
        if((j - count) % 2 === 0) {
            var left = (j - count) / 2;
            for(var line = 3; line < left; line = line + 2) {
                var q = arr[count].length;
                if(!hash[arr[count][0]]) {
                    mainX = sqrt * 2 - 2;
                    mainY = sqrt - line - 1;
                    realX = mainX + (Math.random() - 0.5) * 0.8;
                    realY = mainY + (Math.random() - 0.5) * 0.8;
                    option.series[0].data.push({
                        //id: arr[count][0],
                        name: arr[count][0],
                        x: realX,
                        y: realY,
                        symbolSize: q * 0.08,
                        category: count % 9
                    });
                    hash[arr[count][0]] = 1;
                }
                deta = Math.PI * 2 / (q - 2);
                nowangel = initangel;
                for(var p = 1; p < q - 1; p++) {
                    if(!hash[arr[count][p]]) {
                        nowangel = nowangel + deta;
                        option.series[0].data.push({
                            //id: arr[count][p],
                            name: arr[count][p],
                            x: realX + radius * Math.cos(nowangel),
                            y: realY + radius * Math.sin(nowangel),
                            symbolSize: 0.1 + Math.random() * 0.1,
                            category: Math.floor(Math.random() * 10)
                        });
                        hash[arr[count][p]] = 1;
                    }
                }
                count++;
                initangel += Math.PI / 6;
            }
            for(var col = 3; col < left; col = col + 2) {
                var q = arr[count].length;
                if(!hash[arr[count][0]]) {
                    mainX = sqrt * 2 - col - 2;
                    mainY = sqrt - 1;
                    realX = mainX + (Math.random() - 0.5) * 0.8;
                    realY = mainY + (Math.random() - 0.5) * 0.8;
                    option.series[0].data.push({
                        //id: arr[count][0],
                        name: arr[count][0],
                        x: realX,
                        y: realY,
                        symbolSize: q * 0.08,
                        category: count % 9
                    });
                    hash[arr[count][0]] = 1;
                }
                for(var p = 1; p < q - 1; p++) {
                    if(!hash[arr[count][p]]) {
                        nowangel = nowangel + deta;
                        option.series[0].data.push({
                            //id: arr[count][p],
                            name: arr[count][p],
                            x: realX + radius * Math.cos(nowangel),
                            y: realY + radius * Math.sin(nowangel),
                            symbolSize: 0.1 + Math.random() * 0.1,
                            category: Math.floor(Math.random() * 10)
                        });
                        hash[arr[count][p]] = 1;
                    }
                }
                count++;
                initangel += Math.PI / 6;
            }
        }
        if((j - count) % 2 === 1) {
            var left = (j - count - 1) / 2;
            for(var line = 3; line < left; line = line + 2) {
                var q = arr[count].length;
                if(!hash[arr[count][0]]) {
                    mainX = sqrt * 2 - 2;
                    mainY = sqrt - line - 1;
                    realX = mainX + (Math.random() - 0.5) * 0.8;
                    realY = mainY + (Math.random() - 0.5) * 0.8;
                    option.series[0].data.push({
                        //id: arr[count][0],
                        name: arr[count][0],
                        x: realX,
                        y: realY,
                        symbolSize: q * 0.08,
                        category: count % 9
                    });
                    hash[arr[count][0]] = 1;
                }
                for(var p = 1, q = arr[count].length - 1; p < q; p++) {
                    if(!hash[arr[count][p]]) {
                        nowangel = nowangel + deta;
                        option.series[0].data.push({
                            //id: arr[count][p],
                            name: arr[count][p],
                            x: realX + radius * Math.cos(nowangel),
                            y: realY + radius * Math.sin(nowangel),
                            symbolSize: 0.1 + Math.random() * 0.1,
                            category: Math.floor(Math.random() * 10)
                        });
                        hash[arr[count][p]] = 1;
                    }
                }
                count++;
                initangel += Math.PI / 6;
            }
            for(var col = 3; col < left; col = col + 2) {
                var q = arr[count].length;
                if(!hash[arr[count][0]]) {
                    mainX = sqrt * 2 - col - 2;
                    mainY = sqrt - 1;
                    realX = mainX + (Math.random() - 0.5) * 0.8;
                    realY = mainY + (Math.random() - 0.5) * 0.8;
                    option.series[0].data.push({
                        //id: arr[count][0],
                        name: arr[count][0],
                        x: realX,
                        y: realY,
                        symbolSize: q * 0.08,
                        category: count % 9
                    });
                    hash[arr[count][0]] = 1;
                }
                for(var p = 1, q = arr[count].length - 1; p < q; p++) {
                    if(!hash[arr[count][p]]) {
                        nowangel = nowangel + deta;
                        option.series[0].data.push({
                            //id: arr[count][p],
                            name: arr[count][p],
                            x: realX + radius * Math.cos(nowangel),
                            y: realY + radius * Math.sin(nowangel),
                            symbolSize: 0.1 + Math.random() * 0.1,
                            category: Math.floor(Math.random() * 10)
                        });
                        hash[arr[count][p]] = 1;
                    }
                }
                count++;
                initangel += Math.PI / 6;
            }
            if(!hash[arr[j-1][0]]) {
                var q = arr[count].length;
                mainX = sqrt * 2 - 2;
                mainY = sqrt - 1;
                realX = mainX + (Math.random() - 0.5) * 0.8;
                realY = mainY + (Math.random() - 0.5) * 0.8;
                option.series[0].data.push({
                    //id: arr[j-1][0],
                    name: arr[j-1][0],
                    x: realX,
                    y: realY,
                    symbolSize: q * 0.08,
                    category: (j-1) % 9
                });
                for(var p = 1, q = arr[j-1].length - 1; p < q; p++) {
                    if(!hash[arr[j-1][p]]) {
                        option.series[0].data.push({
                            //id: arr[j-1][p],
                            name: arr[j-1][p],
                            x: realX + radius * Math.cos(nowangel),
                            y: realY + radius * Math.sin(nowangel),
                            symbolSize: 0.1 + Math.random() * 0.1,
                            category: Math.floor(Math.random() * 10)
                        });
                        hash[arr[j-1][p]] = 1;
                    }
                }
            }
        }
        for(var i = 0, j = arr.length; i < j; i++) {
            for(var p = 0, q = arr[i].length - 1; p < q; p++) {
                option.series[0].links.push({
                    source: arr[i][p],
                    target: arr[i][p+1]
                });
            }
        }
    }
});
myChart.setOption(option);
myChart.hideLoading();
console.log(option);
$("#search form").submit(function(event) {
    event.preventDefault();
    isSearch = true;
    var userId = $("#search form input").val();
    $.ajax({
        url: "/relationSearch",
        type: "GET",
        data: {
            userId: userId
        },
        error: function () {
            alert('请求超时');
        },
        success: function(data) {
            var option = {
                title: {
                    text: '用户社交关系网络',
                    top: 'top',
                    left: 'center'
                },
                tooltip: {
                    formatter: function(param) {
                        //console.log(param)
                        return param.name;
                    }
                },
                series : [
                    {
                        name: 'Les Miserables',
                        type: 'graph',
                        layout: 'none',
                        hoverAnimation: false,
                        data: [],
                        links: [],
                        categories: categories,
                        roam: true,
                        label: {
                            normal: {
                                position: 'right',
                                formatter: '{b}'
                            }
                        },
                        lineStyle: {
                            normal: {
                                curveness: 0.3
                            }
                        },

                    }
                ]
            };
            data = JSON.parse(data);
            var arr = [];
            arr = data; 
            var hash = {};
            var mainX, mainY;
            var count = 0;
            var odd = true;
            var j = arr.length;
            var sqrt = (Math.floor(Math.sqrt(j)) + 1);
            var initangel = 0;
            var nowangel;
            var deta;
            var radius;
            for(var line = 0, m = sqrt - 1; line < m; line++) {
                for(var col = Number(odd), n = (sqrt - 1) * 2; col < n; col = col + 2) {
                    var q = arr[count].length;
                    if(!hash[arr[count][0]]) {
                        mainX = col;
                        mainY = line;
                        realX = mainX + (Math.random() - 0.5) * 0.8;
                        realY = mainY + (Math.random() - 0.5) * 0.8;
                        option.series[0].data.push({
                            //id: arr[count][0],
                            name: arr[count][0],
                            x: realX,
                            y: realY,
                            symbolSize: q * 0.08,
                            category: count % 9
                        });
                        hash[arr[count][0]] = 1;
                    }
                    deta = Math.PI * 2 / (q - 1);
                    nowangel = initangel;
                    for(var p = 1; p < q; p++) {
                        if(!hash[arr[count][p]]) {
                            nowangel = nowangel + deta;
                            radius = Math.random() * 0.1 + 0.45;
                            option.series[0].data.push({
                                //id: arr[count][p],
                                name: arr[count][p],
                                x: realX + radius * Math.cos(nowangel),
                                y: realY + radius * Math.sin(nowangel),
                                symbolSize: 0.1 + Math.random() * 0.1,
                                category: Math.floor(Math.random() * 10)
                            });
                            hash[arr[count][p]] = 1;
                        }
                    }
                    count++;
                    initangel += Math.PI / 6;
                }
                odd = !odd;
            }
            if((j - count) % 2 === 0) {
                var left = (j - count - 1) / 2;
                for(var line = 3; line < left; line = line + 2) {
                    var q = arr[count].length;
                    if(!hash[arr[count][0]]) {
                        mainX = sqrt * 2 - 2;
                        mainY = sqrt - line - 1;
                        realX = mainX + (Math.random() - 0.5) * 0.8;
                        realY = mainY + (Math.random() - 0.5) * 0.8;
                        option.series[0].data.push({
                            //id: arr[count][0],
                            name: arr[count][0],
                            x: realX,
                            y: realY,
                            symbolSize: q * 0.08,
                            category: count % 9
                        });
                        hash[arr[count][0]] = 1;
                    }
                    deta = Math.PI * 2 / (q - 1);
                    nowangel = initangel;
                    for(var p = 1; p < q; p++) {
                        if(!hash[arr[count][p]]) {
                            nowangel = nowangel + deta;
                            option.series[0].data.push({
                                //id: arr[count][p],
                                name: arr[count][p],
                                x: realX + radius * Math.cos(nowangel),
                                y: realY + radius * Math.sin(nowangel),
                                symbolSize: 0.1 + Math.random() * 0.1,
                                category: Math.floor(Math.random() * 10)
                            });
                            hash[arr[count][p]] = 1;
                        }
                    }
                    count++;
                    initangel += Math.PI / 6;
                }
                for(var col = 3; col < left; col = col + 2) {
                    var q = arr[count].length;
                    if(!hash[arr[count][0]]) {
                        mainX = sqrt * 2 - col - 2;
                        mainY = sqrt - 1;
                        realX = mainX + (Math.random() - 0.5) * 0.8;
                        realY = mainY + (Math.random() - 0.5) * 0.8;
                        option.series[0].data.push({
                            //id: arr[count][0],
                            name: arr[count][0],
                            x: realX,
                            y: realY,
                            symbolSize: q * 0.08,
                            category: count % 9
                        });
                        hash[arr[count][0]] = 1;
                    }
                    for(var p = 1; p < q; p++) {
                        if(!hash[arr[count][p]]) {
                            nowangel = nowangel + deta;
                            option.series[0].data.push({
                                //id: arr[count][p],
                                name: arr[count][p],
                                x: realX + radius * Math.cos(nowangel),
                                y: realY + radius * Math.sin(nowangel),
                                symbolSize: 0.1 + Math.random() * 0.1,
                                category: Math.floor(Math.random() * 10)
                            });
                            hash[arr[count][p]] = 1;
                        }
                    }
                    count++;
                    initangel += Math.PI / 6;
                }
            }
            if((j - count) % 2 === 1) {
                var left = (j - count - 1) / 2;
                for(var line = 3; line < left; line = line + 2) {
                    var q = arr[count].length;
                    if(!hash[arr[count][0]]) {
                        mainX = sqrt * 2 - 2;
                        mainY = sqrt - line - 1;
                        realX = mainX + (Math.random() - 0.5) * 0.8;
                        realY = mainY + (Math.random() - 0.5) * 0.8;
                        option.series[0].data.push({
                            //id: arr[count][0],
                            name: arr[count][0],
                            x: realX,
                            y: realY,
                            symbolSize: q * 0.08,
                            category: count % 9
                        });
                        hash[arr[count][0]] = 1;
                    }
                    for(var p = 1, q = arr[count].length - 1; p < q; p++) {
                        if(!hash[arr[count][p]]) {
                            nowangel = nowangel + deta;
                            option.series[0].data.push({
                                //id: arr[count][p],
                                name: arr[count][p],
                                x: realX + radius * Math.cos(nowangel),
                                y: realY + radius * Math.sin(nowangel),
                                symbolSize: 0.1 + Math.random() * 0.1,
                                category: Math.floor(Math.random() * 10)
                            });
                            hash[arr[count][p]] = 1;
                        }
                    }
                    count++;
                    initangel += Math.PI / 6;
                }
                for(var col = 3; col < left; col = col + 2) {
                    var q = arr[count].length;
                    if(!hash[arr[count][0]]) {
                        mainX = sqrt * 2 - col - 2;
                        mainY = sqrt - 1;
                        realX = mainX + (Math.random() - 0.5) * 0.8;
                        realY = mainY + (Math.random() - 0.5) * 0.8;
                        option.series[0].data.push({
                            //id: arr[count][0],
                            name: arr[count][0],
                            x: realX,
                            y: realY,
                            symbolSize: q * 0.08,
                            category: count % 9
                        });
                        hash[arr[count][0]] = 1;
                    }
                    for(var p = 1, q = arr[count].length - 1; p < q; p++) {
                        if(!hash[arr[count][p]]) {
                            nowangel = nowangel + deta;
                            option.series[0].data.push({
                                //id: arr[count][p],
                                name: arr[count][p],
                                x: realX + radius * Math.cos(nowangel),
                                y: realY + radius * Math.sin(nowangel),
                                symbolSize: 0.1 + Math.random() * 0.1,
                                category: Math.floor(Math.random() * 10)
                            });
                            hash[arr[count][p]] = 1;
                        }
                    }
                    count++;
                    initangel += Math.PI / 6;
                }
                if(!hash[arr[j-1][0]]) {
                    var q = arr[count].length;
                    mainX = sqrt * 2 - 2;
                    mainY = sqrt - 1;
                    realX = mainX + (Math.random() - 0.5) * 0.8;
                    realY = mainY + (Math.random() - 0.5) * 0.8;
                    option.series[0].data.push({
                        //id: arr[j-1][0],
                        name: arr[j-1][0],
                        x: realX,
                        y: realY,
                        symbolSize: q * 0.08,
                        category: (j-1) % 9
                    });
                    for(var p = 1, q = arr[j-1].length - 1; p < q; p++) {
                        if(!hash[arr[j-1][p]]) {
                            option.series[0].data.push({
                                //id: arr[j-1][p],
                                name: arr[j-1][p],
                                x: realX + radius * Math.cos(nowangel),
                                y: realY + radius * Math.sin(nowangel),
                                symbolSize: 0.1 + Math.random() * 0.1,
                                category: Math.floor(Math.random() * 10)
                            });
                            hash[arr[j-1][p]] = 1;
                        }
                    }
                }
            }
            for(var i = 0, j = arr.length; i < j; i++) {
                for(var p = 0, q = arr[i].length - 1; p < q; p++) {
                    option.series[0].links.push({
                        source: arr[i][p],
                        target: arr[i][p+1]
                    });
                }
            }
            myChart.clear();
            myChart.setOption(option, true);
        }
    })
});

function stopWheel(event) {
    event.preventDefault();
}

// $("#login").click(function(event) {
//     event.preventDefault();
//     $("#white").css("display", "block");
//     $("#white").css("opacity", "0.8");
//     $("#form").css("display", "block");
//     $("#form").css("left");
//     $("#form").css("opacity", "1");
//     $("#form").css("left");
//     $("#form").css("transform", "translate3d(-50%, -50%, 0)");
//     document.querySelector("body").addEventListener("wheel", stopWheel, false);
// });

function disappear() {
    $("#form").css("display", "none");
}

$(".icon-exit").click(function(event) {
    $("#form").css("transform", "translate3d(-50%, -40%, 0)");
    $("#form").css("left");
    $("#form").css("opacity", "0.3");
    setTimeout(disappear, 200);
    $("#white").css("opacity", "0");
    $("#white").css("display", "none");
    document.querySelector("body").removeEventListener("wheel", stopWheel, false);
});

myChart.on('click', function(param) {
    if(isSearch) {
        if(param.data.name) {
            var name = param.data.name;
            $.ajax({
                url: 'relationDetail?name=' + name,
                method: 'GET',
                success: function(data) {
                    $("#white").css("display", "block");
                    $("#white").css("opacity", "0.8");
                    $("#form .content").html(data);
                    $("#form").css("display", "block");
                    $("#form").css("left");
                    $("#form").css("opacity", "1");
                    $("#form").css("left");
                    $("#form").css("transform", "translate3d(-50%, -50%, 0)");
                    document.querySelector("body").addEventListener("wheel", stopWheel, false);
                }
            })
        }
    }
})

/**
 * Created by jorten on 16/3/14.
 */
