
// var server = 'http://192.168.137.1:3000';
var server = 'http://134.175.217.178:3000';
// var server = 'http://192.168.56.1:3000';

var Group = {
    'SY_BOX': { 'header': 'SY_header', 'Group': 'SY_Group', 'headerh': 50 },
    'FX_BOX': { 'header': 'FX_header', 'Group': 'FX_Group', 'headerh': 0 },
    'FJ_BOX': { 'header': 'FJ_header', 'Group': 'FJ_Group', 'headerh': 130 },
    'ME_BOX': { 'header': 'ME_header', 'Group': 'ME_Group', 'headerh': 150 }
}
function loginwin() {

    api.openWin({
        name: 'Z_denglu',
        url: './Z_pt_header.html',
        bounces: false,
        pageParam: { biaoti: '登录', html: 'Z_denglu' }
    });

}

//版本比较



//自动更新
function updataapp() {
    api.ajax({
        url: server + '/api/updataapp',
        method: 'post',
        timeout: 10,
        dataType: 'json',
        returnAll: false,
        data: {
            values: { appVersion: api.appVersion }
        }
    }, function (ret, err) {
        if (ret.length > 0) {
            var result = ret[0];
            var str = '新版本型号:' + result.appVersion + ';更新提示语:' + result.updateTip + '发布时间:' + result.addtime;
            api.confirm({
                title: '有新的版本,是否下载并安装 ',
                // msg: str,
                buttons: ['确定', '取消']
            }, function (ret, err) {
                if (ret.buttonIndex == 1) {
                    if (api.systemType == "android") {
                        api.download({
                            url: server + '/api/updataapp/download',
                            report: true
                        }, function (ret, err) {
                            if (ret && 0 == ret.state) {/* 下载进度 */
                                api.toast({
                                    msg: "正在下载应用" + ret.percent + "%",
                                    duration: 2000
                                });
                            }
                            if (ret && 1 == ret.state) {/* 下载完成 */
                                var savePath = ret.savePath;
                                api.installApp({
                                    appUri: savePath
                                });
                            }
                        });
                    }
                    if (api.systemType == "ios") {
                        api.installApp({
                            appUri: result.source
                        });
                    }
                }
            });

        }

    });
}


//自动登录
function autologin(zhanghao) {
    var deviceid = api.deviceId
    api.ajax({
        url: server + '/api/login',
        method: 'post',
        timeout: 10,
        dataType: 'json',
        returnAll: false,
        data: {
            values: {
                logintype: 'auto',
                zhanghao: zhanghao,
                deviceid: deviceid
            }
        }
    }, function (ret, err) {
        ret=ret[0]  
        if (ret.zhuangtai) {
            $api.setStorage('islogin', 'true');
            api.sendEvent({
                name: 'loginOK',
                extra: { key: ret }
            });
        } else {
            $api.setStorage('islogin', 'false');
            api.toast({
                msg: '自动登录失败',
                duration: 2000,
                location: 'bottom'
            });
        };
    });
}

function getDate(dateTimeStamp, datahms) {
    var date = new Date(dateTimeStamp)
    var H = date.getHours();
    var M = date.getMinutes();
    var D = date.getDate()
    if (H < 10) {
        H = '0' + H
    }
    if (M < 10) {
        M = '0' + M
    }
    //  var date= d.setTime(dateTimeStamp);
    var datetime = H + ":" + M
    // console.log(datetime)
    return datetime
}


function get_YMD(dateTimeStamp) {
    let date = new Date(dateTimeStamp)


    let Y = date.getFullYear();
    let M = date.getMonth() + 1;
    let D = date.getDate()
    if (M < 10) {
        M = '0' + M
    }
    if (D < 10) {
        D = '0' + D
    }
    //  var date= d.setTime(dateTimeStamp);
    let datetime = Y + "-" + M + "-" + D
    // console.log(datetime)
    return datetime
}

