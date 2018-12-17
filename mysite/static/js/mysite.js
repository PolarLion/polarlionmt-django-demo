

var RTCPeerConnection =  window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var displayAddrs = [0];
if (RTCPeerConnection) (function () {
    function grepSDP(sdp) {
        var hosts = [];
        sdp.split('\r\n').forEach(function (line) {
            if (~line.indexOf("a=candidate")) {
                var parts = line.split(' '), 
                    addr = parts[4],
                    type = parts[7];
                if (type === 'host') updateDisplay(addr);
            } else if (~line.indexOf("c=")) {
                var parts = line.split(' '),
                    addr = parts[2];
                updateDisplay(addr);
            }
        });
    }
    var rtc = new RTCPeerConnection({iceServers:[]});
    if (1 || window.mozRTCPeerConnection) {   
        rtc.createDataChannel('', {reliable:false});
    };
    
    rtc.onicecandidate = function (evt) {
        if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
    };
    rtc.createOffer(function (offerDesc) {
        grepSDP(offerDesc.sdp);
        rtc.setLocalDescription(offerDesc);
    }, function (e) { console.warn("offer failed", e); });
    
    
    var addrs = Object.create(null);
    addrs["0.0.0.0"] = false;
    function updateDisplay(newAddr) {
        if (newAddr in addrs) return;
        else addrs[newAddr] = true;
        displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
        // console.log(displayAddrs)
    }
})(); 

var global_align_list;
var global_target_text;
var global_source_text;
var golbal_model_list = ['transformer']
var golbal_language_list = ['en-zh','zh-en']


function save_result(click_type, language){
  var col1 = document.getElementById("sourceinput").value;
  var col2 = document.getElementById("targetinput").value;
  var col3 = click_type;
  var col4 = language
  var today = new Date();
  var col5 = today.getHours()+":"+today.getMinutes()+":"+today.getSeconds()+" ("+today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+")";
  // console.log(col5)
  // console.log(today.getDate())
  // $("#targetinput").html(decodeURI("undefined operation"));
  document.getElementById("resultstablebody").innerHTML="<tr><td>"+col1+"</td><td>"+col2+"</td><td>"+col3+"</td><td>"+col4+"</td><td>"+col5+"</td></tr>"+document.getElementById("resultstablebody").innerHTML;
}

function show_alignment(source_text, target_text, align_list){
  var body_width = document.body.clientWidth/12*3.5;
    // $("#targetinput").html(decodeURI(body_width));
  document.getElementById("alignment").innerHTML = "<h3><p>Alignment Matrix</p></h3>"+"<div title=\"show large one\"><canvas id=\"myCanvas\" width=\""+String(body_width)+"\" height=\""+String(body_width)+"\"></canvas></div>";

  var source_length = source_text.length;
  var target_length = target_text.length;
  var step = 40;
  var font = 20;
  var x_offset = font * 9;
  var y_offset = font * 7;
  body_width ;//-= font*10;
  if (target_length > source_length) {
    step = body_width/target_length;
  }
  else {
    step = body_width/source_length;
  }
  if (step > 45) {
    step = 45;
  }
  var font = step/2.3;
  var x_offset = font * 9;
  var y_offset = font * 7;
  
  for (var i=0; i<source_length; i++) {
    var c=document.getElementById("myCanvas");
    var cxt=c.getContext("2d");
    // cxt.rotate(0)
    cxt.moveTo(i*step+x_offset, y_offset);
    // cxt.lineTo(i*step+x_offset, step*(target_length)+y_offset);
    cxt.moveTo(0,0);
    cxt.textAlign = "left";
    cxt.textBaseline="top";
    cxt.font = String(font)+"px Arial";
    cxt.translate(x_offset+(i+2.3)*step, -step*1.5);
    cxt.rotate(-Math.PI/3);
    // cxt.fillText(source_text[i], -y_offset/(1-1/3), 0);
    cxt.fillText(decodeURI(source_text[i]), -y_offset/(1-1/3), 0);
    cxt.rotate(Math.PI/3); 
    cxt.translate(-(x_offset+(i+2.3)*step), step*1.5);
    // console.log(i, source_text[i], decodeURI(source_text[i]), i*step+x_offset);
  }
  cxt.moveTo(source_length*step+x_offset, y_offset);
  // cxt.lineTo(source_length*step+x_offset, step*(target_length)+y_offset);

  for (var j=0; j<target_length; j++){
    var c=document.getElementById("myCanvas");
    var cxt=c.getContext("2d");
    // cxt.moveTo(x_offset,j*step+y_offset);
    // cxt.lineTo(step*(source_length)+x_offset, j*step+y_offset);
    cxt.font = String(font)+"px Arial";
    cxt.textAlign = "left";
    cxt.fillText(decodeURI(target_text[j]), (0.8-decodeURI(target_text[j]).length/17.)*x_offset, j*step+step/3+y_offset);
    console.log(j, target_text[j], decodeURI(target_text[j]), (0.8-decodeURI(target_text[j]).length/17.));
  }
  // cxt.moveTo(x_offset,target_length*step+y_offset);
  // cxt.lineTo(step*(source_length)+x_offset, target_length*step+y_offset);
  for (var j=0; j<target_length; j++){
    for (var i=0; i<source_length; i++){
      wa = align_list[j][i]
      if (wa < 0.1) {
        wa = 0.
      }
      color = parseInt(255*wa);
      if (color < 16){
        code = "0"+(color).toString(16);
      }
      else{
        code = (color).toString(16);
      }
      // console.log(code);
      cxt.fillStyle="#"+code+code+code;
      // console.log(color, cxt.fillStyle, target_text[j], decodeURI(source_text[i]), align_list[j][i]);
      // console.log("#"+(color).toString(16)+(color).toString(16)+(color).toString(16));
      // console.log(step);
      cxt.fillRect(i*step+x_offset, j*step+y_offset, step, step);
    }
  }
  cxt.stroke();
}

