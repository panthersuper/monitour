var nowPage = 0;
var allPage = 4;
var detail_control = true;

//main jquery function

var main = function() {
inithome(0);

$("#tablepath div").click( //click the new route button, change the display to the new one
  function() {
    changePage(1);
    $("#tablepath div").removeClass("active");
    $(this).addClass("active");

    var thisid = $(this).attr("id");
    curPath = +thisid;
    update(curPath);
    moveToggle = false;
    cont = false; //loop not started

    d3.select("#nowpath_title")
      .select("p").remove();

    var thistype = getNode(getNode(places_multi, curPath), 0)[6].toUpperCase();
    var thisname = Object.keys(places_multi)[curPath].toUpperCase()

    $("#device_icon p").html(thistype);

    if (thistype == "CRT") {
      $("#device_icon img").attr("src", "img/crt.png");
    } else if (thistype == "PRINTER") {
      $("#device_icon img").attr("src", "img/printer.png");
    } else {
      $("#device_icon img").attr("src", "img/tv_icon.png");
    }

    initstat();

    important_num = 0;

    d3.select("#nowpath_title")
      .append("p")
      .text(thistype[0] + ": " + thisname);

    localcontrol = true;
    nowNum = 1;

    updateOverall(places);

  }
);

$("#tablepath div").mouseover( //hover the new route, will show the preview of this one
  function(event) {

    d3.select("#pre").attr("style", "width:300px; display:block;"); //

    var precanvas = d3.select("#pre").append("svg")
      .attr("id", "preview");
    var myY = null
    myY = event.pageY - 160;

    precanvas.attr("style", "top:" + (myY + 24) + "px;");

    var pre_id = $(this).attr("id"); //the id for the preview
    var pre_places = getNode(places_multi, +pre_id);
    var pre_route = getNode(route_multi, +pre_id);

    var pre_projection = d3.geo.equirectangular()
      .scale(50)
      .rotate([205, 0])
      .translate([150, 75])
      .precision(1);

    var pre_path = d3.geo.path()
      .projection(pre_projection);


    d3.json("world-110m.json", function(error, world) {
      if (error) throw error;

      precanvas.insert("path", ".graticule")
        .datum(topojson.feature(world, world.objects.land))
        .attr("fill", "#858585")
        .attr("class", "land")
        .attr("d", pre_path);

      precanvas.append("path")
        .datum(pre_route)
        .attr("stroke-width", "1.52px")
        .attr("stroke", "#fffcf0")
        .attr("fill", "none")
        .attr("d", pre_path);

    });
  }
);

$("#tablepath div").mouseout( //move out of the mouse, will undo the preview
  function() {
    d3.select("#preview").remove();
    d3.select("#pre").attr("style", "width:0px;");
  }
);

$("#selectpath").click(
  function() {
    $("[id=tablepath]").toggleClass("display");
    $("#info_3").hide();



  });


$("#back").click(
  function() {
    if (count < 10)
      nowNum--;

    count = 0;

    if (nowNum < 1) {
      nowNum = 1;
      updateContent(0);

    } else {
      updateContent(nowNum);

    }


    cont = false; //loop starts
    moveToggle = false;
    finishsign = 0;
    next_control = true;

  }
);

$("#next").click(
  function() {
    switchDetail(0);

    moveToggle = true;
    updateContent(nowNum);
    cont = true; //loop starts
    finishsign = 0;
    $(this).addClass("btn_act");
    $("#stop").removeClass("btn_act");
    $("#routeinfobox").hide();


  }
);

$("#stop").click(
  function() {
    cont = false; //loop 
    moveToggle = false;
    finishsign = 0;
    next_control = true;
    $(this).addClass("btn_act");

    $("#next").removeClass("btn_act");

  }
);

$("#start_route").click(
  function() {

    switchDetail(0);
    moveToggle = true;
    updateContent(nowNum);
    cont = true; //loop starts
    finishsign = 0;
    $(this).addClass("btn_act");
    $("#stop").removeClass("btn_act");

    $("#routeinfobox").hide();



  });


$(".prev_c").click(
  function() {
    var len = $(".media_in").length

    $("#media" + nowMedia).hide();
    nowMedia--;
    if (nowMedia < 0) nowMedia = len - 1;

    if (!($("#media" + nowMedia).attr("src").length > 0)) {
      nowMedia++;
      nowMedia = nowMedia % len;
    }
    $("#media" + nowMedia).fadeIn(500);
  }
);

$(".next_c").click(
  function() {
    var len = $(".media_in").length

    $("#media" + nowMedia).hide();
    nowMedia++;
    nowMedia = nowMedia % len;

    if (!($("#media" + nowMedia).attr("src").length > 0)) {
      nowMedia--;
      if (nowMedia < 0) nowMedia = len - 1;
    }
    $("#media" + nowMedia).fadeIn(500);
  }
);

$("#nowpath_title").click(
  function() {
    $("#tablepath").toggleClass("display");

  }


)

var localcontrol2 = true;
$(".menu").click(
  function() {
    $(".hidden_info").show();

    $(".menucontent").fadeOut(100);
    localcontrol2 = true;

    $("#aboutbk").fadeOut(0).fadeIn(200);
    $("#abouttb").fadeOut(0).fadeIn(200);
  }

);

$("#cross").click(
  function() {
    $(".firstpage").show();
    $(".secondpage").hide();

    $(".hidden_info").hide();
    $("#aboutbk").fadeOut(0);
    $("#abouttb").fadeOut(0);
  }
);

$("#detail_button").click(
  function() {
    if (detail_control) {
      switchDetail(1);
    } else {
      switchDetail(0);
    }
  }
);

$("#filter ul").click(function() {
  console.log("options");
  $("#filter ul").removeClass("selectedfilter");
  selectedlayer = [];

  $(this).toggleClass("selectedfilter");

  var myclass = $(this).attr("class");
  var myid = $(this).attr("id");

  if (selectedlayer.indexOf(myid) !== -1) {
    selectedlayer.splice(selectedlayer.indexOf(myid), 1);

  } else {
    selectedlayer.push(myid);
  }

  resize();
  finish_path();

})

$("#filter p").click(function() {
  console.log("title");
  $(".options").toggleClass("show");
})

$("#chapters p").click(function() {
  console.log("title");
  $(".options_chap").toggleClass("show");
})

$("#chapters ul").click(function() {
  $(this).toggleClass("selectedchapter");

  var myclass = $(this).attr("class");
  var myid = $(this).attr("id");

  if (selectedchapter.indexOf(myid) !== -1) {
    selectedchapter.splice(selectedchapter.indexOf(myid), 1);

  } else {
    selectedchapter.push(myid);
  }
  console.log("chapter");

  resize();
  finish_path();

});

$("#allpath").click(function() {
  console.log("all!!!");
  selectedlayer = [];
  selectedchapter = [];
  selectedcity = null;
  resize();
  finish_path();
  $("#filter ul").removeClass("selectedfilter");

});

$("#zoomin").click(function() {
  zoombase += 0.5;
  if (myzoom > 10) zoombase -= 0.5;
  if (zoombase < 7.5) zoombase = 7.5;
});

$("#zoomout").click(function() {
  zoombase -= 0.5;
  if (zoombase < 1.5) zoombase = 1.5;
  console.log(zoombase, myzoom);
});

$("#zoomin_ovr").click(function() {
  zm_lv += 0.5;
  if (zm_lv > 5) zm_lv = 5;

  console.log("zoomin");
  resize();

  finish_path();
  console.log(map0.getCenter());

});

$("#zoomout_ovr").click(function() {
  zm_lv -= 0.5;
  if (zm_lv < 1) zm_lv = 1;

  console.log("zoomout");
  resize();

  finish_path();
  console.log(map0.getCenter());


});

var locx = null;
var locy = null;


function dragmove(d) {
  if (ani_play) {
    d3.selectAll(".overall_path").transition().delay(0);
  }

  var x = d3.event.x;
  var y = d3.event.y;
  var dtX = null,
    dtY = null;

  if (locx && locy) {
    dtX = x - locx;
    dtY = y - locy;
    var oldcenter = map0.getCenter();

    var newcenter = [oldcenter.lng - dtX * mv_click / zm_lv, oldcenter.lat + dtY * mv_click / zm_lv];

    map0.jumpTo({
      center: newcenter
    });
    resize();

    finish_path();


    locx = x;
    locy = y;


  } else {
    locx = x;
    locy = y;

  }

}

var drag = d3.behavior.drag().on("drag", dragmove);
var thisselection = d3.select(".allroutes");
thisselection.call(drag);
thisselection.on("mouseup", function() {
  locx = null;
  locy = null;
});



$("#explore").click(
  function() {
    var time1 = 5000;

    $(".home").fadeOut(1000);
    setTimeout(function() {
      $("#info_0").fadeIn(1000);
      $("#info_0").click(function() {
        $("#info_0").fadeOut(0, function() {
          $("#background1").fadeOut(1000);
          locreplay = false;
          locloop = false; //to stop the loop
          resize();
          animate_path();
          $("#info_3").fadeIn(5000);
          overallpath_on = true;

        });
      });
    }, 1000);
  }
);

var mystyle = true;
$(".change_Map").click(function() {
  if (mystyle) {
    mystyle = false;

    $(".change_map_mark").css("left", "50%");

    map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/dark-v8', //hosted style id
    });

  } else {
    mystyle = true;

    $(".change_map_mark").css("left", "0%");

    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-v8',
    });


  }



});