function get_YMDHM(dateTimeStamp) {
    let date = new Date(dateTimeStamp)
    let Y = date.getFullYear();
    let M = date.getMonth() + 1;
    let D = date.getDate()
    let H = date.getHours()
    let m = date.getMinutes()
    if (M < 10) {
        M = '0' + M
    }
    if (D < 10) {
        D = '0' + D
    }
    if (H < 10) {
        H = '0' + H
    }
    if (m < 10) {
        m = '0' + m
    }
    //  var date= d.setTime(dateTimeStamp);
    let datetime = Y + "-" + M + "-" + D + " " + H + ":" + m
    // console.log(datetime)
    return datetime
}
//根据经纬度算距离
function getDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000 * 1000;

    if (s >= 1000) {
        return (s / 1000).toFixed(2)
    } else {
        return (s / 1000).toFixed(3)
    }

}

//百度坐标转高德（传入经度、纬度）
function bd_decrypt(bd_lng, bd_lat) {
    var X_PI = Math.PI * 3000.0 / 180.0;
    var x = bd_lng - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return { lon: gg_lng, lat: gg_lat }
}
//高德坐标转百度（传入经度、纬度）
function bd_encrypt(gg_lng, gg_lat) {
    var X_PI = Math.PI * 3000.0 / 180.0;
    var x = gg_lng, y = gg_lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return {
        bd_lat: bd_lat,
        bd_lon: bd_lng
    };
}


//打开百度地图 并标点；
//data: 地图上标点数据,lon，lat:字段名
var map_button_isopen = false;
var bmap_isopen = false;
function map_button_open() {
    var bMap = api.require('bMap');
    var button = api.require('UIButton');
    if (map_button_isopen) {
        button.show({ id: 0 })
    }
    else {
        map_button_isopen = true
        button.open({
            rect: {
                x: api.frameWidth - 65,
                y: api.frameHeight - 185,
                w: 50,
                h: 50
            },
            bg: {
                normal: '#67D1E8'
            },
            corner: 10,
            title: {
                size: 30,
                highlight: '⊙',
                active: '⊙',
                normal: '⊙',
                normalColor: '#fff'
            },
            fixedOn: api.frameName,
            fixed: true,
            move: true
        }, function (ret, err) {
            if (ret.eventType == 'click') {
                bMap.showUserLocation({
                    isShow: true,
                    trackingMode: 'none'
                });
            }
        });
    }

}

function open_bmap(data, ziduan_lon, ziduan_lat, ziduan_name, set_bottom_data) {
    var bMap = api.require('bMap');
    api.setFrameAttr({
        name: api.frameName,
        bounces: false
    });
    if (bmap_isopen) {
        set_bottom_data(0);
        map_button_open();
        bMap.show()
    } else {
        bmap_isopen = true
        bMap.open({
            rect: {
                x: 0,
                y: 0,
                w: api.winWidth,
                h: api.frameHeight - 120
            },
            zoomLevel: 13,
            showUserLocation: true,
            fixedOn: api.frameName,
            fixed: true
        }, function (ret) {
            if (ret.status) {
                map_button_open()
                set_bottom_data(0)
                setTimeout(() => {
                    bMap.setCenter({ coords: { lon: data[0][ziduan_lon], lat: data[0][ziduan_lat] }, animation: TextTrackCue });
                    bMap.popupBubble({ id: 0 });
                }, 1000);
                let annotations = [];
                for (let i = 0; i < data.length; i++) {
                    let element = data[i];
                    let sssdata = {}
                    sssdata.id = i;
                    sssdata.lon = element[ziduan_lon];
                    sssdata.lat = element[ziduan_lat];
                    sssdata.size = 40;
                    annotations.push(sssdata);
                    let BytesLength = getBytesLength(element[ziduan_name])
                    bMap.setBubble({
                        id: i,
                        bgImg: 'widget://image/ui/ditu_wenzi_kuang.png',
                        rect: {
                            x: 10,
                            y: 5,
                            w: 160,
                            h: 5
                        },
                        content: {
                            title: element[ziduan_name],
                            // subTitle: '',
                            //illus: 'widget://image/ui/you.png'
                        },
                        styles: {
                            titleColor: '#FF0000',
                            titleSize: 18,
                            subTitleColor: '#999',
                            subTitleSize: 12,
                            illusAlign: 'left',
                            w: BytesLength * 25,
                            h: 60
                        }
                    }, function (ret1) {

                    });
                }
                bMap.addAnnotations({
                    annotations: annotations,
                    icon: 'widget://image/ui/map_dian.png',
                    draggable: true
                }, function (ret) {
                    if (ret) {
                        set_bottom_data(ret.id)
                        let lon = data[ret.id][ziduan_lon]
                        let lat = data[ret.id][ziduan_lat]
                        bMap.setCenter({
                            coords: {
                                lon: lon,
                                lat: lat
                            },
                            animation: true
                        });
                    }
                });

                bMap.stopLocation();

            }
        });

    }
}

