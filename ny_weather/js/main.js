$(document).ready(function(){



	var canvas = document.getElementById('myCanvas');

	//Check if the browser supports canvas
	if(canvas.getContext){	

		/*---------- WEATHER API ----------*/

		//Getting the current date
		var currentTime = new Date();
		var currentDate = ('0' + currentTime.getDate().toString()).substr(-2);
		var currentMonth = ('0' + (currentTime.getMonth() + 1).toString()).substr(-2);
		var currentYear = currentTime.getFullYear();
		var currentHour = currentTime.getHours();
		//console.log(currentTime);
		//console.log(currentDate);
		//console.log(currentMonth);
		//console.log(currentYear);
		console.log(currentHour);

		var api_key = 'f8c6afe10d5da2bf';	
		var selectedYear = currentYear - 50 + parseInt($('#yearRange').val());

		//Weather vars
			//Today
			var currentTemp;
			var currentHigh;
			var currentLow;

			//Selected year
			var yearAverage;
			var yearHigh;
			var yearLow;

			//Historical average
			var almanacHigh;
			var almanacLow;	

		function getCurrentObservation(){
			// var search_url = 'http://api.wunderground.com/api/'+api_key+'/conditions/q/NY/New_York.json?callback=?';
			var search_url = 'http://api.wunderground.com/api/'+api_key+'/conditions/forecast/almanac/q/NY/New_York.json?callback=?'; 			

			$.getJSON(search_url,function(json){
			console.log(json);

				//Conditions
				var conditions = json.current_observation; //get the current observation from JSON
				currentTemp = conditions.temp_f; //create a var for temperature
				var weather = conditions.weather;
				// console.log(conditions);
				// console.log(temp);

				//Forecast
				var forecast = json.forecast;
				currentHigh = forecast.simpleforecast.forecastday[0].high.fahrenheit;
				currentLow = forecast.simpleforecast.forecastday[0].low.fahrenheit;
				// console.log(forecast);
				// console.log(currentHigh);
				// console.log(currentLow);			

				//Almanac
				var almanac = json.almanac;
				almanacHigh = almanac.temp_high.normal.F;
				almanacLow = almanac.temp_low.normal.F;
				// console.log('Almanac high: ' + almanacHigh + ', Almanac low: ' + almanacLow);
				// console.log(almanac);

				var html = '<p><span class="temperature">' + currentTemp + ' &#176F</span><br>';
				html += weather + ', ';
				html += '<span class="low">' + currentLow + '&#176F</span> - <span class="high">' + currentHigh + '&#176F</span></p>';
				$('#todayTemp').html(html);

				// html = '<p>' + almanacLow + '&#176F - ' + almanacHigh + '&#176F</p>';
				// $('#almanacTemp').html(html);
			});
		}

		function getHistory(){
			var search_url = 'http://api.wunderground.com/api/' + api_key + '/history_' + selectedYear + currentMonth + currentDate + '/q/NY/New_York.json?callback=?';

			$.getJSON(search_url,function(json){

				var history = json.history;
				console.log(history);

				//Daily summary
				var dailysummary = history.dailysummary;
				yearAverage = dailysummary[0].meantempi;
				yearHigh = dailysummary[0].maxtempi;
				yearLow = dailysummary[0].mintempi;
				// console.log(dailysummary);
				// console.log('medium: ' + medium);
				// console.log('maximum: ' + maximum);
				// console.log('minimum: ' + minimum);			

				//Observations
				var observations = history.observations;
				var weather;
				var hour;
				// var fahrenheit;
				for(var i = 0; i < observations.length; i ++){
					var tempWeather = observations[i].conds;

					if(tempWeather != 'unknown'){

						var tempHour = observations[i].date.hour;
						// var tempfahrenheit = observations[i].tempi;

						// console.log('Hour: ' + tempHour + ', Weather: ' + tempWeather + ', Temperature: ' + tempfahrenheit);

						if(tempHour <= currentHour + 3){
							console.log('oi')
							hour = tempHour;
							weather = tempWeather;
							// fahrenheit = tempfahrenheit;
						}
					}
				}
				// console.log(observations);
				// console.log('Hour: ' + hour + ', Weather: ' + weather + ', Temperature: ' + fahrenheit);
				console.log('Hour: ' + hour + ', Weather: ' + weather);

				var html = '<hr>';
				html += '<p><span class="temperature">' + yearAverage + ' &#176F</span><br>';
				html += weather + ', ';
				// html += '<p>Minimum: ' + minimum + '&#176F</p>';
				// html += '<p>Maximum: ' + maximum + '&#176F</p>';
				html += '<span class="low">' + yearLow + '&#176F</span> - <span class="high">' + yearHigh + '&#176F</span></p>';
				$('#beforeTemp').html(html);

				//Inside the JSON, or it will call the draw before getting the data! 
				drawGraph();				
			});
		}


		/*---------- CANVAS ----------*/

		var ctx = canvas.getContext('2d');
		var scaleHigh = 0;
		var scaleLow = 0;

		//Resizing the canvas to the full available size
		function canvasResize(){
			screenWidth = window.innerWidth;
			screenHeight = window.innerHeight;

			canvasPosition = canvas.getBoundingClientRect(); // Gets the canvas position
			canvas.width = screenWidth;
			canvas.height = screenHeight - canvasPosition.top;

			// ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			// ctx.fillRect(0, 0, canvas.width, canvas.height);

			//drawImage();
		}

		function drawImage(){
			//Canvas image
	      	var imageObj = new Image();

	      	imageObj.onload = function() {
	        //	ctx.drawImage(imageObj, 69, 50);
	        	ctx.drawImage(imageObj, canvas.width/2 - imageObj.width/2, canvas.height - imageObj.height + 20);
	        	console.log(imageObj.height);
	      	};
	      	imageObj.src = 'img/skyline.png';				
		}

		function drawGraph(){
			// console.log('Called drawGraph. almanacHigh: ' + almanacHigh + ', almanacLow' + almanacLow);
			// console.log('yearAverage: ' + yearAverage + ', currentTemp' + currentTemp);

			//Graph position and size
			var graphBox = {x: canvas.width/4, y: 20, width: canvas.width/2, height: 200};

			//Calculating the graph scale limits
			while(scaleHigh <= almanacHigh || scaleHigh <= currentHigh || scaleHigh <= yearHigh){
				console.log(scaleHigh);
				console.log(yearHigh);
				scaleHigh += 5;
			}			
			while(scaleLow <= almanacLow - 5 && scaleLow <= currentLow - 5 && scaleLow <= yearLow - 5){
				scaleLow += 5;
			}
			console.log('scaleHigh: ' + scaleHigh + ', almanacHigh: ' + almanacHigh);			
			console.log('scaleLow: ' + scaleLow + ', almanacLow: ' + almanacLow);

			//Numbers
			ctx.fillStyle = 'black';
			ctx.textBaseline = 'middle';
			ctx.font = '13px Raleway 900';
			ctx.strokeStyle = 'black';			
			for(var i = scaleLow; i <= scaleHigh; i += 5){
				var x;
				var y;
				y = mapValue(graphBox, i);
				
				//Left
				x = graphBox.x - 20;
				ctx.textAlign = 'right';
				ctx.fillText(i, x - 5, y);
				
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x + 10, y);
				ctx.stroke();				

				//right
				x = graphBox.x + graphBox.width + 20;
				ctx.textAlign = 'left';
				ctx.fillText(i, x + 5, y);
				ctx.beginPath();

				ctx.moveTo(x, y);
				ctx.lineTo(x - 10, y);
				ctx.stroke();				
			}

			//Almanac averages
			drawLine('rgba(0, 0, 0, 0.5)', graphBox.x, mapValue(graphBox, almanacHigh), graphBox.x + graphBox.width, mapValue(graphBox, almanacHigh), false);
			drawLine('rgba(0, 0, 0, 0.5)', graphBox.x, mapValue(graphBox, almanacLow), graphBox.x + graphBox.width, mapValue(graphBox, almanacLow), false);

			ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.textAlign = 'center';
			ctx.font = '13px Raleway';
			ctx.textBaseline = 'bottom';
			ctx.fillText('Historical normal high: ' + almanacHigh + '\u00B0F',
						  graphBox.x + graphBox.width/2,
						  mapValue(graphBox, almanacHigh));
			ctx.textBaseline = 'top';
			ctx.fillText('Historical normal low: ' + almanacLow + '\u00B0F',
						  graphBox.x + graphBox.width/2,
						  mapValue(graphBox, almanacLow));			

			//Before/today comparison
			drawLine('black', graphBox.x, mapValue(graphBox, yearAverage), graphBox.x + graphBox.width, mapValue(graphBox, currentTemp), true);
			drawLine('red', graphBox.x, mapValue(graphBox, yearHigh), graphBox.x + graphBox.width, mapValue(graphBox, currentHigh), true);
			drawLine('rgb(0, 120, 190)', graphBox.x, mapValue(graphBox, yearLow), graphBox.x + graphBox.width, mapValue(graphBox, currentLow), true);

		}

		function drawLine(color, x1, y1, x2, y2, arrowheads){
			//console.log(color, x1, y1, x2, y2);
			//Line
			ctx.strokeStyle = color;			
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();

			//Circles
			if(arrowheads){
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(x1, y1, 6, 6, 0, Math.PI*2, false);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(x2, y2, 6, 6, 0, Math.PI*2, false);
				ctx.fill();
			}
		}

		var mapValue = function(box, value){
			var mappedValue = (box.y + box.height) - (value - scaleLow) * (box.height/(scaleHigh - scaleLow));
			return mappedValue;
		}

		/*----- CALLING/ADDING FUNCTIONS -----*/

		//$('#yearDisplay').html(selectedYear);

		$('#yearRange').change(function(){
			selectedYear = currentYear - 50 + parseInt($('#yearRange').val());
			$('#yearDisplay').html(' ' + currentMonth + '/' + currentDate + '/ ' + selectedYear);
			//console.log('oi');
		});

		$('#ok').click(function(){
			getHistory();
			//console.log('http://api.wunderground.com/api/' + api_key + '/history_' + selectedYear + currentMonth + currentDate + '/q/NY/New_York.json?callback=?');
		});

		canvasResize();

		getCurrentObservation();
		//drawGraph();
		//getHistory();


	//If the browser doesn't support canvas
	}else{
		$('myCanvas').html("Your browser doesn't support canvas.");
	}

});