$("#aboutdown").click(function() {
  $(".firstpage").slideUp();
  $(".secondpage").slideDown();


})



$(".hint").click(function() {
  $(this).remove();

})

$("#globe").click(function() {
  $(".overall_map").fadeIn(1000);
  $(".draw").fadeOut(0);
  $("#control").fadeOut(0);
  $("#pre").fadeOut(0);

  $(".underbar_back").fadeIn(1000);

  cont = false; //loop starts
  moveToggle = false;
  finishsign = 0;
  next_control = true;


  locloop = false; //to stop the loop
  resize();
  finish_path();
  locreplay = false;



});

$("#stop_ovr").click(
  function() {
    d3.selectAll(".overall_path").transition().delay(0);

  }
);

$("#next_ovr").click(
  function() {
    ani_play = true;
    d3.selectAll(".mapnodes").remove();
    d3.selectAll(".mapnodes_first").remove();


    $(".over_block").show();
    var localcountme = 0;
    disfiltered = 0;
    dayfiltered = 0;
    localfilternum = 0;


    d3.select(".allroutes").append("g").attr("class", "mapnodes_g");
    d3.select(".allroutes").append("g").attr("class", "mapnodes_first_g");

    for (k in route_multi) { //add paths

      var name = k.toString();
      var newlst = fixloop2(route_multi[k].coordinates);
      var lstprojected = reptojectMap0(newlst);

      var redraw = function() {

        var lineraw = curvePath(curvePath(curvePath(curvePath(curvePath(lstprojected)))));

        d3.select(".overall_path_" + name).transition()
          .delay(0)
          .duration(10000)
          .attrTween("d", getSmoothInterpolation(lineraw)) //need a reference to the function
          .each("end", function() {

            $(".over_block").hide();

          });
        addlast();

        function addlast() {
          d3.select(".mapnodes_g").append("circle").attr("class", "mapnodes").attr("display", "block") //add all last nodes
            .attr("cx", lstprojected[lstprojected.length - 1].x).attr("cy", lstprojected[lstprojected.length - 1].y).attr("ox", newlst[newlst.length - 1][0]).attr("oy", newlst[newlst.length - 1][1])
            .attr("r", 0).attr("fill", "rgb(211, 84, 0)").attr("z-index", 16)
            .on("mouseover", function() {
              d3.select(this).attr("r", 6);
              var info = d3.select(".extra_info").append("div").attr("class", "info").attr("style", "background:rgba(255,255,255,0.8);position:absolute;border-radius: 10px;left:" + (d3.mouse(this)[0] + 20) + "px;top:" + (d3.mouse(this)[1] + 10) + "px ");
              info.append("div").attr("class", "pop_city_name");

              var lx = d3.select(this).attr("ox");
              var ly = d3.select(this).attr("oy");
              if (lx < -180) {
                revGeocoding_class(ly, (+lx + 360), "pop_city_name");

              } else
                revGeocoding_class(ly, lx, "pop_city_name");

            })
            .on("mouseout", function() {
              d3.select(this).attr("r", 3);
              d3.selectAll(".info").remove();

            })
            .on("click", function() {
              //filter path close to this node
              if (selectedcity == null)
                selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];
              else if (d3.select(this).attr("ox") == selectedcity[0] && d3.select(this).attr("oy") == selectedcity[1])
                selectedcity = null;
              else
                selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];

              resize();
              finish_path();

            })

          .transition().delay(8000).duration(2000).ease("circle")
            .attr("r", 3);
        }



        d3.select(".mapnodes_first_g").append("circle").attr("class", "mapnodes_first") //add all first nodes
          .attr("cx", lstprojected[0].x).attr("cy", lstprojected[0].y).attr("ox", newlst[0][0]).attr("oy", newlst[0][1])
          .attr("r", 0).attr("fill", "rgb(22, 160, 133)").attr("z-index", 17)
          .on("mouseover", function() {

            d3.select(this).attr("r", 6);
            var info = d3.select(".extra_info").append("div").attr("class", "info").attr("style", "background:rgba(255,255,255,0.8);position:absolute;border-radius: 10px;left:" + (d3.mouse(this)[0] + 20) + "px;top:" + (d3.mouse(this)[1] + 10) + "px ");
            info.append("div").attr("class", "pop_city_name");
            revGeocoding_class(d3.select(this).attr("oy"), d3.select(this).attr("ox"), "pop_city_name");

          })
          .on("mouseout", function() {

            d3.select(this).attr("r", 3);
            d3.selectAll(".info").remove();
          })
          .on("click", function() {
            //filter path close to this node
            if (selectedcity == null)
              selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];
            else if (d3.select(this).attr("ox") == selectedcity[0] && d3.select(this).attr("oy") == selectedcity[1])
              selectedcity = null;
            else
              selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];

            resize();
            finish_path();

          })
          .transition().duration(2000).delay(500)
          .attr("r", 3);

      }

      var cityfilter = closeenough(selectedcity, newlst);


      var in_selected_chapter = oneIteminLst(selectedchapter, drawchapter[localcountme].split(","));

      if (cityfilter) {
        if (selectedlayer.length && selectedlayer.indexOf(drawindex[localcountme]) != -1) { //this type is selected
          if (selectedchapter.length && in_selected_chapter) { //is the chapter selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;

          } else if (selectedchapter.length == 0) { //no chapter selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;
          }
        } else if (selectedlayer.length == 0) { //no layer selected
          if (selectedchapter.length && in_selected_chapter) { //chapter selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;
          } else if (selectedchapter.length == 0) { //nothing is selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;
          }

        }
      }

      localcountme++;
    }

    $("#stat").html('<span id = "numstat"></span> <span> | </span> <span id = "distat"></span> <span> | </span>  <span id = "timestat"></span>');
    $("#numstat").html("Total Trackers: <strong style = 'font-size:30px; color:white'>" + localfilternum + "</strong>");



  }
);

