

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}


function nowDis(lst) {
  //calculate the travel distanse from the beginning to the current note
  var mydis = 0;
  for (var i = 0; i < lst.length - 1; i++) {

    mydis += getDistanceFromLatLonInKm(lst[i][0], lst[i][1], lst[i + 1][0], lst[i + 1][1]);
  }


  mydis = Math.round(mydis);

  return mydis;
}

function nowDays(nowNum) {
  //calculate the days taveled 
  var firstDate = getNode(places, 0)[2];
  var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  if(nowNum!=0){
    var secondDate = getNode(places, nowNum)[2];
  }
  else var secondDate = firstDate;

  var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

  return diffDays;
}

function fixloop(lst) {
  //fix the loop error for path on globe by adding an additional point in the middle, or by offset the path to next cycle
  var mynew = [];

  var left_right;
  var index = null;

  for (var i = 0; i < lst.length - 1; i++) {

    if (lst[i][0] < 0 && lst[i + 1][0] > 0 && lst[i + 1][0] - lst[i][0] < 180) {

      left_right = true;
      index = i;

      break;
    } else if (lst[i][0] < 0 && lst[i + 1][0] > 0 && lst[i + 1][0] - lst[i][0] > 180) {
      left_right = false;
      index = i;

      break;
    }
    left_right = -1;
  }

  if (left_right === -1) {
    return lst;
  } else if (left_right === true) {
    for (var i = 0; i < lst.length; i++) {
      if (i === index) {
        var newpt = [0, -lst[i][0] / (lst[i + 1][0] - lst[i][0]) * (lst[i + 1][1] - lst[i][1]) + lst[i][1]];
        //var newpt = [360, 1];
        mynew.push(lst[i]);
        mynew.push(newpt);

      } else {
        mynew.push(lst[i]);
      }
    }

    return mynew;
  } else {

    for (var i = 0; i < lst.length; i++) {
      //mynew.push([(lst[i][0] + 360) % 360, lst[i][1]]);
      mynew.push([(lst[i][0] + 360) % 360, lst[i][1]]);
    }

    return mynew;
  }

}

function fixloop2(lst) {
  //fix the loop error for path on globe by adding an additional point in the middle, or by offset the path to next cycle
  var mynew = [];

  var left_right;
  var index = null;

  for (var i = 0; i < lst.length - 1; i++) {

    if (lst[i][0] < 0 && lst[i + 1][0] > 0 && lst[i + 1][0] - lst[i][0] < 180) {

      left_right = true;
      index = i;

      break;
    } else if (lst[i][0] < 0 && lst[i + 1][0] > 0 && lst[i + 1][0] - lst[i][0] > 180) {
      left_right = false;
      index = i;

      break;
    }
    left_right = -1;
  }

  if (left_right === -1) {
    return lst;
  } else if (left_right === true) {
    for (var i = 0; i < lst.length; i++) {
      if (i === index) {
        var newpt = [0, -lst[i][0] / (lst[i + 1][0] - lst[i][0]) * (lst[i + 1][1] - lst[i][1]) + lst[i][1]];
        //var newpt = [360, 1];
        mynew.push(lst[i]);
        mynew.push(newpt);

      } else {
        mynew.push(lst[i]);
      }
    }

    return mynew;
  } else {

    for (var i = 0; i < lst.length; i++) {
      //mynew.push([(lst[i][0] + 360) % 360, lst[i][1]]);
      mynew.push([(lst[i][0] + 360) % 360-360, lst[i][1]]);
    }

    return mynew;
  }

}

function reptojectMap(lst) {
  var mylst = []
  for (k in lst) {
    mylst.push(map.project(lst[k]));
  }

  return mylst;
}

function flyNozoom(tgt, ratio, dis,zoombase) {
  var zoomspan = 6;
  var mypitch = 0;

  //var myzoom = Math.pow((Math.abs(ratio - 0.5)), 8) * 128 * 2 * 2 * 2 * 2 + 3; //[3,10]

  //if (dis < 1000) zoomspan = 3 + dis / 1000 * 5;
  if(zoombase<7.5) zoomspan = zoombase-1.5;

  myzoom = zoombase-zoomspan;

  if (myzoom<1.5) myzoom=1.5;

  map.jumpTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.

    center: tgt,
    zoom: myzoom,
    //zoom:1,
    bearing: 0,
    pitch: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.


    easing: function(t) {

      return t;
    }
  });
}

