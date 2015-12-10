var mapw = $(window).width(),
  maph = $(window).height();
var width = 350,
  height = 350;
var margin = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40
};

var places_multi = {};
var route_multi = {};
var drawindex = []; //all the type list
var drawchapter = []; //all the chapter list
var dislst = []; //all the dis list

var selectedlayer = [];
var selectedchapter = [];
var selectedcity = null;

var curPath = 0; //the path that is currently showing
var projection = d3.geo.orthographic()
  .scale(350 / 2.1)
  .translate([175, 175])
  .precision(2);
var graticule = d3.geo.graticule();
var myroute;
var CuRoute;
//var CuRoute_blur;
var pastRoute;
//var pastRoute_blur;
var places;
var route;
var routeRam; //route after randomness
var timeMark;
var timeBase;

var route_m; //data
var route_map; //svg path
var pastRoute_map;
//var route_map_blur; //svg path
//var pastRoute_map_blur;

var svgmap = d3.select(".svgmap");

var svgtrack = d3.select(".svgtrack");

var svgpagsvgtracke = d3.select(".svgpage");

var canvas = d3.select("#mycanvas");

var svg = d3.select("#globe");

var context = canvas.node().getContext("2d");

var svg0 = d3.select(".mysvg");

var topbar = d3.select(".topbar");

var path = d3.geo.path()
  .projection(projection)
  .context(context);

var patho = d3.geo.path()
  .projection(projection);



var sphere = {
  type: "Sphere"
};
var nodeNum; //total node amount
var nowNum = 1; //current node to target to
var oneMove_default = 400;
var oneMove = oneMove_default; //the interval for each focus
var countmove = 1;
var count = 0; //to measure the interval
var point;
var track;
var track_f;
var track_ff;


var lat_old = 0;
var lng_old = 0;
var lat = 0;
var lng = 0;
var scaleFactor = 1;
var transx = 0;
var transy = 0;
var nowx = 0;
var nowy = 0;

var datelst = [];
var xScale;
var trackscale = 0;
var moveToggle = false;
var cont = false;
var nowMedia = 0;
var finishsign = 0;

var zoombase = 10; //zoom control
var myzoom;

var localfilternum = 0;
var disfiltered = 0;
var dayfiltered = 0;
var averageday;
var averagedis;

var overallpath_on = false;


var lineFunction = d3.svg.line()
  .x(function(d) {
    return d.x;
  })
  .y(function(d) {
    return d.y;
  })
  .interpolate("linear");
//addPoly([]);

////////////////////////////////////////////////////////////////////////////////////////////////////////


NProgress.start();

d3.tsv("new_monitor_sim.tsv", function(error, data2) {
  //d3.csv("test.csv", function(error, data) {
  //data is numbered by the row number... 
  //head is not counted as a row.
  //each item in the data list is a dictionary, key is indicated by the head
  mymain(data2);
});


/*d3.tsv("https://docs.google.com/spreadsheets/d/1mIhQYArv69nmMh4qOqiDwtrcGlD-ICKJ2NGAcLhI5uE/pub?output=tsv", function(error, data) {
    if (error) {
      console.log("errorloading google sheet");
      d3.tsv("new_monitor_sim.tsv", function(error, data2) {
        //d3.csv("test.csv", function(error, data) {
        //data is numbered by the row number... 
        //head is not counted as a row.
        //each item in the data list is a dictionary, key is indicated by the head
        mymain(data2);
      });

} else {
  mymain(data);
}
});*/