$("#skip_ovr").click(
  function() {

    d3.selectAll(".mapnodes").remove();
    d3.selectAll(".mapnodes_first").remove();

    $(".over_block").show();
    var localcountme = 0;
    disfiltered = 0;
    dayfiltered = 0;
    localfilternum = 0;


    d3.select(".allroutes").append("g").attr("class", "mapnodes_g");
    d3.select(".allroutes").append("g").attr("class", "mapnodes_first_g");

    for (k in route_multi) { //add paths

      var name = k.toString();
      var newlst = fixloop2(route_multi[k].coordinates);
      var lstprojected = reptojectMap0(newlst);

      var redraw = function() {

        var lineraw = curvePath(curvePath(curvePath(curvePath(curvePath(lstprojected)))));

        d3.select(".overall_path_" + name).transition()
          .delay(0)
          .duration(0)
          .attrTween("d", getSmoothInterpolation(lineraw)) //need a reference to the function
          .each("end", function() {

            //d3.selectAll(".mapnodes").attr("display", "block")
            $(".over_block").hide();

          });
        addlast();

        function addlast() {
          d3.select(".mapnodes_g").append("circle").attr("class", "mapnodes").attr("display", "block") //add all last nodes
            .attr("cx", lstprojected[lstprojected.length - 1].x).attr("cy", lstprojected[lstprojected.length - 1].y).attr("ox", newlst[newlst.length - 1][0]).attr("oy", newlst[newlst.length - 1][1])
            .attr("r", 0).attr("fill", "rgb(211, 84, 0)").attr("z-index", 16)
            .on("mouseover", function() {
              d3.select(this).attr("r", 6);
              var info = d3.select(".extra_info").append("div").attr("class", "info").attr("style", "background:rgba(255,255,255,0.8);position:absolute;border-radius: 10px;left:" + (d3.mouse(this)[0] + 20) + "px;top:" + (d3.mouse(this)[1] + 10) + "px ");
              info.append("div").attr("class", "pop_city_name");

              var lx = d3.select(this).attr("ox");
              var ly = d3.select(this).attr("oy");
              if (lx < -180) {
                revGeocoding_class(ly, (+lx + 360), "pop_city_name");

              } else
                revGeocoding_class(ly, lx, "pop_city_name");

            })
            .on("mouseout", function() {
              d3.select(this).attr("r", 3);
              d3.selectAll(".info").remove();

            })
            .on("click", function() {
              //filter path close to this node
              if (selectedcity == null)
                selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];
              else if (d3.select(this).attr("ox") == selectedcity[0] && d3.select(this).attr("oy") == selectedcity[1])
                selectedcity = null;
              else
                selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];

              resize();
              finish_path();

            })

          .transition().delay(0).duration(0).ease("circle")
            .attr("r", 3);
        }



        d3.select(".mapnodes_first_g").append("circle").attr("class", "mapnodes_first") //add all first nodes
          .attr("cx", lstprojected[0].x).attr("cy", lstprojected[0].y).attr("ox", newlst[0][0]).attr("oy", newlst[0][1])
          .attr("r", 0).attr("fill", "rgb(22, 160, 133)").attr("z-index", 17)
          .on("mouseover", function() {

            d3.select(this).attr("r", 6);
            var info = d3.select(".extra_info").append("div").attr("class", "info").attr("style", "background:rgba(255,255,255,0.8);position:absolute;border-radius: 10px;left:" + (d3.mouse(this)[0] + 20) + "px;top:" + (d3.mouse(this)[1] + 10) + "px ");
            info.append("div").attr("class", "pop_city_name");
            revGeocoding_class(d3.select(this).attr("oy"), d3.select(this).attr("ox"), "pop_city_name");

          })
          .on("mouseout", function() {

            d3.select(this).attr("r", 3);
            d3.selectAll(".info").remove();
          })
          .on("click", function() {
            //filter path close to this node
            if (selectedcity == null)
              selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];
            else if (d3.select(this).attr("ox") == selectedcity[0] && d3.select(this).attr("oy") == selectedcity[1])
              selectedcity = null;
            else
              selectedcity = [d3.select(this).attr("ox"), d3.select(this).attr("oy")];

            resize();
            finish_path();

          })
          .transition().duration(0).delay(0)
          .attr("r", 3);

      }

      var cityfilter = closeenough(selectedcity, newlst);


      var in_selected_chapter = oneIteminLst(selectedchapter, drawchapter[localcountme].split(","));

      if (cityfilter) {
        if (selectedlayer.length && selectedlayer.indexOf(drawindex[localcountme]) != -1) { //this type is selected
          if (selectedchapter.length && in_selected_chapter) { //is the chapter selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;

          } else if (selectedchapter.length == 0) { //no chapter selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;
          }
        } else if (selectedlayer.length == 0) { //no layer selected
          if (selectedchapter.length && in_selected_chapter) { //chapter selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;
          } else if (selectedchapter.length == 0) { //nothing is selected
            redraw();
            disfiltered += dislst[localcountme];
            dayfiltered += thistime(getNode(places_multi, localcountme));
            localfilternum++;
          }

        }
      }

      localcountme++;
    }

    $("#stat").html('<span id = "numstat"></span> <span> | </span> <span id = "distat"></span> <span> | </span>  <span id = "timestat"></span>');
    $("#numstat").html("Total Trackers: <strong style = 'font-size:30px; color:white'>" + localfilternum + "</strong>");



  }
);

};

var inithome = function(time) {

  $("#draw").fadeOut(time);
  $("#control").fadeOut(time);
  $("#pre").fadeOut(time);
  $("#hometb").fadeIn(500);

  nowPage = 0;

}

var changePage = function(page) {

  if (page === 0) {
    inithome(500);
  } else if (page === 1) {

    $("html, body").animate({
      scrollTop: 0
    }, "fast");

    $("#info_3").remove();
    $("#tablepath").removeClass("display");

    $(".draw").fadeOut(0).fadeIn(1000);
    $("#pre").fadeOut(0).fadeIn(1000);
    $("#control").fadeOut(0).fadeIn(1000);
    $(".overall_map").fadeOut(0);
    $(".home").fadeOut(0);
    $(".underbar_back").fadeOut(0);

  }

}