function flyZoomout(tgt, ratio, dis,zoombase) {
  var zoomspan = 6;
  var mypitch = 0;

  //var myzoom = Math.pow((Math.abs(ratio - 0.5)), 8) * 128 * 2 * 2 * 2 * 2 + 3; //[3,10]

  //if (dis < 1000) zoomspan = 3 + dis / 1000 * 5;
  if(zoombase<7.5) zoomspan = zoombase-1.5;

  if (ratio < 0.01) {
    myzoom = zoombase - ratio / 0.01 * zoomspan;
    //mypitch = (0.005-Math.abs(ratio - 0.005))/0.005*60;
  } else myzoom = zoombase - zoomspan;

  if (myzoom<1.5) myzoom=1.5;

  map.jumpTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.

    center: tgt,
    zoom: myzoom,
    //zoom:1,
    bearing: 0,
    pitch: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.


    easing: function(t) {

      return t;
    }
  });
}

function flyZoomin(tgt, ratio, dis,zoombase) {
  var zoomspan = 6;
  var mypitch = 0;
  if(zoombase<7.5) zoomspan = zoombase-1.5;

  //var myzoom = Math.pow((Math.abs(ratio - 0.5)), 8) * 128 * 2 * 2 * 2 * 2 + 3; //[3,10]

  //if (dis < 1000) zoomspan = 3 + dis / 1000 * 5;



  if (ratio > 0.99) {
    myzoom = zoombase - (1 - ratio) / 0.01 * zoomspan;
    //mypitch = (0.005-Math.abs(ratio - 0.995))/0.005*60;
  } else myzoom = zoombase - zoomspan;

  if (myzoom<1.5) myzoom=1.5;

  map.jumpTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.

    center: tgt,
    zoom: myzoom,
    //zoom:1,
    bearing: 0,
    pitch: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.


    easing: function(t) {

      return t;
    }
  });
}


function flyalone(tgt, ratio, dis,zoombase) {

  var zoomspan = 6;
  var mypitch = 0;
  if(zoombase<7.5) zoomspan = zoombase-1.5;

  //var myzoom = Math.pow((Math.abs(ratio - 0.5)), 8) * 128 * 2 * 2 * 2 * 2 + 3; //[3,10]

  if (dis < 1000) zoomspan = 3 + dis / 1000 * 5;



  if (ratio < 0.01) {
    myzoom = zoombase - ratio / 0.01 * zoomspan;
    //mypitch = (0.005-Math.abs(ratio - 0.005))/0.005*60;
  } else if (ratio > 0.99) {
    myzoom = zoombase - (1 - ratio) / 0.01 * zoomspan;
    //mypitch = (0.005-Math.abs(ratio - 0.995))/0.005*60;
  } else myzoom = zoombase - zoomspan;

  if (myzoom<1.5) myzoom=1.5;

  map.jumpTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.

    center: tgt,
    zoom: myzoom,
    //zoom:1,
    bearing: 0,
    pitch: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.


    easing: function(t) {

      return t;
    }
  });

}


function flyZoomed(tgt, ratio, dis,zoombase) {
  var zoomspan = null;
  zoomspan = dis / 100 * 4;
  if (dis < 50) zoomspan = 2;
  var mypitch = 0;
  var myzoom = Math.pow((Math.abs(ratio - 0.5)), 4) * 32 * 2 * zoomspan / 4 + (zoombase+1 - zoomspan); //[7,11]
  if (dis < 0.1) {
    myzoom = zoombase+1;
    mypitch = 0;

  }

  if (myzoom<1.5) myzoom=1.5;

  map.jumpTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.

    center: tgt,
    zoom: myzoom - 1,
    bearing: 0,
    pitch: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.


    easing: function(t) {

      return t;
    }
  });
}