var mymain = function(data) {
  var num = data.length;
  for (var i = 0; i < num; i++) {
    places_multi[data[i]["deviceID"]] = {};
  };

  for (var i = 0; i < num; i++) {
    var date = getDate(data[i]["timestamp"]);
    datelst.push(data[i]["timestamp"]);
    var title = data[i]["title"];
    var video = data[i]["video"];
    var story = data[i]["story"];
    var media = data[i]["media"];
    var type = data[i]["deviceType"].toLowerCase();
    var chapter = data[i]["chapter"].toLowerCase();
    var dis = +data[i]["distance"];

    if (title === undefined) title = "";
    if (video === undefined) video = "";
    if (story === undefined) story = "";
    if (media === undefined) media = "";

    var lat = +data[i]["latitude"],
        lng = +data[i]["longitude"];

    places_multi[data[i]["deviceID"]][data[i]["timestamp"]] = [lng, lat, date, title, story, media, type, chapter, dis];



  };

  for (k in places_multi) { //clean the place list, get rid of redundant points

    cleanLst(places_multi[k], 0.3);
  }

  for (k in places_multi) {
    //console.log(Object.size(places_multi[k]));

  }

  for (k in places_multi) {


    route_multi[k] = {};
    route_multi[k].type = "LineString";
    route_multi[k].coordinates = [];

    var localcount = 0

    for (m in places_multi[k]) {
      if (localcount == 0) {
        var thisdata = places_multi[k][m];
        var thistype = thisdata[6];
        var thischapter = thisdata[7];
        var thisdis = thisdata[8];
        drawindex.push(thistype); //type list
        drawchapter.push(thischapter); //chapter list
        dislst.push(thisdis);
      }

      route_multi[k].coordinates.push(places_multi[k][m]);
      localcount++;

    }
  }



  places = getNode(places_multi, curPath);
  route = getNode(route_multi, curPath);
  routeRam = jQuery.extend(true, {}, route); //deep copy
  routeRam.coordinates = ramwhole(routeRam.coordinates, 0);
  route_m = jQuery.extend(true, {}, routeRam);
  route_m.coordinates = reptojectMap(route_m.coordinates);

  datelst.sort();
  var newdl = []
  for (i in datelst) {
    newdl.push(getDate(datelst[i]));
  }

  var minDate = newdl[0],
    maxDate = newdl[newdl.length - 1];

  xScale = d3.time.scale()
    .domain([minDate, maxDate])
    .range([mapw * 0.55, mapw * 0.9]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(d3.time.month, 2)
    .tickFormat(d3.time.format('%b %Y'))
    .tickSize(5)
    .tickPadding(50);

  var pathNum = Object.size(places_multi); //how many path is in the data list
  //add check box for paths

  var id = 0;
  for (key in places_multi) {
    var addpath = d3.select("#tablepath")
      .append("div")
      .attr("class", "thepaths")
      .attr("id", id);

    var thistype = getNode(places_multi[key],0)[6].toUpperCase()[0];

    addpath.append("p")
      .text(thistype+": "+key.toString().toUpperCase());

    if (importantPath(places_multi[key]))
      addpath.append("img").attr("class", "infoicon")
      .attr("src", "img/info_icon.png");
    id++;
  }

  /*  var localnum = ($("#tablepath").height()) / (id) * 0.76;
    $("#tablepath div").css("height", localnum + "px");
  */
  $(document).ready(main); //run jquery after csv loaded so path button initialized

  nodeNum = route.coordinates.length //the total number of nodes

  myroute = svg.append("path")
    .datum(routeRam)
    .attr("class", "route")
    .attr("d", patho)
    .attr("stroke-dasharray", "2,2");

  route_map = svgmap.append("path")
    .attr("class", "route_map")
    .attr("d", lineFunction(route_m.coordinates))
    .attr("stroke", "white")
    .attr("stroke-width", "3px")
    .attr("fill", "none");

  CuRoute = svg.append("path") //current route
    .attr("class", "curroute")

  pastRoute = svg.append("path") //current route
    .attr("class", "pastroute")
  pastRoute_map = svgmap.append("path") //current route
    .attr("class", "pastroute_map")
    .attr("stroke", "white")
    .attr("stroke-width", "3px")
    .attr("fill", "none");

/*  point = svg.append("g")
    .attr("class", "points")
    .selectAll("g")
    .data(d3.entries(places))
    .enter().append("g")
    .attr("id", function(d, i) {
      return "point" + i;
    })
    .attr("class", "mypoints")
    .attr("transform", function(d) {
      return "translate(" + projection(d.value) + ")";
    })
    .on("click", function(d, i) {
      nowNum = i;
      updateContent(nowNum);
      moveToggle = false;
      cont = true; //loop not started
      count = oneMove_default - 0.01; //to measure the interval
      flyto(getNode(places, nowNum), 3);
    });


  point.append("circle") //show circle on each point
    .attr("r", 1.5);*/

  /*  point.attr("add", function(d,i){
      revGeocoding(d.value[1],d.value[0],"point"+i);
    });
*/
  /*  point.append("text") //show text on each point
      .attr("y", 10)
      .attr("dy", ".71em")
      .attr("class", "locName")
      .text(function(d) {
        return d.key.split("_")[1].split(" ")[0].split(",")[0];
      });*/

  track = svg.append("g") //red circle
    .append("circle")
    .attr("class", "track")
    .attr("r", 5)
    .attr("fill", "none")
    .attr("stroke", "#39a4e8")
    .attr("stroke-width", "3px")
    .attr("transform", "translate(100,100)");

  track_f = svgtrack.append("g") //red circle
    .append("circle")
    .attr("class", "track")
    .attr("id", "fake_track2")
    .attr("r", 2)
    .attr("fill", "none")
    .attr("stroke", "#39a4e8")
    .attr("stroke-width", "3px")
    .attr("transform", "translate(" + 25 + "," + 25 + ")");

  svg0.append('g')
    .attr('class', 'xaxis')
    .attr('transform', 'translate(' + margin.left + ', ' + (20) + ')')
    .call(xAxis);


  timeBase = svg0.append("g").attr("class", "timebase") //time mark
    .selectAll("g")
    .data(d3.entries(places))
    .enter().append("g")
    .attr("class", "timeid")
    .attr("id", function(d, i) {
      return "timeid" + i;
    })
    .attr("transform", function(d) {
      var myx = xScale(d.value[2]);
      return "translate(" + myx + "," + (20 + 2.5) + ")";
    })
    .on("click", function(d, i) {
      nowNum = i;
      updateContent(nowNum);
      moveToggle = false;
      cont = false; //loop not started
      count = oneMove_default - 0.01; //to measure the interval
      flyto(getNode(places, nowNum), 3);
    });

  timeBase.append("rect")
    .attr("class", "timebaserect")
    .attr("y", 22)
    .attr("x", -0.75)
    .attr("width", 1.5)
    .attr("height", 10)
    .attr("fill", "rgb(100,100,100)")
    .on("mouseover", function() {
      d3.select(this).attr("width", 4)
        .attr("x", -2)
        .attr("y", 19.5)
        .attr("height", 15);
    })
    .on("mouseout", function() {
      d3.select(this).attr("width", 1.5)
        .attr("x", -0.75)
        .attr("y", 22)
        .attr("height", 10);
    });

  d3.select(".xaxis path").remove();


  d3.select(".xaxis").append("rect")
    .attr("x", mapw * 0.5)
    .attr("y", 10)
    .attr("width", mapw * 0.45)
    .attr("height", 40)
    .attr("stroke", "none")
    .attr("fill", "rgb(22,27,33)");


  d3.select(".xaxis").append("line")
    .attr("x1", mapw * 0.5)
    .attr("y1", 30)
    .attr("x2", mapw * 0.95)
    .attr("y2", 30)
    .attr("stroke-width", 1)
    .attr("stroke", "rgb(20,20,20)");


  timeMark = svg0.append("g") //time mark
    .append("rect")
    .attr("class", "timemark")
    .attr("width", 3)
    .attr("height", 15).attr("y", 20)
    .attr("x", -1.5);

  initContent();



  lat_old = getNode(places, (nowNum - 1 + nodeNum) % nodeNum)[0];
  lng_old = getNode(places, (nowNum - 1 + nodeNum) % nodeNum)[1];

  //the target of this move
  lat = getNode(places, nowNum)[0];
  lng = getNode(places, nowNum)[1];

  //d3.json("countries.geo.json", function(error, topo) {
  d3.json("world-110m.json", function(error, topo) {
    if (error) throw error;
    //var land = topojson.feature(topo, topo.features.properties.geometry),
    var land = topojson.feature(topo, topo.objects.land),
      grid = graticule();


    var startN = null; //the starting point of the path
    for (k in places) {
      startN = places[k];
      break;
    }
    var endN = null; //the end point of the path
    for (k in places) {
      endN = places[k];
    }

    NProgress.done();
    $("#background0").fadeOut(1000);
    $("#explore").fadeIn(5000);

    //////the timmer//////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    d3.timer(function() {
      if (nowNum + 1 === nodeNum) {
        $("#next").removeClass("btn_act");
      }

      context.clearRect(0, 0, width, height);

      //auto adjust control menu
      var mediah = 0;
      var storyh = $("#story p").height();

      if ($("#media iframe").attr("src").length > 0)
        mediah = $("#media iframe").height();
      else
        mediah = $("#media img").height();
      $("#control").css("height", (mediah + storyh + 220));
      $("#control").css("top", (60 + ($("#map").height() - 60 - (250 - detail_control * 150)) / 2 - $("#control").height() / 2));
      $("#story").css("top", (mediah + 120));

      trackscale += 0.2;
      lat_old = getNode(places, (nowNum - 1 + nodeNum) % nodeNum)[0];
      lng_old = getNode(places, (nowNum - 1 + nodeNum) % nodeNum)[1];

      //the target of this move
      lat = getNode(places, nowNum)[0];
      lng = getNode(places, nowNum)[1];


      var dis = distanceSQ([lat_old, lng_old], [lat, lng]);

      if (dis < 100) {
        countmove = 2;
      } else {
        countmove = 1;
      }

      var pre_num;
      var next_num;

      if (nowNum === 0) {
        pre_num = 0;
        next_num = 1;
      } else if (nowNum + 1 === nodeNum) {
        pre_num = nowNum - 1;
        next_num = 0;

      } else {
        pre_num = nowNum - 1;
        next_num = nowNum + 1;

      }

      var keys = Object.keys(places);
      var pre_important;
      var next_important;
      var important = places[keys[nowNum]][3].length + places[keys[nowNum]][4].length + places[keys[nowNum]][5].length;
      if (pre_num != 0 && next_num != 0) { //those that are in the middle
        pre_important = places[keys[pre_num]][3].length + places[keys[pre_num]][4].length + places[keys[pre_num]][5].length;
        next_important = places[keys[next_num]][3].length + places[keys[next_num]][4].length + places[keys[next_num]][5].length;
      } else if (pre_num === 0) { //the first one
        pre_important = true;
        next_important = places[keys[next_num]][3].length + places[keys[next_num]][4].length + places[keys[next_num]][5].length;
      } else { //the last one
        pre_important = places[keys[pre_num]][3].length + places[keys[pre_num]][4].length + places[keys[pre_num]][5].length;
        important = true;
      }

      if (nowNum + 1 === nodeNum) important = true;


      var local_scale = 1;


      if (count / oneMove <= 0.01 || count / oneMove >= 0.99) { //start and end
        if (dis >= 100) { //long distance path
          if ((!pre_important) && (!important)) local_scale = 4;
          //local_scale = (0.5-Math.abs(0.5-count / oneMove))*19/20+1/20;
          else if (important && count / oneMove >= 0.99) local_scale = 1 / 25;
          else if (pre_important && count / oneMove <= 0.01) local_scale = 1 / 25;
          else
            local_scale = 4; //move slow
        } else if (pre_important && important && dis < 0.1) local_scale = 4;
        else if ((!pre_important) && (!important)) local_scale = 4;
        else local_scale = 1 / 25; //move slow

      } else { //interval path
        if (dis >= 100) local_scale = 2; //regular speed
        else if (dis > 0.1)
          local_scale = 4;
        else if (pre_important && important) local_scale = 4;
        else local_scale = 50;
      }



      if (moveToggle) {

        if (Math.abs(count - oneMove) <= countmove * local_scale) { //one move is finished, start the next one
          //if next one have notes, stop there,otherwise keep moving

          if (finishsign === 0) {
            updateContent(nowNum);
            cont = false;
            finishsign = 1;

          }

          var keys = Object.keys(places);
          var important = places[keys[nowNum]][3].length + places[keys[nowNum]][4].length + places[keys[nowNum]][5].length;
          if (important > 0) important = true;
          else important = false;

          if (!important) { //don't have additional information
            if (nowNum + 1 != nodeNum) {
              count = 0;
              nowNum = nowNum + 1; //next node to target
              nowNum = nowNum % nodeNum; //cycle the loop
              moveToggle = true;
            } else {
              $("#finishsign").fadeIn(2000);

            }


          } else if (cont) { //have information, need to stop there and zoom in
            updateContent(nowNum);
            cont = false;

            //moveToggle = false;
          }


        } else { //move is not finished
          count += countmove * local_scale;
          finishsign = 0;
        }
      }

      var timephase = count % oneMove; //the current phase of this move
      var phasePercentage = timephase / oneMove; //the completion percentage of the current move

      if (moveToggle)
        if (phasePercentage === 0) phasePercentage = 1;

        //rate the closeness to nodes
        //0.5: close! at nodes
        //0: far! at the middle of two nodes

      var intertarget = interPt([lat_old, lng_old], [lat, lng], phasePercentage);

      //change the projection based on rotate value
      //projection.rotate([speed * (Date.now() - start), -15]).clipAngle(90);
      projection.rotate([-intertarget[0], -intertarget[1]]); //.clipAngle(90);

      patho = d3.geo.path().projection(projection); //rotate the path

      pastData = { //create current route data
        type: "LineString",
        coordinates: []
      }

      var pastcoo = [];
      var routeRam2 = jQuery.extend(true, {}, route); //deep copy
      pastcoo = ramwhole(routeRam2.coordinates, nowNum - 1);

      if (nowNum != 1)
        pastData.coordinates = pastcoo;
      else
        pastData.coordinates = [];

      pastRoute //create current route
        .datum(pastData)
        .attr("class", "pastroute")
        .attr("d", patho);
      /*      pastRoute_blur //create current route
              .datum(pastData)
              .attr("class", "pastroute_blur")
              .attr("d", patho);
      */
      var myD = patho(routeRam); //redo the projection

      myroute //reset the route drawn on the map
        .attr("class", "route")
        .attr("d", myD);

      curData = { //create current route data
        type: "LineString",
        coordinates: []
      }

      var curcoo = [
        [lat_old, lng_old],
        [lat, lng]
      ];
      curcoo = randomDir(curcoo[0], curcoo[1]);
      curcoo = ratioDir(curcoo, phasePercentage);

      curData.coordinates = curcoo;

      CuRoute //create current route
        .datum(curData)
        .attr("class", "curroute")
        .attr("d", patho);

      //console.log("Current Path:" + curPath + "||Current Node:" + nowNum + "||Total Node:" + nodeNum);
      //console.log(phasePercentage);



      track
        .attr("transform", translateAlong2(CuRoute.node(), (1)));

      var mylat, mylng;
      var raw = track.attr("transform");
      raw = raw.split("(")[1];
      raw = raw.split(")")[0];
      mylat = raw.split(",")[0];
      mylng = raw.split(",")[1];

      var p_r = projection.invert(
        [mylat, mylng]
      );

      if (nowNum === 0) {
        pre_num = 0;
        next_num = 1;
      } else if (nowNum + 1 === nodeNum) {
        pre_num = nowNum - 1;
        next_num = 0;

      } else {
        pre_num = nowNum - 1;
        next_num = nowNum + 1;

      }

      var pretime = xScale(getNode(places, pre_num)[2]);
      var nextime = xScale(getNode(places, nowNum)[2]);

      var thisratio = phasePercentage;
      if (thisratio === 1) thisratio = 0;
      var nowtime = pretime + (nextime - pretime) * thisratio;

      timeMark
        .attr("transform", "translate(" + nowtime + "," + (20 + 2.5) + ")");

      keys = Object.keys(places);
      important = places[keys[nowNum]][3].length + places[keys[nowNum]][4].length + places[keys[nowNum]][5].length;
      if (pre_num != 0 && next_num != 0) { //those that are in the middle
        pre_important = places[keys[pre_num]][3].length + places[keys[pre_num]][4].length + places[keys[pre_num]][5].length;
        next_important = places[keys[next_num]][3].length || places[keys[next_num]][4].length || places[keys[next_num]][5].length;
      } else if (pre_num === 0) { //the first one
        pre_important = true;
        next_important = places[keys[next_num]][3].length + places[keys[next_num]][4].length + places[keys[next_num]][5].length;
      } else { //the last one
        pre_important = places[keys[pre_num]][3].length + places[keys[pre_num]][4].length + places[keys[pre_num]][5].length;
        important = true;
      }

      if (nowNum + 1 == nodeNum) important = true;

      //console.log(pre_important,important,next_important);
      //console.log(phasePercentage);

      if (pre_important && (!important)) { //need to zoom out and stay zooming out
        //console.log("zoomout");
        flyZoomout(p_r, phasePercentage, dis, zoombase);

      } else if (pre_important && important) { //need to zoom out and then zoom in
        //console.log("zoomout and in");
        if (dis < 100) {
          flyZoomed(p_r, phasePercentage, dis, zoombase);
        } else {
          flyalone(p_r, phasePercentage, dis, zoombase);
        }

        next_control = true;

      } else if ((!pre_important) && important) { //need to zoom in from out
        //console.log("zoomin");
        flyZoomin(p_r, phasePercentage, dis, zoombase);
        next_control = true;

      } else if ((!pre_important) && (!important)) { //need to stay zoom out
        //console.log("stayout");
        flyNozoom(p_r, phasePercentage, dis, zoombase);

      }



/*      point.attr("transform", function(d) { //rotate the nodes
        return "translate(" + projection(d.value) + ")";
      });*/



      var closeRate = Math.abs(0.5 - phasePercentage);

      var newlst = [
        [lat_old, lng_old], p_r
      ];

      if (lat_old < 0 && p_r[0] > 0 && p_r[0] - lat_old < 180) {

        var newpt = [0, -lat_old / (p_r[0] - lat_old) * (p_r[1] - lng_old) + lng_old];

        newlst = [
          [lat_old, lng_old], newpt, [p_r[0], p_r[1]]
        ];

      } else if (lat_old < 0 && p_r[0] > 0 && p_r[0] - lat_old > 180) {
        newlst = [
          [lat_old + 360, lng_old],
          [p_r[0], p_r[1] + 360]
        ];



      }

      var linedata = lineFunction(reptojectMap(newlst));
      route_map
        .attr("d", linedata);
      /*      route_map_blur
              .attr("d", linedata);
      */

      if (nowNum != 1) {

        var linedata = lineFunction(reptojectMap(fixloop(pastData.coordinates)));
        pastRoute_map //create current route
          .attr("d", linedata);
        /*        pastRoute_map_blur //create current route
                  .attr("d", linedata);
        */
      } else {
        var linedata = lineFunction([]);
        pastRoute_map //create current route
          .attr("d", linedata);
        /*        pastRoute_map_blur //create current route
                  .attr("d", linedata);
        */
      }

      track.attr("r", 1 * (trackscale % 4) + 1); //change the tracker's r according to closerate
      track_f.attr("r", 2 * (trackscale % 4) + 4); //change the tracker's r according to closerate

      context.beginPath(); //draw the outbound of the sphere
      path(sphere);
      context.lineWidth = 1;
      context.strokeStyle = "none";
      context.stroke();
      context.fillStyle = "rgba(50,50,50,0.9)";
      context.fill();

      projection.clipAngle(90); //clip the back half of the land

      context.beginPath();
      path(land);
      context.fillStyle = "rgb(25,25,25)";
      context.fill();
      context.lineWidth = .5;
      context.strokeStyle = "rgb(25,25,25)";
      context.stroke();


      /*      context.beginPath(); //grid
            path(grid);
            context.lineWidth = .2;
            context.strokeStyle = "rgba(119,119,119,.5)";
            context.stroke();
      */

    });
  });

}



