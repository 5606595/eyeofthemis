/**
 * Created by jorten on 16/3/27.
 */
import '../public/styles/main.less'

import echarts from 'echarts/src/echarts'

import 'echarts/src/chart/map'

import config from 'echarts/src/config'

import $ from 'jquery'

import NProgress from 'nprogress/nprogress'

import 'nprogress/nprogress.css'

let myChart = echarts.init(document.getElementById("container"));

let smallChart = echarts.init(document.getElementById("smaller"));

var data, news = {}, site, flag = true, isSearch = false, searched = false, active = null, locked = false, newsSearch = {}, dataSearch;

let storage = window.localStorage;

// if(storage && storage.getItem("table")) {
//     data = JSON.parse(storage.getItem("table"));
// } else {
//     $.get('/tableinit', (item) => {
//         let storage = window.localStorage;
//         if(storage) {
//             storage.setItem("table", item);
//         }
//         data = JSON.parse(item);
//     });
// }

if(storage && storage.getItem("site")) {
    site = JSON.parse(storage.getItem("site"));
} else {
    $.get('/siteinit').done( (item) => {
        console.log(item);
        let storage = window.localStorage;
        if(storage) {
            storage.setItem("site", item);
        }
        site = JSON.parse(item);
    });
}

$.ajax({
    url: "/tableinit",
    async: false,
    success: (res) => {
        data = JSON.parse(res);
        deepCopy(news, data);
    }
})


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

var tbody = $("<tbody>");

var time = 1;

$("#table").append(tbody);

let option = {};

let smallOption = {};

$.get("/site", (data) => {
    option = JSON.parse(data).option;
    option.tooltip.formatter = new Function("param", option.tooltip.formatter);
    smallOption = JSON.parse(data).smallOption;
    smallOption.tooltip.formatter = new Function("param", smallOption.tooltip.formatter);
    myChart.setOption(option);
    smallChart.setOption(smallOption);
});

function timeChange() {
    if(!locked) {
        if($("#time").text() == 0) {
            refresh();
        } else {
            if(Number($("#time").text()) % 5 === 0 && $("#table").find("tr:not(.often)")[1]) {
                $("#table").find("tr:not(.often)")[1].remove();
            }
            $("#time").text(Number($("#time").text()) - 1);
        }
    }
}

function refresh() {
    locked = true;
    NProgress.start();
    var senNum = 0;
    var tr = "";
    console.log(data);
    data.sensitive.map((temp) => {
        if(temp.id > 20 * (time - 1) && temp.id <= 20 * time) {
            tr += "<tr class='often'><td class='sensitive'>" + temp.user_id + "</td>" +
                "<td>" + temp.news_content + "</td>" +
                "<td>" + temp.news_id + "</td></tr>";
            senNum++;
        }
    });
    //
    data.normal.splice(0, 20 - senNum).map((temp) => {
        tr += "<tr><td>" + temp.user_id + "</td>" +
            "<td>" + temp.news_content + "</td>" +
            "<td>" + temp.news_id + "</td></tr>";
    });
    $.get("/refresh?time=" + time, (data) => {
        // console.log(data);
        option = JSON.parse(data);
        option.tooltip.formatter = new Function("param", option.tooltip.formatter);
        myChart.clear();
        myChart.setOption(option, true);
        time++;
        tbody.html(tr);
        window.setTimeout(() => NProgress.done(), 1000);
        $("#time").text(60);
        locked = false;
    });
    isSearch = false;
}


$(".search").submit((event) => {
    event.preventDefault();
    console.log($("#text").val());
    $.ajax({
        url: '/search',
        data: {
            type: $("#choose").attr("title"),
            id: $("#text").val()
        },
        type: 'POST',
        error: (err) => console.log(err),
        success: (item) => {
            if(!flag) {
                convert();
            }
            dataSearch = JSON.parse(item).data;
            deepCopy(newsSearch, dataSearch)
            option = JSON.parse(item).option;
            option.tooltip.formatter = new Function("param", option.tooltip.formatter);
            myChart.clear();
            myChart.setOption(option, true);
            searched = true;
            isSearch = true;
        }
    });
});