function flyto(tgt, spd) {

  map.flyTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.
    center: tgt,
    zoom: 11,
    bearing: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    speed: spd, // make the flying slow
    curve: 1, // change the speed at which it zooms out

    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.



    easing: function(t) {
      $("#fake_track1").attr("opacity", 2 * Math.abs(0.5 - t));
      $("#fake_track2").attr("opacity", 2 * Math.abs(0.5 - t));

      return t;
    }
  });
}


function ZOOMOUT(spd) {

  map.flyTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.
    //center: tgt,
    zoom: 5,
    bearing: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    speed: spd, // make the flying slow
    curve: 100, // change the speed at which it zooms out

    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.
    easing: function(t) {
      return t;
    }
  });
}

function ZOOMIN(spd) {

  map.flyTo({
    // These options control the ending camera position: centered at
    // the target, at zoom level 9, and north up.
    //center: tgt,
    zoom: 11,
    bearing: 0,

    // These options control the flight curve, making it move
    // slowly and zoom out almost completely before starting
    // to pan.
    speed: spd, // make the flying slow
    curve: 100, // change the speed at which it zooms out

    // This can be any easing function: it takes a number between
    // 0 and 1 and returns another number between 0 and 1.
    easing: function(t) {
      return t;
    }
  });
}


Object.size = function(obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var getNode = function(placeList, i) { //get the certain node from the place list
  var item = 0;
  var node = null;
  for (k in placeList) {

    if (item === i) {
      node = placeList[k];
      break;
    }
    item++;

  }
  return node;
}

var getKey = function(placeList, i) { //get the certain node from the place list
  var item = 0;
  var key = null;
  for (k in placeList) {

    if (item === i) {
      key = k;
      break;
    }
    item++;

  }
  return key;
}

var interPt = function(ptA, ptB, t) {
  //the the interval point between point A and point B, at the t position
  //solve the problem of crossing the zero lat line
  var x = null;
  var y = (ptB[1] - ptA[1]) * t + ptA[1];

  if (ptA[0] >= 0 && ptB[0] >= 0 || ptA[0] <= 0 && ptB[0] <= 0) {
    x = (ptB[0] - ptA[0]) * t + ptA[0];
  } else if (Math.abs(ptA[0] - ptB[0]) < 180) {
    x = (ptB[0] - ptA[0]) * t + ptA[0];
  } else {
    x = ((ptB[0] + 360) % 360 - (ptA[0] + 360) % 360) * t + (ptA[0] + 360) % 360;
  }
  return [x, y];
}

var translateAlong2 = function(path, m) {
  var l = path.getTotalLength();
  var p = path.getPointAtLength(m * l);

  return "translate(" + p.x + "," + p.y + ")"; //Move marker
}

var distanceSQ = function(nodeA, nodeB) {
  return (nodeA[0] - nodeB[0]) * (nodeA[0] - nodeB[0]) + (nodeA[1] - nodeB[1]) * (nodeA[1] - nodeB[1]);
}

var distance = function(nodeA, nodeB) {
  return Math.sqrt(distanceSQ(nodeA, nodeB));
}

function getDate(time) {
  var myDate = new Date(time * 1000);
  return myDate;
}

var cleanLst = function(places, thresh) {
  //delete the first data if distance is too close

  var num = Object.size(places);
  var keys = Object.keys(places);
  var last = places[keys[keys.length-1]];

  for (var i = 1; i < num - 1; i++) {
    var a = [places[keys[i]][0], places[keys[i]][1]];
    var b = [places[keys[i + 1]][0], places[keys[i + 1]][1]];
    var dis = distanceSQ(a, b);
    var important = places[keys[i]][3].length + places[keys[i]][4].length + places[keys[i]][5].length+ places[keys[i]][6].length;
    if(i==0) important = 0;
    if (important > 0) important = true;
    else important = false;

    if (dis < thresh && (!important)) {
      delete places[keys[i]];
    }

  }

  if(Object.size(places)==1){
    places[keys[keys.length-1]] = last;
  }
}

Math.seed = function(s) {
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};

var randomDir = function(nodeA, nodeB) {
  //create a noise route between A and B, for distance that is more than thresh
  //by insert num of new nodes in between
  var lst = [];
  //var dis = distanceSQ(nodeA, nodeB);
  var threshA = 1;
  var threshB = 600;

  //var num = Math.round(Math.sqrt(dis));
  num = 8;
  var ratio = num / 30;

  if (num < 10) {
    num = 10;
  }
  /*  if (dis < threshA || dis > threshB) {
   */
  for (var i = 0; i <= num; i++) {
    var t = i / num
    var node = interPt(nodeA, nodeB, t);
    lst.push(node);
  }
  /*  } else {
      lst.push(nodeA);
      var start = nodeA;

      for (var i = 0; i < num; i++) {
        var dir = [(nodeB[0] - start[0]) / (num + 1 - i), (nodeB[1] - start[1]) / (num + 1 - i)];
        var random1 = Math.seed(i + 1);
        var random2 = Math.seed(random1());
        Math.random = Math.seed(random2());
        var ram = [(Math.random() - 1) * ratio, (Math.random() - 1) * ratio];
        var node = [start[0] + dir[0] + ram[0], start[1] + dir[1] + ram[1]];
        lst.push(node);
        start = node;
      }
      lst.push(nodeB);
    }
  */
  return lst;
}

var ramwhole = function(lst, upto) { //randomnize the whole list
  var mylst = [];
  if (upto === 0) {
    for (var i = 0; i < lst.length - 1; i++) {
      var temp = randomDir(lst[i], lst[i + 1]);
      mylst.push.apply(mylst, temp);
    }
    return mylst;
  } else {
    for (var i = 0; i < upto; i++) {
      var temp = randomDir(lst[i], lst[i + 1]);
      mylst.push.apply(mylst, temp);
    }
    return mylst;
  }



}

var revGeocoding = function(lat, lng, id) {
  var returnvalue = null;
  var mystr = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=AIzaSyBG1a8rdla5buwncdaUp8gQCKp_ePgI6wA&language=en';

  $.when($.getJSON(mystr)).done(function(data) {
    var country = null;
    var state = null;
    var city = null;
    var addr = data.results[0].address_components;

    for (i in addr) {
      var type = addr[i].types[0]
      if (type === "country") country = addr[i].short_name;
      if (type === "administrative_area_level_1") state = addr[i].short_name;
      if (type === "locality") city = addr[i].short_name;
    }

    returnvalue = city + ", " + state + ", " + country;

    if (city === null) returnvalue = state + ", " + country;
    if (state === null) returnvalue = country;

    returnvalue = returnvalue.toUpperCase();
    d3.select("#" + id).append("text") //show text on each point
      .attr("y", -10)
      .attr("x", 10)
      .attr("dy", ".71em")
      .attr("class", "locName")
      .text(function(d) {
        return returnvalue;
      });
  });
}


var removetext = function(id) {
  d3.selectAll(".mypoints" + " text")
    .remove();
}

var lineFunction = d3.svg.line()
  .x(function(d) {
    return d[0];
  })
  .y(function(d) {
    return d[1];
  })
  .interpolate("linear");


var lineFunction = d3.svg.line()
  .x(function(d) {
    return d[0];
  })
  .y(function(d) {
    return d[1];
  })
  .interpolate("linear");

function ratioDir(data, m, projection) {
  var interpolate = d3.scale.linear()
    .domain([0, 1])
    .range([1, data.length + 1]);

  var flooredX = Math.floor(interpolate(m));
  var interpolatedLine = data.slice(0, flooredX); //previous segments

  if (flooredX > 0 && flooredX < data.length) { //iteration is not done
    var weight = interpolate(m) - flooredX; //calculate the weight on this segment

    var nodeA = data[flooredX - 1];
    var nodeB = data[flooredX];
    var target = interPt(nodeA, nodeB, weight);


    /*        var myY = data[flooredX][1] * weight + data[flooredX - 1][1] * (1 - weight);
            var myX = data[flooredX][0] * weight + data[flooredX - 1][0] * (1 - weight);
            */
    interpolatedLine.push(target); //add the current segment
  }

  return interpolatedLine;


}