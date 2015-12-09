   var lineFunction0 = d3.svg.line()
      .x(function(d) {
         return d[0];
      })
      .y(function(d) {
         return d[1];
      })
      .interpolate("linear");

   function translateAlong(path) {
      var l = path.getTotalLength();

      return function(i) {
         return function(t) {
            var p = path.getPointAtLength(t * l);
            return "translate(" + (p.x - path.getPointAtLength(0).x) + "," + (p.y - path.getPointAtLength(0).y) + ")"; //Move marker
         }
      }
   }

   function getSmoothInterpolation(data) {
      return function() { //return a reference to this function
         var interpolate = d3.scale.linear()
            .domain([0, 1])
            .range([1, data.length + 1]);

         return function(t) {

        averageday = Math.round((+dayfiltered)/(+localfilternum)*t);
        averagedis = Math.round((+disfiltered)/(+localfilternum)*t);

        averagedis = numberWithCommas(averagedis.toString());
        averageday = numberWithCommas(averageday.toString());

        $("#distat").html("Average Travel Distance: <strong style = 'font-size:30px; color:white'>"+averagedis+"</strong> km");
        $("#timestat").html("Average Travel Time: <strong style = 'font-size:30px; color:white'>"+averageday+"</strong> days");


            var flooredX = Math.floor(interpolate(t));
            var interpolatedLine = data.slice(0, flooredX); //previous segments

            if (flooredX > 0 && flooredX < data.length) { //iteration is not done
               var weight = interpolate(t) - flooredX; //calculate the weight on this segment
               var myY = data[flooredX].y * weight + data[flooredX - 1].y * (1 - weight);
               var myX = data[flooredX].x * weight + data[flooredX - 1].x * (1 - weight);

               interpolatedLine.push({
                  "x": myX,
                  "y": myY
               }); //add the current segment

            }

            return lineFunction(interpolatedLine);
         }
      }
   }



   var cleanlst_dis = function(lst) {
      //clean lst based on overall distance
      var orilst = lst;
      for (var i = 1; i < orilst.length; i++) {
         var pt1 = orilst[i]

         var mark = 0;

         for (var j = 0; j < orilst.length; j++) {
            if (i != j) {
               var pt2 = orilst[j];
               var dis = getDistanceFromLatLonInKm(pt1[0], pt1[1], pt2[0], pt2[1]);
               if (dis < 300) {
                  mark = 1;

               }
            }
         }
         if (mark != 0) {
            orilst.splice(i, 1);
            i--;



         }
      }

      return orilst;


   }

   var revGeocoding_class = function(lat, lng, myclass) {
      var returnvalue = null;
      if (lng < -180) lng = lng + 360;

      var mystr = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=AIzaSyBG1a8rdla5buwncdaUp8gQCKp_ePgI6wA&language=en';

      $.when($.getJSON(mystr)).done(function(data) {
         var country = null;
         var state = null;
         var city = null;
         var addr = null;
         if (data.results[0] != undefined)
            addr = data.results[0].address_components;
         else {
            //console.log(lng, lat);

         }

         for (i in addr) {
            var type = addr[i].types[0]
            if (type === "country") country = addr[i].short_name;
            if (type === "administrative_area_level_1") state = addr[i].short_name;
            if (type === "locality") city = addr[i].short_name;
         }
         if (country === "US")
            returnvalue = city + ", " + state;
         else returnvalue = city + ", " + state + ", " + country;

         if (city === null) returnvalue = state + ", " + country;
         if (state === null) returnvalue = country;
         if (returnvalue === null) returnvalue = "";

         returnvalue = returnvalue.toUpperCase();
         d3.select("." + myclass).append("p") //show text on each point
            .attr("class", "locName")
            .text(returnvalue);
      });
   }

   function reptojectMap0(lst) {
      var mylst = []
      for (k in lst) {
         mylst.push(map0.project(lst[k]));
      }

      return mylst;
   }

   Object.size = function(obj) {
      var size = 0,
         key;
      for (key in obj) {
         if (obj.hasOwnProperty(key)) size++;
      }
      return size;
   };

   var curvePath = function(lst) {
      //a list of points
      var R = 400;

      var newlst = []
      for (var i = 0; i < lst.length - 1; i++) {
         var pt1 = [lst[i].x, lst[i].y];
         var pt2 = [lst[i + 1].x, lst[i + 1].y];

         var dist = distance(pt1, pt2);

         var totalY = (pt1[1] + pt2[1]) / 2;
         var disY = R - Math.sqrt(R * R - (dist / 2) * (dist / 2));

         var zeroY = map0.project([-70, 33.928033]).y;
         if (totalY < zeroY) disY = -disY;

         newlst.push(lst[i]);

         if (dist > 10) {

            var newx = (pt1[0] + pt2[0]) / 2;
            var newy = (pt1[1] + pt2[1]) / 2 + disY;


            var newpt = {
               "x": newx,
               "y": newy
            };


            newlst.push(newpt);

         }



      }

      newlst.push(lst[lst.length - 1]);
      return newlst;


   }

   function Dis_w(lst) {
      //calculate the travel distanse from the beginning to the current note
      var mydis = 0;
      for (var i = 0; i < lst.length - 1; i++) {

         mydis += getDistanceFromLatLonInKm(lst[i][0], lst[i][1], lst[i + 1][0], lst[i + 1][1]);
      }


      mydis = Math.round(mydis * 10) / 10;

      return mydis;
   }

   function allDays_w(Num) {
      //calculate the days taveled 
      var place = getNode(places_multi, Num);
      var length = Object.size(place);

      var firstDate = getNode(place, 0)[2];
      var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      var secondDate = getNode(place, length - 1)[2];

      var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

      return diffDays;
   }

   var places_multi = {};
   var route_multi = {};
   var lineFunction = d3.svg.line()
      .x(function(d) {
         return d.x;
      })
      .y(function(d) {
         return d.y;
      })
      .interpolate("linear");

   var thisrun = function(){


      d3.select(window).on('resize', function() {
         count1 = 0;
         count2 = 0;
      });

      var count1 = 0;
      var count2 = 1;
      d3.timer(function() {
         if (count1 < 5) {
            resize();
            count1++;

         } else if (count2 === 0) {
            if(overallpath_on)
            animate_path();
            count2 = 1;
         }


      });


   }

thisrun();