function show_large_alignment(source_text, target_text, align_list){
  console.log("in show_large_alignment")
  var body_width = document.body.clientWidth;
  align_page = window.open('#algnment','')
  align_page.document.write("<h1><p>Alignment Matrix</p></h1><canvas id=\"myCanvas\" width=\""+String(body_width)+"\" height=\""+String(body_width)+"\"></canvas></a>")
  var source_length = source_text.length;
  console.log(source_length)
  var target_length = target_text.length;
  var step = 40;
  var font = 20;

  body_width ;//-= font*10;
  if (target_length > source_length) {
    step = body_width/target_length;
  }
  else {
    step = body_width/source_length;
  }
  if (step > 45) {
    step = 45;
  }
  var font = step/2.3;
  var x_offset = font * 9;
  var y_offset = font * 7;
  
  for (var i=0; i<source_length; i++) {
    var c= align_page.document.getElementById("myCanvas");
    var cxt=c.getContext("2d");
    // cxt.rotate(0)
    cxt.moveTo(i*step+x_offset, y_offset);
    cxt.moveTo(0,0);
    cxt.textAlign = "left";
    cxt.textBaseline="top";
    cxt.font = String(font)+"px Arial";
    cxt.translate(x_offset+(i+2.3)*step, -step*1.5);
    cxt.rotate(-Math.PI/3);
    cxt.fillText(decodeURI(source_text[i]), -y_offset/(1-1/3), 0);
    cxt.rotate(Math.PI/3); 
    cxt.translate(-(x_offset+(i+2.3)*step), step*1.5);
  }
  cxt.moveTo(source_length*step+x_offset, y_offset);

  for (var j=0; j<target_length; j++){
    var c= align_page.document.getElementById("myCanvas");
    var cxt=c.getContext("2d");
    cxt.font = String(font)+"px Arial";
    cxt.textAlign = "left";
    cxt.fillText(decodeURI(target_text[j]), (0.8-decodeURI(target_text[j]).length/17.)*x_offset, j*step+step/3+y_offset);
  }
  for (var j=0; j<target_length; j++){
    for (var i=0; i<source_length; i++){
      wa = align_list[j][i]
      if (wa < 0.1) {
        wa = 0.
      }
      color = parseInt(255*wa);
      if (color < 16){
        code = "0"+(color).toString(16);
      }
      else{
        code = (color).toString(16);
      }
      cxt.fillStyle="#"+code+code+code;
      cxt.fillRect(i*step+x_offset, j*step+y_offset, step, step);
    }
  }
  cxt.stroke();
  align_page.document.close()
}