//update content after selecting a specific path
var update = function(current) {
  places = getNode(places_multi, current);
  route = getNode(route_multi, current);
  routeRam = jQuery.extend(true, {}, route); //deep copy
  routeRam.coordinates = ramwhole(routeRam.coordinates, 0);

  myroute
    .datum(routeRam)
    .attr("class", "route")
    .attr("d", patho);

  CuRoute
    .attr("class", "curroute")
    /*  CuRoute_blur
        .attr("class", "curroute_blur")
    */

/*  $(".points").remove();
  point = svg.append("g")
    .attr("class", "points")
    .selectAll("g")
    .data(d3.entries(places))
    .enter().append("g")
    .attr("id", function(d, i) {
      return "point" + i;
    })
    .attr("class", "mypoints")
    .attr("transform", function(d) {
      return "translate(" + projection(d.value) + ")";
    })
    .on("click", function(d, i) {
      nowNum = i;
      updateContent(nowNum);
      moveToggle = false;
      cont = false; //loop not started
      count = oneMove_default - 0.0001; //to measure the interval
      flyto(getNode(places, nowNum), 3);

    });

  point.append("circle") //show circle on each point
    .attr("r", 1.5);
*/

  $(".track").remove();
  track = svg.append("g") //red circle
    .append("circle")
    .attr("class", "track")
    .attr("r", 2)
    .attr("fill", "none")
    .attr("stroke", "#39a4e8")
    .attr("stroke-width", "3px")
    .attr("transform", "translate(100,100)");

  track_f = svgtrack.append("g") //red circle
    .append("circle")
    .attr("class", "track")
    .attr("id", "fake_track2")
    .attr("r", 2)
    .attr("fill", "none")
    .attr("stroke", "#39a4e8")
    .attr("stroke-width", "3px")
    .attr("transform", "translate(" + 25 + "," + 25 + ")");

  track_ff = svgtrack.append("g") //red circle
    .append("circle")
    .attr("class", "track")
    .attr("id", "fake_track1")
    .attr("r", 3)
    .attr("fill", "white")
    .attr("stroke", "white")
    .attr("stroke-width", "3px")
    .attr("transform", "translate(" + 25 + "," + 25 + ")");

  $(".timeid").remove();

  timeBase = svg0.select(".timebase") //time mark
    .selectAll("g")
    .data(d3.entries(places))
    .enter().append("g")
    .attr("transform", function(d) {
      var myx = xScale(d.value[2]);
      return "translate(" + myx + "," + (20 + 2.5) + ")";
    })
    .attr("class", "timeid")
    .attr("id", function(d, i) {
      return "timeid" + i;
    })
    .on("click", function(d, i) {
      nowNum = i;
      updateContent(nowNum);
      moveToggle = false;
      cont = false; //loop not started
      count = oneMove_default - 0.01; //to measure the interval
      flyto(getNode(places, nowNum), 3);
      next_control = true;


      if (nowNum === 0) {
        nowNum = 1;
        count = 0;


      }

    });

  timeBase.append("rect")
    .attr("class", "timebaserect")
    .attr("y", 22)
    .attr("x", -0.75)
    .attr("width", 1.5)
    .attr("height", 10)
    .attr("fill", "#565656")
    .on("mouseover", function() {
      d3.select(this).attr("width", 4)
        .attr("x", -2)
        .attr("y", 19.5)
        .attr("height", 15);
    })
    .on("mouseout", function() {
      d3.select(this).attr("width", 1.5)
        .attr("x", -0.75)
        .attr("y", 22)
        .attr("height", 10);
    });


  /*  point.append("text") //show text on each point
      .attr("y", 10)
      .attr("dy", ".71em")
      .attr("class", "locName")
      .text(function(d) {
        return d.key.split("_")[1].split(" ")[0].split(",")[0];
      });*/

  nodeNum = route.coordinates.length; //the total number of nodes
  nowNum = 1; //current node to target to
  oneMove = oneMove_default; //the interval for each focus
  count = 0; //to measure the interval

  updateContent(0);

}