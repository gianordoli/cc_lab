	/*---------- VARIABLES ----------*/

	//Particles
	var dust;
	var mouseRadius;	//Size of the mouze
	var isPressed;
	var mouseX = 0;
	var mouseY = 0;
	var myLoop;	

	/*---------- FUNCTIONS ----------*/							

	function setup(){
		dust = new Array(40000);
		mouseRadius = 10;
		isPressed = false;
		mouseX = 0;
		mouseY = 0;	

		for(var i = 0; i < dust.length; i ++){
			var particle = $('<div class="particle"></div>');
			var x = Math.round(Math.random()*window.innerWidth/4)*4;
			var y = Math.round(Math.random()*window.innerHeight/4)*4;
			$(particle).css({
				'left': x,
				'top': y,
				'background-color': 'rgb(200, 165, 140)',
				'opacity': (Math.random() + 0.3).toFixed(1)
			})
			$(particle).attr('id', x + ':' + y);
			$('body').append(particle);
		}

		/*---------- LISTENERS ----------*/
		$(document).mousemove(function(evt){			
	        // console.log(mouseX);
			if(isPressed){
				mouseX = event.pageX;
		        mouseY = event.pageY;				
				draw();
			}
		});

		$(document).bind('mousedown', function(evt){
			isPressed = true;	// Set my "isPressed" variable to true
			draw();
		});

		$(document).bind('mouseup', function(evt){
			isPressed = false;	// Set my "isPressed" variable to false
		});		
	}						

	// var n = 0;
	function draw(){		

		for(var x = mouseX - mouseRadius/2; x < mouseX + mouseRadius/2; x++){
			for(var y = mouseY - mouseRadius/2; y < mouseY + mouseRadius/2; y++){
				// $('#'+x+':'+y).css('background-color', 'red');
				$('.particle').css('background-color', 'red');
				console.log($('#'+x+':'+y).length);
			}
		}

		// //Draws the squares
		// for(var i = 0; i < dust.length; i ++){
		// 	// console.log(i);
				
		// 	//Calculating the angle							
		// 	var offset = $('#'+i).offset();
		// 	var angle = calculateAngle(offset.left, offset.top);

		// 	//Calculating the distance							
		// 	var dist;

		// 	if( (mouseY - offset.top) == 0 ){
		// 		dist = (mouseX - offset.left) / Math.cos( angle );
		// 	}else{
		// 		dist = (mouseY - offset.top) / Math.sin( angle );
		// 	}
		
		// 	//Detecting collision
		// 	if(dist < mouseRadius){
		// 		//console.log('yay');
		// 		$('#'+i).css({
	 //                'left': mouseX - Math.cos(angle) * mouseRadius,
	 //                'top': mouseY - Math.sin(angle) * mouseRadius
		// 		});

		// 	}
		// }
	}

	/*---------- AUXILIAR FUNCTIONS ----------*/
	function calculateAngle(x, y){
		var angle = Math.atan2(mouseY - y, mouseX - x);
		//console.log('called calculateAngle function');
		return angle;
	}			

	//Calling the setup function
	setup();		