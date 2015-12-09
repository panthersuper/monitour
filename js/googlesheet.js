d3.tsv("http://cors.io/?u=https://docs.google.com/spreadsheets/d/1nrsZSqrpaUkYec4MyDfBDqp61ciClA-sKUAAxGClYrg/pub?output=tsv", function(error, data) {
  if (error) {

  	console.log("errorloading google sheet");

  }
  else {



  	console.log(data);
  }
});