//计算字符串的字节数
function getBytesLength(str) {
    // 在GBK编码里，除了ASCII字符，其它都占两个字符宽
    return str.replace(/[^\x00-\xff]/g, 'xx').length;
}

//调起导航
function map_start_info(lat, lon, name) {
    var dialogBox = api.require('dialogBox');
    dialogBox.actionMenu({
        rect: {
            h: 120
        },
        tapClose: true,
        items: [
            {
                text: '高德地图',
                icon: 'widget://image/ui/gaodelogo.png'
            },
            {
                text: '百度地图',
                icon: 'widget://image/ui/baidulogo.png'
            }
        ],
        styles: {
            bg: '#FFF',
            column: 3,
            itemText: {
                color: '#000',
                size: 14,
                marginT: 8
            },
            itemIcon: {
                size: 50
            }

        }
    }, function (ret) {
        let gd_gps = bd_decrypt(lon, lat)
        let appBundle;
        let gaodehref;
        let baiduhref;
        function js_a_href(href) {
            var a = document.createElement('a');
            a.setAttribute('href', href);
            a.setAttribute('id', 'js_a');
            //防止反复添加
            if (document.getElementById('js_a')) {
                document.body.removeChild(document.getElementById('js_a'));
            }
            document.body.appendChild(a);
            a.click();
        }
        if (ret.index == 0) {
            //高德导航
            if (api.systemType == 'ios') {
                appBundle = 'iosamap'
                gaodehref = 'iosamap://navi?sourceApplication=flc&poiname=' + name
                    + '&lat=' + gd_gps.lat
                    + '&lon=' + gd_gps.lon
                    + '&dev=0';
            } else if (api.systemType == 'android') {
                appBundle = 'com.autonavi.minimap'
                gaodehref = 'androidamap://navi?sourceApplication=flc&poiname=' + name
                    + '&lat=' + gd_gps.lat
                    + '&lon=' + gd_gps.lon
                    + '&dev=0';

            }
            var installed = api.appInstalled({
                sync: true,
                appBundle: appBundle
            });
            if (installed) {
                js_a_href(gaodehref)
            } else {
                toast('应用未安装')
            }

        } else if (ret.index == 1) {
            //百度导航
            if (api.systemType == 'ios') {
                appBundle = 'baidumap'
                baiduhref = 'bdapp://map/direction?destination= name:' + name
                    + '|latlng:' + lat
                    + ',' + lon
                    + '&coord_type=bd09ll&mode=driving&src=andr.baidu.openAPIdemo'

            } else if (api.systemType == 'android') {
                appBundle = 'com.baidu.BaiduMap'
                baiduhref = 'bdapp://map/direction?destination= name:' + name
                    + '|latlng:' + lat
                    + ',' + lon
                    + '&coord_type=bd09ll&mode=driving&src=andr.baidu.openAPIdemo'

            }
            var installed = api.appInstalled({
                sync: true,
                appBundle: appBundle
            });
            if (installed) {
                js_a_href(baiduhref)
            } else {
                toast('应用未安装')
            }
        }
    });
}