$(function() {
  var language = document.getElementById("language");
	$("#nmt").on("click", function() {
    var model = document.getElementById("model");
    if (golbal_model_list.indexOf(model.value) < 0) {
      alert("the model " + model.value + " is not support by now")
      return
    }
    if (golbal_language_list.indexOf(language.value) < 0) {
      alert("the language " + language.value + " is not support by now")
      return
    }
    var url = document.location.toString();
    // console.log("url url1:", url)
    // console.log("url url2 /:", url.substring(url.length-1))
    if (url.substring(url.length-1) != "/"){
      url += "/"
    }
    // console.log("url url2:", url)
    var nmt_url = url + "../nmt/"
    console.log("nmt_url:", nmt_url)
    // console.log(language.value)
    $("#targetinput").html(decodeURI(""));
		var source_val = document.getElementById("sourceinput").value;
    if (source_val == ''){ document.getElementById("sourceinput").focus(); }
    else {
      console.log("source_val: "+source_val)
      $.ajax({
        url: nmt_url,
        type: 'get',
        dataType: 'json',
        data: {
            q: source_val,
            model: model.value,
            ip: displayAddrs[0],
            language: language.value
        },
        success: function (data) {
          console.log(data)
          console.log(typeof(data))
          var obj = data
          console.log(obj)
          source_text = obj["src_text"].split(" ")
          console.log(source_text)
          target_text = obj["tgt_text"][0][0].split(" ")
          console.log(target_text)
          align_list = obj["attent"]
          console.log(align_list)
          document.getElementById("targetinput").innerHTML=decodeURI(obj["tgt"]);
          save_result(model.value, language.value);
          target_text.push("<eos>");
          global_align_list = align_list.valueOf();
          global_target_text = target_text.valueOf();
          global_source_text = source_text.valueOf();
          show_alignment(source_text, target_text, align_list);
        }
      });

    }
	});
  $("#baidu").on("click", function() {
    $("#targetinput").html(decodeURI(""));
    var appid = '20160409000018151';
    var key = 'E0ZOUoKvwIEwNELiR0lJ';
    var salt = (new Date).getTime();
    var query = document.getElementById("sourceinput").value;
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = '';
    var to = '';
    console.log(language.value)
    if (language.value=="zh-en") {
      from = 'zh';
      to = 'en';
    }
    else if (language.value=="en-zh"){
      from = 'en';
      to = 'zh';
    }
    var str1 = appid + query + salt +key;
    var sign = MD5(str1);
    if (query == ''){
      document.getElementById("sourceinput").focus();
    }
    else {
      $.ajax({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function (data) {
          $("#targetinput").html(decodeURI(data['trans_result'][0]['dst']));
          save_result("Baidu", language.value);
          document.getElementById("alignment").innerHTML = "<h3><p>Alignment Matrix</p></h3>"
        }
      });
    }
  });
  $("#alignment").on("click", function() {
    console.log(global_source_text)
    show_large_alignment(global_source_text, global_target_text, global_align_list)
    // show_alignment(source_text, target_text, align_list);
    // var test = align_page.document.getElementById("title").value
  });
});


function timeFormat(){
  //debugger
  var today = new Date();
  year = today.getFullYear(),
  month = today.getMonth() + 1,
  day = today.getDate(),
  hour = today.getHours(),
  minute = today.getMinutes(),
  second = today.getSeconds(),
  week = today.getDay(),
  //weekend = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"],
  weekend = ["Sunday","Monday","Tuesday","Wednesday","Thurday","Friday","Saturday"],
  weekDay = weekend[week];
  month < 10 ? month = "0" + month:month;
  day < 10 ? day = "0" + day:day;
  hour < 10 ? hour = "0" + hour:hour;
  minute < 10 ? minute = "0" + minute:minute;
  second < 10 ? second = "0" + second:second;
  var time = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second + " "+weekDay;
  //var time = year+"-"+month+"-"+day+" "+weekDay;
  document.getElementById("time").innerHTML = time;
}

setInterval(timeFormat,0);
