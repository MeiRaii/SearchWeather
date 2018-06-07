
var oInp = document.getElementById("inp"),
    oList = document.getElementById("list"),
    oLi = oList.children,
    oSea = document.getElementById("btn");

var aWeather = document.getElementById("weather"),
    aShow_cityname = document.getElementsByClassName("show_cityname")[0],
    aWeather_icon = document.getElementsByClassName("weather_icon")[0],
    aShow_icon_temp = document.getElementsByClassName("show_icon_temp")[0],
    aShow_pollution_name = document.getElementsByClassName("show_pollution_name")[0],
    aShow_pollution_num = document.getElementsByClassName("show_pollution_num")[0];

//页面 一刷新input框就获取焦点
oInp.focus();
//input框中内容发生改变的事件
oInp.oninput = eFn;
//input框获得焦点事件
oInp.onfocus = function () {
    eFn.call(this);
    this.sVal = this.value;
}
//失去焦点事件
oInp.onblur = function () {
    setTimeout(function () {
        oList.innerHTML = "";
    },200);
}

//键盘点击抬起事件
oInp.onkeyup = function (ev) {
    ev = ev || window.event;
    var val = this.value;
    var keyCode = ev.keyCode;
    if(keyCode !== 40 && keyCode !== 38){
        this.sVal = val;
        this.index = 0;
    }
    if(keyCode === 13){
        console.log(111);
        val ? window.location.href = "https://www.baidu.com/s?wd="+val : window.location.href = "https://www.baidu.com";
        this.blur();
    }else if(keyCode === 40 || keyCode === 38){
        UpOrDown.call(this,keyCode);
        //阻止默认事件
        ev.preventDefault && ev.preventDefault();
        return false;
    }

}

//搜索点击事件
oSea.onclick = function () {
    console.log("baidu");
    var val = oInp.value;
    val ? window.location.href = "https://www.baidu.com/s?wd="+val :"";
}
//键盘上下键点击函数
function UpOrDown(keyCode) {
    for(var i=0; i<oLi.length; i++){
        oLi[i].children[0].className = "";
    }
    if(keyCode === 38){
        this.index--;
        if(this.index<0) this.index = oLi.length;
    }else{
        this.index ++;
        this.index %= oLi.length + 1;
    }
    if(this.index){
        this.value = oLi[this.index-1].children[0].innerHTML;
        oLi[this.index-1].children[0].className = "active";
    }else{
        this.value = this.sVal;
    }

}

//请求jsonp的事件函数
function eFn() {
    var val = this.value;
    //上下键获取内容的编号
    this.index=0;
    if(val) {
        var scr = document.createElement("script");
        scr.src = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd="+val+"&cb=zg&_=1521260069116";
        document.body.appendChild(scr);

        scr.onload = function () {
            document.body.removeChild(scr);
        }
    }else{
        oList.innerHTML = "";
    }
}

function zg( json ) {
    //清理ul里面的内容
    oList.innerHTML = "";
    console.log(json);
    var data = json.s;

    for(var i=0,length=4; i<length; i++){
        var wd = data[i];
        var aLi = document.createElement("li");
        aLi.innerHTML = "<a target='_self' href='https://www.baidu.com/s?wd="+wd+"'>"+ wd +"</a>";
        aLi.onclick = function () {
            oInp.value = this.children[0].innerHTML;
        }
        if(wd){
            oList.appendChild(aLi);
        }

    }
}


/*天气部分*/
//获取用户所在城市信息
~function showCityInfo() {
    //实例化城市查询类
    var citysearch = new AMap.CitySearch();
    //自动获取用户IP，返回当前城市
    citysearch.getLocalCity(function(status, result) {
        if (status === 'complete' && result.info === 'OK') {
            if (result && result.city && result.bounds) {
                var cityinfo = result.city;//长沙市  要转换成长沙
                cityinfo = cityinfo.substring(0,cityinfo.length-1);
                //当获取到地点时再执行获取天气函数
                getWeather(cityinfo);
            }
        } else {
            console.log(result.info);
        }
    });
}();

function formatterDateTime() {
    var date=new Date()
    var month=date.getMonth() + 1
    var datetime = date.getFullYear()
        + ""// "年"
        + (month >= 10 ? month : "0"+ month)
        + ""// "月"
        + (date.getDate() < 10 ? "0" + date.getDate() : date
            .getDate())
        + ""
        + (date.getHours() < 10 ? "0" + date.getHours() : date
            .getHours())
        + ""
        + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date
            .getMinutes())
        + ""
        + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date
            .getSeconds());
    return datetime;

}
function getWeather(cityinfo) {
    $.ajax({
        type: 'post',
        url: 'http://route.showapi.com/9-2',
        dataType: 'json',
        data: {
            "showapi_timestamp": formatterDateTime(),
            "showapi_appid": '62379', //这里需要改成自己的appid
            "showapi_sign": 'b8a34df2796c4f68a5be6641c86fd4dc',  //这里需要改成自己的应用的密钥secret
            "area":cityinfo,
            "needMoreDay":"1", //是否需要返回7天数据中的后4天。
            "needIndex":"1",//是否需要返回指数数据
        },

        error: function(XmlHttpRequest, textStatus, errorThrown) {
            alert("操作失败!");
        },
        success: function(result) {
            success_weather(result); //console变量在ie低版本下不能用
        }
    });
};

function success_weather(data) {
    //console.log(data.showapi_res_body);
    var wea = data.showapi_res_body;
    aShow_cityname.innerHTML = wea.cityInfo.c3 + ':';//城市名
    aWeather_icon.style.background = 'url('+wea.now.weather_pic+') no-repeat center/100%';//天气图片
    aShow_icon_temp.innerHTML = wea.now.temperature + '℃';//温度
    aShow_pollution_name.innerHTML = wea.now.aqiDetail.quality;//空气质量
    aShow_pollution_num.innerHTML = wea.now.aqiDetail.pm10;//颗粒物（粒径小于等于10μm）1小时平均

    aWeather.onclick = function () {
        //console.log(wea);
        var val = wea.cityInfo.c3+'天气预报';
        window.location.href = "https://www.baidu.com/s?wd="+val;
    }

}