function getDateDiff(dateTimeStamp) {

    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - dateTimeStamp;
    if (diffValue < 0) { return; }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    if (monthC >= 1) {
        result = "" + parseInt(monthC) + "月前";
    } else if (weekC >= 1) {
        result = "" + parseInt(weekC) + "周前";
    } else if (dayC >= 1) {
        result = "" + parseInt(dayC) + "天前";
    } else if (hourC >= 1) {
        result = "" + parseInt(hourC) + "小时前";
    } else if (minC >= 1) {
        result = "" + parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    return result;
}
//fuli页请求数据
function ajax_post(leibie, yx) {
    api.ajax({
        url: server + '/api/yx/' + leibie + '/' + yx,
        method: 'post',
        timeout: 30,
        dataType: 'json',
        returnAll: false
    }, function (ret, err) {
        if (ret.length > 0) {
            // TODO 
            for (let index = 0; index < ret.length; index++) {

                ret[index].time = getDateDiff(ret[index].time)
                ret[index].starttime = getDate(ret[index].starttime)
                ret[index].endtime = getDate(ret[index].endtime)
            }
            apibox.error = false;
            apibox.data = ret

        } else {
            if (yx == 'zonghe' & leibie == 'zixun') {
                api.showProgress({
                    title: '',
                    text: ' 加载数据失败',
                    modal: true
                });

                setInterval(function () {
                    api.hideProgress();
                }, 1000);
            }

            apibox.error = true;
            apibox.errormsg = '没有查询到数据'

        };
        api.refreshHeaderLoadDone()
    });
}
//输入弹窗
function dialogBoxinput(title, placeholder, ziduan, cb) {
    var dialogBox = api.require('dialogBox');
    dialogBox.input({
        keyboardType: 'default',
        texts: {
            title: title,
            placeholder: placeholder,
            leftBtnTitle: '取消',
            rightBtnTitle: '确定'
        },
        styles: {
            bg: '#fff',
            corner: 5,
            w: 400,
            h: 140,
            title: {
                h: 30,
                alignment: 'left',
                size: 18,
                color: '#000',
                marginT: 15,
            },
            input: {
                h: 30,
                y: 30,
                alignment: 'left',
                marginT: 15,
                marginLeft: 10,
                marginRight: 10,
                textSize: 14,
                textColor: '#000',
            },
            dividingLine: {
                width: 0.5,
                color: '#696969'
            },
            left: {
                bg: 'rgba(0,0,0,0)',
                color: '#007FFF',
                size: 16
            },
            right: {
                bg: 'rgba(0,0,0,0)',
                color: '#007FFF',
                size: 16,
                widhtBorder: 1
            }
        }
    }, function (ret) {
        if (ret.eventType == 'left') {
            // var dialogBox = api.require('dialogBox');
            dialogBox.close({
                dialogName: 'input'
            });
        } else if (ret.eventType == 'right') {
            if (getBytesLength(ret.text) > 14) {
                alert('不能超过7个字（两个英文字母算一个字）')
                return
            } else if (getBytesLength(ret.text) < 8) {
                alert('不能少于4个字（两个英文字母算一个字）')
                return
            }
            let data = {
                user: $api.getStorage('user'),
                md5password: $api.getStorage('md5password'),
                ziduan: ziduan,
                zhi: ret.text
            }
            zdy_ajax(
                '/api/user/updata_user',
                data,
                function (ret) {
                    if (ret.zhuangtai) {
                        dialogBox.close({
                            dialogName: 'input'
                        });
                        toast('修改成功');
                        cb(data.zhi)
                        api.sendEvent({
                            name: 'autologin',
                        });
                    }
                }
            )
        }
    });
}


function dialogBoxinput2(title, placeholder, reg, cb) {
    var dialogBox = api.require('dialogBox');
    dialogBox.input({
        keyboardType: 'default',
        texts: {
            title: title,
            placeholder: placeholder,
            leftBtnTitle: '取消',
            rightBtnTitle: '确定'
        },
        styles: {
            bg: '#fff',
            corner: 5,
            w: 400,
            h: 140,
            title: {
                h: 30,
                alignment: 'left',
                size: 18,
                color: '#000',
                marginT: 15,
            },
            input: {
                h: 30,
                y: 30,
                alignment: 'left',
                marginT: 15,
                marginLeft: 10,
                marginRight: 10,
                textSize: 14,
                textColor: '#000',
            },
            dividingLine: {
                width: 0.5,
                color: '#696969'
            },
            left: {
                bg: 'rgba(0,0,0,0)',
                color: '#007FFF',
                size: 16
            },
            right: {
                bg: 'rgba(0,0,0,0)',
                color: '#007FFF',
                size: 16,
                widhtBorder: 1
            }
        }
    }, function (ret) {
        if (ret.eventType == 'left') {
            // var dialogBox = api.require('dialogBox');
            dialogBox.close({
                dialogName: 'input'
            });
        } else if (ret.eventType == 'right') {
            if (reg.test(ret.text)) {
                cb(ret.text)
            } else {
                alert('输入不符合要求')
            }
        }
    });
}
//全局图片查看

function chakan_img(images) {  //images为[];
    api.openWin({
        name: 'Z_photoBrowser_win',
        url: './Z_photoBrowser_win.html',
        bounces: false,
        pageParam: { images: images }
    });
}
//获取评论信息
//全局toast
function toast(msg) {
    api.toast({
        msg: msg,
        duration: 2000,
        location: 'bottom',
        global: true
    });
}



//救援通知函数
function write_jiuyuan_tongzhi(id) {
    let str_tongzhi = api.getGlobalData({
        key: 'jiuyuan_tongzhi_id'
    });
    let objtongzhi = JSON.parse(str_tongzhi)
    objtongzhi.push(id)
    api.setGlobalData({
        key: 'jiuyuan_tongzhi_id',
        value: JSON.stringify(objtongzhi)
    });
}
function close_jiuyuan_tongzhi() {
    let str_tongzhi = api.getGlobalData({
        key: 'jiuyuan_tongzhi_id'
    });
    let objtongzhi = JSON.parse(str_tongzhi)
    objtongzhi.forEach(element => {
        api.cancelNotification({
            id: element
        });
    });
}
function open_jiuyuan_xinxi() {
    api.openWin({
        name: 'jiuyuan_xinxi',
        url: './Z_pt_map_header.html',
        bounces: true,
        reload: true,
        pageParam: {
            biaoti: '救援信息',
            html: 'Z_jiuyuan_xinxi',
        }
    });
}



//获取配置信息
function get_config() {
    let config = api.getGlobalData({
        key: 'config'
    });

    if (config) {
        return config
    } else {
        return new Promise(function (resolve, reject) {
            api.ajax({
                url: server + '/api/config',
                method: 'post',
                timeout: 10,
                dataType: 'json',
                returnAll: false,
            }, function (ret, err) {
                if (ret.zhuangtai) {
                    resolve(ret.config)
                } else {
                    reject({ zhuangtai: false, msg: '连接服务器失败' })
                }
            });
        }).then(data => {
            api.setGlobalData({
                key: 'config',
                value: data
            });
            return data
        }).catch(err => {
            toast(err.msg)
        })

    }

}
//验证车牌号
function isVehicleNumber(vehicleNumber) {
    var result = false;
    if (vehicleNumber.length == 7) {
        var express = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/;
        result = express.test(vehicleNumber);
    }
    return result;
}
//ajax
function zdy_ajax(url, data, func, fcf) {
    api.ajax({
        url: server + url,
        method: 'post',
        timeout: 10,
        dataType: 'json',
        returnAll: false,
        data: {
            values: data
        }
    }, function (ret, err) {
        func(ret)
    });



}
//进度提示
function showProgress(title, text) {
    api.showProgress({
        title: title,
        text: text,
        modal: true
    });
}

function hiddenframegroup(frame, framegroup) {
    for (var i = 0; i < frame.length; i++) {
        api.setFrameAttr({
            name: frame[i],
            hidden: true
        });
    }
    for (var i = 0; i < framegroup.length; i++) {
        api.setFrameGroupAttr({
            name: framegroup[i],
            hidden: true
        });
    }
}

function showframegroup(frame, framegroup) {
    for (var i = 0; i < frame.length; i++) {
        api.setFrameAttr({
            name: frame[i],
            hidden: false
        });
    }
    for (var i = 0; i < framegroup.length; i++) {
        api.setFrameGroupAttr({
            name: framegroup[i],
            hidden: false
        });
    }
}
//获取昵称函数

// var bx_xiangmu = {
//     jiaoqiangxian: {
//         title: '交强险',
//         type: 'jiaoqiangxian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     },
//     chechuanshui: {
//         title: '车船税',
//         type: 'chechuanshui',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     },
//     chesunxian: {
//         title: '机动车损失险',
//         type: 'chesunxian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: '',
//         bjmp: {
//             qianzhi: false,
//             is_mai: 0
//         }
//     },

//     sanzhexian: {
//         title: '第三者责任险',
//         type: 'sanzhexian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['20万', '50万', '100万', '150万'],
//         jieguo: '',
//         bjmp: {
//             qianzhi: false,
//             is_mai: 0
//         }
//     },
//     sijixian: {
//         title: '车上人员（司机）险',
//         type: 'sijixian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['1万', '5万', '10万'],
//         jieguo: '',
//         bjmp: {
//             qianzhi: false,
//             is_mai: 0
//         }
//     },
//     chengkexian: {
//         title: '车上人员（乘客）险',
//         type: 'chengkexian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['1万', '5万', '10万'],
//         jieguo: '',
//         bjmp: {
//             qianzhi: false,
//             is_mai: 0
//         }
//     },
//     daoqiangxian: {
//         title: '机动车盗抢险',
//         type: 'daoqiangxian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     },
//     sheshuixian: {
//         title: '涉水险',
//         type: 'sheshuixian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     },
//     bolixian: {
//         title: '玻璃单独破碎险',
//         type: 'bolixian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     },
//     huahenxian: {
//         title: '车身划痕险',
//         type: 'huahenxian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     },
//     ziranxian: {
//         title: '自然损失险',
//         type: 'ziranxian',
//         // cancelTitle: '这里是取消按钮',
//         destructiveTitle: '不买',
//         buttons: ['购买'],
//         jieguo: ''
//     }

// }
// var bujimianpei = {
//     chesunxian: {
//         title: '不计免赔（机动车损失险）',
//         type: 'chesunxian',
//         qianzhi: false,
//         is_mai: 0
//     },
//     sanzhexian: {
//         title: '不计免赔（第三者责任险）',
//         type: 'sanzhexian',
//         qianzhi: false,
//         is_mai: 0
//     },
//     sijixian: {
//         title: '不计免赔（车上人员（司机）险）',
//         type: 'sijixian',
//         qianzhi: false,
//         is_mai: 0
//     },
//     chengkexian: {
//         title: '不计免赔（车上人员（乘客）险）',
//         type: 'chengkexian',
//         qianzhi: false,
//         is_mai: 0
//     },
// }





public_chexing_imgurl = {
    jiaoche: '../image/0613224546_3.png',
    huoche: '../image/0355544795_3.png',
    keche: '../image/0236157917_6.png'
}


function getRandomName() {
    // var firstNames = new Array(
    // "赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈",
    // "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许",
    // "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏",
    // "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章",
    // "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦",
    // "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳",
    // "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺",
    // "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常",
    // "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余",
    // "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹",
    // "欧阳", "慕容"
    // );

    var firstNamesStr = "活泼,开朗,稳重,美丽,大方,有智慧,有毅力,勇敢,自信,坚强,理智,冷静,有活力,有干劲,浪漫,和谐,团结,善良,有气质,有才华,漂亮,可爱,羞涩,细致,耐心,热情,认真"
    var firstNames = firstNamesStr.split(',')
    var secondNames = new Array(
        "子璇", "国栋", "夫子", "瑞堂", "国贤", "贺祥", "晨涛", "昊轩", "易轩", "益辰",
        "益帆", "益冉", "瑾春", "瑾昆", "春齐", "文昊", "东东", "雄霖", "浩晨", "熙涵",
        "溶溶", "冰枫", "欣欣", "宜豪", "欣慧", "建政", "美欣", "淑慧", "文轩", "文杰",
        "欣源", "忠林", "榕润", "欣汝", "慧嘉", "新建", "建林", "亦菲", "冰洁", "佳欣",
        "涵涵", "禹辰", "淳美", "泽惠", "伟洋", "涵越", "润丽", "淑华", "晶莹", "凌晶",
        "苒溪", "雨涵", "嘉怡", "佳毅", "子辰", "佳琪", "紫轩", "瑞辰", "昕蕊", "明远",
        "欣宜", "泽远", "欣怡", "佳怡", "佳惠", "晨茜", "晨璐", "运昊", "汝鑫", "淑君",
        "晶滢", "润莎", "榕汕", "佳钰", "佳玉", "晓庆", "一鸣", "语晨", "添池", "添昊",
        "雨泽", "雅晗", "雅涵", "清妍", "诗悦", "嘉乐", "晨涵", "天赫", "玥傲", "佳昊",
        "天昊", "萌萌", "若萌"
    );
    var firstLength = firstNames.length;
    var secondLength = secondNames.length;

    var i = parseInt(Math.random() * firstLength);
    var j = parseInt(Math.random() * secondLength);

    var name = firstNames[i] + '的' + secondNames[j];

    return name;

}