function convert() {
    option.legend.show = flag ? false : true;
    smallOption.legend.show = flag ? true : false;
    $("#border").attr("class", "ani");
    myChart.clear();
    myChart.setOption(flag ? smallOption : option, true);
    smallChart.clear();
    smallChart.setOption(flag ? option : smallOption, true);
    flag = !flag;
    if(searched) {
        isSearch = !isSearch;
    }
}

$("#border").click(convert);

$("#border").on("animationend", () => {
    $("#border").attr("class", "");
});

$(".searchicon").click(() => {
    $(".searchicon").css("display", "none");
    $(".search").css("transform", "translate3d(-50%, 0, 0)")
});

$('#container').click(() => {
    $(".search").css("transform", "translate3d(-50%, -150%, 0)")
    $(".searchicon").css("display", "block");
});

myChart.on(config.EVENT.CLICK, function(param) {
    if(isSearch) {
        if(param.name !== 'United Kingdom') {
            $("#detailhide").css("display", "none");
            $("#ui").css("display", "block");
            $("#i").css("display", "none");
            if(/ > /.test(param.name)) {
                var sites = param.name.split(' > ');
                $.get('/connectionSearch?site1=' + sites[0] + '&site2=' + sites[1],
                    (item) => {
                        console.log(param);
                        console.log(item);
                        // var active = item.active.map(data => {
                        //     return news[data.news_id - 1];
                        // });
                        // var normal = item.normal.map(data => {
                        //     return news[data.news_id - 1];
                        // });
                        $("#data-aside .title").text(param.data.site_name);
                        $("#slidetable thead tr td").text("动态内容");
                        var tbody = "";
                        item.active.map((data) => {
                            tbody += "<tr><td class='active' data-newsid='" + data.news_id + "'>" + data.news_content + "</td></tr>";
                        })
                        item.normal.map((data) => {
                            tbody += "<tr><td data-newsid='" + data.news_id + "'>" + data.news_content + "</td></tr>";
                        })
                        $("#slidetable tbody").html(tbody);
                    });
            } else {
                $.get('locationSearch?site=' + param.name, (item) => {
                    $("#data-aside .title").text("地点: " + param.seriesName);
                    $("#slidetable thead tr td").text("用户id");
                    console.log(item);
                    var tbody = "";
                    item.active.map((data) => {
                        tbody += "<tr><td class='active' data-time='" + data.time + "' data-news_id='" + data.news_id + "' data-userid='" + data.user_id + "'>" + data.user_id + "</td></tr>";
                    })
                    item.normal.map((data) => {
                        tbody += "<tr><td data-time='" + data.time + "' data-news_id='" + data.news_id + "' data-userid='" + data.user_id + "'>" + data.user_id + "</td></tr>";
                    })
                    $("#slidetable tbody").html(tbody);
                });
            }
        }
    } else {
        if(param.name !== 'United Kingdom') {
            $("#detailhide").css("display", "none");
            $("#ui").css("display", "block");
            $("#i").css("display", "none");
            if(/ > /.test(param.name)) {
                var sites = param.name.split(' > ');
                $.get('/connection?site1=' + sites[0] + '&site2=' + sites[1],
                 (item) => {
                    console.log(param);
                     console.log(item);
                    // var active = item.active.map(data => {
                    //     return news[data.news_id - 1];
                    // });
                    // var normal = item.normal.map(data => {
                    //     return news[data.news_id - 1];
                    // });
                     $("#data-aside .title").text(param.data.site_name);
                     $("#slidetable thead tr td").text("动态内容");
                    var tbody = "";
                    item.active.map((data) => {
                        tbody += "<tr><td class='active' data-newsid='" + data.news_id + "'>" + data.news_content + "</td></tr>";
                    })
                    item.normal.map((data) => {
                        tbody += "<tr><td data-newsid='" + data.news_id + "'>" + data.news_content + "</td></tr>";
                    })
                    $("#slidetable tbody").html(tbody);
                });
            } else {
                $.get('location?site=' + param.name, (item) => {
                    $("#data-aside .title").text("地点: " + param.seriesName);
                    $("#slidetable thead tr td").text("用户id");
                    console.log(item);
                    var tbody = "";
                    item.active.map((data) => {
                        tbody += "<tr><td class='active' data-time='" + data.time + "' data-news_id='" + data.news_id + "' data-userid='" + data.user_id + "'>" + data.user_id + "</td></tr>";
                    })
                    item.normal.map((data) => {
                        tbody += "<tr><td data-time='" + data.time + "' data-news_id='" + data.news_id + "' data-userid='" + data.user_id + "'>" + data.user_id + "</td></tr>";
                    })
                    $("#slidetable tbody").html(tbody);
                });
            }
        }
    }
});
$("#slidetable tbody").delegate("td", "click", (event) => {
    if(isSearch) {
        var frag = "";
        if(event.target.getAttribute("data-newsid")) {
            // var p = news[event.target.getAttribute("data-newsid") - 1]
            var p;
            newsSearch.normal.map((temp) => {
                if(temp.news_id == event.target.getAttribute("data-newsid")) {
                    p = temp;
                }
            });
            newsSearch.sensitive.map((temp) => {
                if(temp.news_id == event.target.getAttribute("data-newsid")) {
                    p = temp;
                }
            })
            if(p.news_detail) {
                $("#detailhide .logo h2").html("<span class='sensitive'>动态id: " + p.news_id + "</span>");
                $("#detailhide .logo div").html("<p>动态内容: " + p.news_detail + "</p>");
            } else {
                $("#detailhide .logo h2").html("动态id: " + p.news_id);
                $("#detailhide .logo div").html("<p>动态内容: " + p.news_content + "</p>");
            }
            frag += "<h1>相关用户</h1>";
            p.users.filter((temp1) => {
                return temp1.sensitive_ === true;
            }).map((temp) => {
                frag += "<div class='col-1'>" +
                    "<h3>用户id</h3>" +
                    "<p class='sensitive'>" + temp.user_id + "</p>" +
                    "</div>" +
                    "<div class='col-2'>" +
                    "<h3>地点</h3>" +
                    "<p>" + site[temp.site_id - 1].name + "</p>" +
                    "</div>" +
                    "<div class='col-3'>" +
                    "<h3>发布时间</h3>" +
                    "<p>" + temp.time + "</p>" +
                    "</div>";
            });
            p.users.filter((temp1) => {
                return temp1.sensitive_ === false;
            }).map((temp) => {
                frag += "<div class='col-1'>" +
                    "<h3>用户id</h3>" +
                    "<p>" + temp.user_id + "</p>" +
                    "</div>" +
                    "<div class='col-2'>" +
                    "<h3>地点</h3>" +
                    "<p>" + site[temp.site_id - 1].name + "</p>" +
                    "</div>" +
                    "<div class='col-3'>" +
                    "<h3>发布时间</h3>" +
                    "<p>" + temp.time + "</p>" +
                    "</div>";
            });
            $("#detailhide .about").html(frag);
            $("#detailhide").css("display", "block");
            // });
        } else if(event.target.getAttribute("data-userid")) {
            $("#detailhide .logo div").html("");
            if(event.target.getAttribute("class") === "active") {
                $("#detailhide .logo h2").html("<span class='sensitive'>用户id: " + event.target.getAttribute("data-userid") + "</span>");
            } else {
                $("#detailhide .logo h2").html("用户id: " + event.target.getAttribute("data-userid") + "</span>");
            }
            if(event.target.getAttribute("data-news_id")) {
                var p;
                console.log(event.target.getAttribute("data-news_id"));
                newsSearch.normal.map((temp) => {
                    if(temp.news_id == event.target.getAttribute("data-news_id")) {
                        p = temp;
                    }
                });
                newsSearch.sensitive.map((temp) => {
                    if(temp.news_id == event.target.getAttribute("data-news_id")) {
                        p = temp;
                    }
                })
                if(p.news_detail) {
                    frag += "<h1>发布动态</h1>" +
                        "<div class='col-1'>" +
                        "<h3>动态</h3>" +
                        "<p>id: " + p.news_id + "</p>" +
                        "<p>content: " + p.news_detail + "</p>" +
                        "</div>" +
                        "<div class='col-2'>" +
                        "<h3>发布时间</h3>" +
                        "<p>" + event.target.getAttribute("data-time") + "</p>" +
                        "</div>" +
                        "<div class='col-3'>" +
                        "<h3>相关用户</h3>" +
                        p.user_id +
                        "</div>";
                } else {
                    frag += "<h1>发布动态</h1>" +
                        "<div class='col-1'>" +
                        "<h3>动态</h3>" +
                        "<p>id: " + p.news_id + "</p>" +
                        "<p>content: " + p.news_content + "</p>" +
                        "</div>" +
                        "<div class='col-2'>" +
                        "<h3>发布时间</h3>" +
                        "<p>" + event.target.getAttribute("data-time") + "</p>" +
                        "</div>" +
                        "<div class='col-3'>" +
                        "<h3>相关用户</h3>" +
                        p.user_id +
                        "</div>";
                }
            }
            $("#detailhide .about").html(frag);
            $("#detailhide").css("display", "block");
        }
    } else {
        var frag = "";
        if(event.target.getAttribute("data-newsid")) {
            // var p = news[event.target.getAttribute("data-newsid") - 1]
            var p;
            news.normal.map((temp) => {
                if(temp.news_id == event.target.getAttribute("data-newsid")) {
                    p = temp;
                }
            });
            news.sensitive.map((temp) => {
                if(temp.news_id == event.target.getAttribute("data-newsid")) {
                    p = temp;
                }
            })
            if(p.news_detail) {
                $("#detailhide .logo h2").html("<span class='sensitive'>动态id: " + p.id + "</span>");
                $("#detailhide .logo div").html("<p>动态内容: " + p.news_detail + "</p>");
            } else {
                $("#detailhide .logo h2").html("动态id: " + p.id);
                $("#detailhide .logo div").html("<p>动态内容: " + p.news_content + "</p>");
            }
            frag += "<h1>相关用户</h1>";
            p.users.filter((temp1) => {
                return temp1.sensitive_ === true;
            }).map((temp) => {
                frag += "<div class='col-1'>" +
                    "<h3>用户id</h3>" +
                    "<p class='sensitive'>" + temp.user_id + "</p>" +
                    "</div>" +
                    "<div class='col-2'>" +
                    "<h3>地点</h3>" +
                    "<p>" + site[temp.site_id - 1].name + "</p>" +
                    "</div>" +
                    "<div class='col-3'>" +
                    "<h3>发布时间</h3>" +
                    "<p>" + temp.time + "</p>" +
                    "</div>";
            });
            p.users.filter((temp1) => {
                return temp1.sensitive_ === false;
            }).map((temp) => {
                frag += "<div class='col-1'>" +
                    "<h3>用户id</h3>" +
                    "<p>" + temp.user_id + "</p>" +
                    "</div>" +
                    "<div class='col-2'>" +
                    "<h3>地点</h3>" +
                    "<p>" + site[temp.site_id - 1].name + "</p>" +
                    "</div>" +
                    "<div class='col-3'>" +
                    "<h3>发布时间</h3>" +
                    "<p>" + temp.time + "</p>" +
                    "</div>";
            });
            $("#detailhide .about").html(frag);
            $("#detailhide").css("display", "block");
            // });
        } else if(event.target.getAttribute("data-userid")) {
            $("#detailhide .logo div").html("");
            if(event.target.getAttribute("class") === "active") {
                $("#detailhide .logo h2").html("<span class='sensitive'>用户id: " + event.target.getAttribute("data-userid") + "</span>");
            } else {
                $("#detailhide .logo h2").html("用户id: " + event.target.getAttribute("data-userid") + "</span>");
            }
            if(event.target.getAttribute("data-news_id")) {
                var p;
                console.log(event.target.getAttribute("data-news_id"));
                news.normal.map((temp) => {
                    if(temp.news_id == event.target.getAttribute("data-news_id")) {
                        p = temp;
                    }
                });
                news.sensitive.map((temp) => {
                    if(temp.news_id == event.target.getAttribute("data-news_id")) {
                        p = temp;
                    }
                })
                if(p.news_detail) {
                    frag += "<h1>发布动态</h1>" +
                        "<div class='col-1'>" +
                        "<h3>动态</h3>" +
                        "<p>id: " + p.news_id + "</p>" +
                        "<p>content: " + p.news_detail + "</p>" +
                        "</div>" +
                        "<div class='col-2'>" +
                        "<h3>发布时间</h3>" +
                        "<p>" + event.target.getAttribute("data-time") + "</p>" +
                        "</div>" +
                        "<div class='col-3'>" +
                        "<h3>相关用户</h3>" +
                        p.user_id +
                        "</div>";
                } else {
                    frag += "<h1>发布动态</h1>" +
                        "<div class='col-1'>" +
                        "<h3>动态</h3>" +
                        "<p>id: " + p.news_id + "</p>" +
                        "<p>content: " + p.news_content + "</p>" +
                        "</div>" +
                        "<div class='col-2'>" +
                        "<h3>发布时间</h3>" +
                        "<p>" + event.target.getAttribute("data-time") + "</p>" +
                        "</div>" +
                        "<div class='col-3'>" +
                        "<h3>相关用户</h3>" +
                        p.user_id +
                        "</div>";
                }
            }
            $("#detailhide .about").html(frag);
            $("#detailhide").css("display", "block");
        }
    }
});
$("#aside").delegate("i", "click", (event) => {
    $("#aside").css("display", "none");
});
$("#detail").delegate("i", "click", (event) => {
    $("#detail").css("display", "none");
});
$("#table").delegate("tr", "click", (event) => {
    if(!isSearch) {
        if(event.currentTarget.lastChild.textContent.trim()) {
            $.get("/light?newsid=" + event.currentTarget.lastChild.textContent.trim(), (data) => {
                if(active) {
                    active.classList.remove("active");
                }
                event.currentTarget.classList.add("active");
                active = event.currentTarget;
                option.series = JSON.parse(data);
                myChart.clear();
                myChart.setOption(option, true);
            })
        }
    }
});
$(".nav-container").delegate("button", "click", (event) => {
    if(event.target.getAttribute("ui-sref") === "monitor") {
        console.log("explore");
        $("#nav1").css("display", "block");
        $("#home").css("transform", "translate3d(-100%, 0, 0)");
        $(".nav-hide").css("transform", "translate3d(0, 0, 0)");
        console.log($("#home"));
    } else if(event.target.getAttribute("ui-sref") === "warning") {
        console.log("tables");
        $("#nav2").css("display", "block");
        $("#home").css("transform", "translate3d(-100%, 0, 0)");
        $(".nav-hide").css("transform", "translate3d(0, 0, 0)");
    } else if(event.target.getAttribute("ui-sref") === "search") {
        $(".searchicon").css("display", "none");
        $(".search").css("transform", "translate3d(-50%, 0, 0)")
    }
});

$(".nav-hide").delegate(".back", "click", (event) => {
    event.preventDefault();
    $(".nav-hide").css("transform", "translate3d(100%, 0, 0)");
    $("#home").css("transform", "translate3d(0%, 0, 0)");
    $(event.target.parentNode.parentNode).css("display", "none");
});

$("#i").click(() => {
    $("#ui").css("display", "block");
    $("#i").css("display", "none");
});

$("#opacity").click(() => {
    $("#ui").css("display", "none");
    $("#i").css("display", "block");
});

$("#cancel").click(() => {
    $("#cancel").parent().css("display", "none");
});
$("#chooseSearch").delegate('a', 'click', (eve) => {
    if(eve.target.getAttribute("data-id") === "user") {
        $("#choose").attr("title", "user");
        $("#choose").text("用户id")
    }
    if(eve.target.getAttribute("data-id") === "news") {
        $("#choose").attr("title", "news");
        $("#choose").text("动态id")
    }
    if(eve.target.getAttribute("data-id") === "content") {
        $("#choose").attr("title", "content");
        $("#choose").text("动态内容")
    }
})

window.setInterval(timeChange, 1000);





