/*---------- SNAP SCROLLING ----------*/
$('body').panelSnap();

var canvas = document.getElementById('myCanvas');

/*---------- SNAP SCROLLING ON CLICK ----------*/
function goToByScroll(id){
$('html,body').animate({
		'scrollTop': $("#"+id).offset().top
	}, 600);
}

/*---------- REQUEST ANIMATION FRAME ----------*/
window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / 60);
          //window.setTimeout(callback);
        };
      })();

/*---------- VARIABLES ----------*/
//Getting canvas context
var ctx = canvas.getContext('2d');

//Canvas position
var canvasPosition;

//Particles
var victims;			//Array of female
var harassers;			//Array of male
var myLoop;

var isRunning;
var nHarassers = $('#male').val();	//int
var nVictims = $('#female').val();	//int

/*---------- FUNCTIONS ----------*/							

function setup(){
	harassers = new Array(parseInt(nHarassers));
	for(var i = 0; i < harassers.length; i ++){
		var triangle = new Object;	//creating object
		initTriangle(triangle);		//initializing
		harassers[i] = triangle;
	}		

	victims = new Array(parseInt(nVictims));
	for(var i = 0; i < victims.length; i ++){
		var circle = new Object;	//creating object
		initCircle(circle);			//initializing
		victims[i] = circle;
	}
	
	//myLoop = setInterval(draw, 60);
	update();
	isRunning = true;
}		

function update(){
	//Updating the victims
	for(var i = 0; i < victims.length; i ++){
		victims[i].update();
	}
	//Updating the harassers
	for(var i = 0; i < harassers.length; i ++){
		harassers[i].update();
	}		
	draw();
}				

function draw(){
	//Erasing the background
	//ctx.fillStyle = 'white';
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//Drawing the victims
	for(var i = 0; i < victims.length; i ++){
		victims[i].draw();
	}
	//Drawing the harassers
	for(var i = 0; i < harassers.length; i ++){
		harassers[i].draw();
	}

	requestAnimFrame(update);		
}

/*---------- AUXILIAR FUNCTIONS ----------*/
//Resizing the canvas to the full window size
function canvasResize(){
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;

	canvasPosition = canvas.getBoundingClientRect(); // Gets the canvas position
	canvas.width = screenWidth - 4;
	canvas.height = screenHeight - 4;
}	

function positionDivs(){
	//Title
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var divLeft, divTop;

	//
	divTop = (screenHeight - $('#title').height())/2;
	$('#title').css({
		'top': divTop
		// 'background-color': 'black'
	});

	divLeft = screenWidth - $('#control').width() - 60;
	divTop = screenHeight - $('#control').height() - 40;
	$('#control').css({
		'left': divLeft,
		'top': divTop
	});

	divLeft = (screenWidth - $('.arrow').width())/2;
	divTop = screenHeight - $('.arrow').height() - 40;
	$('.arrow').css({
		'left': divLeft,
		'top': divTop
	});	
}	

var normalize = function(obj){
	var normalized = {
       	x: obj.x / (Math.abs(obj.x) + Math.abs(obj.y)),
       	y: obj.y / (Math.abs(obj.x) + Math.abs(obj.y))
    }
    return normalized;
}	

var calculateDistance = function(x1, y1, x2, y2){
	var angle = Math.atan2(y1 - y2, x1 - x2);
	var dist;
	if( (y1 - y2) == 0 ){
		dist = (x1 - x2) / Math.cos( angle );
	}else{
		dist = (y1 - y2) / Math.sin( angle );
	}
	return dist;
}	

var constrain = function(value, min, max){
	var constrainedValue = Math.min(Math.max(value, min), max);	
	return constrainedValue;
}

var map = function(value, aMin, aMax, bMin, bMax){
  	var srcMax = aMax - aMin,
    	dstMax = bMax - bMin,
    	adjValue = value - aMin;
  	return (adjValue * dstMax / srcMax) + bMin;
}		

var parseHslaColor = function(h, s, l, a){
	var myHslColor = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a +')';
	//console.log('called calculateAngle function');
	return myHslColor;
}

var degreeToRadian = function(degrees){
	var radians = degrees*Math.PI/180;
	return radians
}


/*--------------- TRIANGLE ---------------*/
function initTriangle(obj){
	//Variables
		//declaring
		var tempPosition = new Object();
		var tempVelocity = new Object();
		var tempColor = new Object();

		//initializing
		tempPosition = {
			x: Math.round(Math.random()*canvas.width),
			y: Math.round(Math.random()*canvas.height)
		}
		tempVelocity = {
			x: 0,
			y: 0
		}
		tempColor = {
			h: 200,
			s: 100,
			l: 72,
			a: 1
		}			

		//Attributing to the object
		obj.position = tempPosition;
		obj.velocity = tempVelocity;
		obj.color = parseHslaColor(tempColor.h, tempColor.s, tempColor.l, tempColor.a);
		obj.size = 12;
		obj.personalBoundary = 3 * obj.size;
		// console.log("x: " + obj.velocity.x + ", y: " + obj.velocity.y);

	//Functions
	obj.update = updateTriangle;
	obj.draw = drawTriangle;
	obj.chase = chaseTriangle;
	obj.avoid = avoidTriangle;
	obj.bump = bumpTriangle;
	obj.bounce = bounceObj;
}

function updateTriangle(){
	this.velocity.x *= 0.5;
	this.velocity.y *= 0.5;

	//Detecting bump
	var bumpDirection = this.bump();
    this.position.x += bumpDirection.x;
    this.position.y += bumpDirection.y;		

	//Changing the direction
	var chaseDirection = this.chase();
	var avoidDirection = this.avoid();

	chaseDirection.x *= 1.2;  // moving towards food gets a weight (or "importance") of 1.2
	chaseDirection.y *= 1.2;
	avoidDirection.x *= 1.8;  // avoiding other predators gets a weight (or "importance") of 1.8		
	avoidDirection.y *= 1.8;

    this.velocity.x += (chaseDirection.x + avoidDirection.x);
    this.velocity.y += (chaseDirection.y + avoidDirection.y);

    //Changing the speed
	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;

	//Checking the bouncing
	this.bounce();
}

function drawTriangle(){
	// console.log(this.posX);
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
	ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x) + Math.PI/2);

		//Triangle
		ctx.fillStyle = this.color;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(0, -this.size/2);
		ctx.lineTo(this.size, this.size);
		ctx.lineTo(-this.size, this.size);
		ctx.fill();
		
		//Line
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, this.size*2.5);
		ctx.stroke();

	ctx.restore();
}

var chaseTriangle =  function(){
    // Step 1: Identify position of closest prey
    posOfClosestCircle = {
    	x: 0,
    	y: 0
    }
    var shortestDistance =  canvas.width * canvas.height; //any really big number
    for(var i = 0; i < victims.length; i++){
        var d = calculateDistance(this.position.x, this.position.y, victims[i].position.x, victims[i].position.y);
        //Only go after the red circles
        if(d < shortestDistance && !victims[i].isGrey) {
            shortestDistance = d;
            posOfClosestCircle.x = victims[i].position.x;
            posOfClosestCircle.y = victims[i].position.y;
        }
    }

    // shortestDistance is now the distance to the closest circle
    // *also* posOfClosestCircle will be posOfClosestCircle
    
    // Step 2: Move towards closest circle
    var direction = {	 // difference
    	x: 0,
    	y: 0
    }
    direction.x = posOfClosestCircle.x - this.position.x;
    direction.y = posOfClosestCircle.y - this.position.y;
    direction = normalize(direction);
    return direction;
}

var bumpTriangle = function(){
    var newDirection = {
    	x: 0,
    	y: 0
    }
    for(var i = 0; i < victims.length; i++){
    	var d = calculateDistance(this.position.x, this.position.y, victims[i].position.x, victims[i].position.y);
    	if(d < victims[i].size*1.8){
            var difference = {
            	x: this.position.x - victims[i].position.x,
            	y: this.position.y - victims[i].position.y
            }
            // console.log(difference);
            
            //Normalize
            difference = normalize(difference);
            newDirection.x += difference.x * 50; // Calculate vector pointing away from neighbor
            newDirection.y += difference.y * 50;	    	
        	victims[i].nPoke ++;	    		
    	}
    }
    return newDirection;
}	

var avoidTriangle = function(){
    var newDirection = {
    	x: 0,
    	y: 0
    }
    var count = 0;
    
    //AVOID OTHER TRIANGLES
    for(var i = 0; i < harassers.length; i++){
        var d = calculateDistance(this.position.x, this.position.y, harassers[i].position.x, harassers[i].position.y);
        // console.log(d);
        //Only avoid if:
        //1. d > 0: it's not itself
        //2. d < size+personalBoundary: it's inside the personal boundary
        //3. isGrey == circles[i].isGrey: they have the same color
        if(d < this.size + this.personalBoundary && d > 0){
            var difference = {
            	x: this.position.x - harassers[i].position.x,
            	y: this.position.y - harassers[i].position.y
            }
            // console.log(difference);
            
            //Normalize
            difference = normalize(difference);
            newDirection.x += difference.x;
            newDirection.y += difference.y;
            // console.log(normalized.x);
            count++;
        }
    }
    
    //If the triangle is avoiding a lot of elements, then the normalize vector is gonna be huge;
    //You need to make it proportiional to the number of avoided elements
    if(count > 0){
    	// console.log(count);
    	// console.log("  " + newDirection.x);
        newDirection.x = newDirection.x/count;
        // console.log("      " + newDirection.x);
        newDirection.y = newDirection.y/count;
    }

    return newDirection;		
}
/*------------- END TRIANGLE -------------*/


/*--------------- CIRCLE ---------------*/
function initCircle(obj){
	//Variables
		//declaring
		var tempPosition = new Object();
		var tempVelocity = new Object();
		var tempColor = new Object();

		//initializing
		tempPosition = {
			x: Math.round(Math.random()*canvas.width),
			y: Math.round(Math.random()*canvas.height)
		}
		tempVelocity = {
			x: Math.round((Math.random() < 0.5 ? -1 : 1) * Math.random() * 10),
			y: Math.round((Math.random() < 0.5 ? -1 : 1) * Math.random() * 10)
		}
		tempColor = {
			h: 0,
			s: 100,
			l: 85,
			a: 1
		}			

		//Attributing to the object
		obj.position = tempPosition;
		obj.velocity = tempVelocity;
		obj.color = parseHslaColor(tempColor.h, tempColor.s, tempColor.l, tempColor.a);
		obj.size = 10;
		obj.personalBoundary = 50;
		// obj.isGrey = Math.random() < 0.5 ? false : true;
		obj.isGrey = false;
		obj.alert = false;
		obj.nPoke = 0;
		obj.timer = 0;
		// console.log("x: " + obj.velocity.x + ", y: " + obj.velocity.y);

	//Functions
	obj.update = updateCircle;
	obj.draw = drawCircle;
	obj.avoid = avoidCircle;
	obj.bounce = bounceObj;
	obj.checkColor = checkColorCircle;
	obj.checkAlert = checkAlertCircle;
}

function updateCircle(){
	//Calculating new direction (based on the avoidDirection)	    
    var avoidDirection = this.avoid();
    // console.log(avoidDirection);
    this.velocity.x += avoidDirection.x;
    this.velocity.y += avoidDirection.y;

    //Changing the speed
	this.position.x += this.velocity.x;
	this.position.y += this.velocity.y;	    

	//Constraining the speed
    if(Math.abs(this.velocity.x) > 2 || Math.abs(this.velocity.y) > 2){
        this.velocity.x *= 0.9;
        this.velocity.y *= 0.9;
    }

	this.bounce();
	this.checkColor();
	this.checkAlert();

	//Sets the speed of the cure effect
	if(this.timer > 0){
		this.timer -= 0.03;
	}

	//Check the poke limit
    if(this.nPoke >= 5){
        this.isGrey = true;
    }		
}

function drawCircle(){
	// console.log(this.posX);
	ctx.save();
	ctx.translate(this.position.x, this.position.y);
		//Alert
		if(this.alert && !this.isGrey){
			// console.log('drawing alert');
	        for(var angle = 0; angle < 360; angle += 20){
				var date = new Date();
				var milis = date.getMilliseconds();		        	
	            var rotateAngle = milis/400;
	            
	            var radius = 3 * this.size;
	            var x1 = Math.cos(degreeToRadian(angle) + rotateAngle) * radius;
	            var y1 = Math.sin(degreeToRadian(angle) + rotateAngle) * radius;

	            radius = 4 * this.size;
	            var x2 = Math.cos(degreeToRadian(angle) + rotateAngle) * radius;
	            var y2 = Math.sin(degreeToRadian(angle) + rotateAngle) * radius;

	            ctx.strokeStyle = parseHslaColor(0, 0, 0, 0.3);
	            ctx.lineWidth = 2;
	            ctx.beginPath();
	            ctx.moveTo(x1, y1);
	            ctx.lineTo(x2, y2);
	            ctx.stroke();		            
	        }
		}

	    //"Cure" circle
	    // It's always being drawn, based on the difference between the current time and the inner timer
	    var radius = map(this.timer, 5, 0, 0, 4 * this.size);
	    radius = constrain(radius, 0, 4 * this.size);
	    var radiusOpacity = map(this.timer, 5, 0, 1, 0);
	    radiusOpacity = constrain(radiusOpacity, 0, 1);
		ctx.strokeStyle = parseHslaColor(0, 0, 80, radiusOpacity);
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(0, 0, radius, radius, 0, Math.PI*2, false);
		ctx.stroke();

		//"Regular" body
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(0, 0, this.size, this.size, 0, Math.PI*2, false);
		ctx.fill();
	ctx.restore();
}

function checkColorCircle(){
	// console.log(this.isGrey);
    if(this.isGrey){
    	this.color = parseHslaColor(0, 0, 72, 1);
    	this.nPoke = 0;
    }else{
        var saturation = map(this.nPoke, 0, 5, 100, 0);
        this.color = parseHslaColor(0, saturation, 72, 1);
    }	    
}

function checkAlertCircle(){

    this.alert = false;
    for(var i = 0; i < harassers.length; i++){
        var d = calculateDistance(this.position.x, this.position.y, harassers[i].position.x, harassers[i].position.y);
        if(d < this.size + this.personalBoundary){
            this.alert = true;
            // console.log('alert!');
        }
    }	    
}

var avoidCircle = function(){
    var newDirection = {
    	x: 0,
    	y: 0
    }
    var count = 0;
    
    //AVOID CIRCLES OF THE SAME COLOR
    for(var i = 0; i < victims.length; i++){
        var d = calculateDistance(this.position.x, this.position.y, victims[i].position.x, victims[i].position.y);
        // console.log(d);
        //Only avoid if:
        //1. d > 0: it's not itself
        //2. d < size+personalBoundary: it's inside the personal boundary
        //3. isGrey == circles[i].isGrey: they have the same color
        if(d > 0 && d < (this.size + this.personalBoundary) && this.isGrey == victims[i].isGrey){
            var difference = {
            	x: this.position.x - victims[i].position.x,
            	y: this.position.y - victims[i].position.y
            }
            // console.log(difference);
            
            //Normalize
            difference = normalize(difference);
            newDirection.x += difference.x;
            newDirection.y += difference.y;
            // console.log(normalized.x);
            count++;
        }
        
        //If they collide: cure
        if (d > 0 && d < 2 * this.size && this.isGrey != victims[i].isGrey) {            
            if(this.isGrey){ //Only draw "cure" circle if it was grey before
                this.timer = 5;
            }
            // console.log('cure!');
            this.isGrey = false;
        }
    }
    
    //If the circle is avoiding a lot of elements, then the normalize vector is gonna be huge;
    //You need to make it proportiional to the number of avoided elements
    if(count > 0){
    	// console.log(count);
    	// console.log("  " + newDirection.x);
        newDirection.x = newDirection.x/count;
        // console.log("      " + newDirection.x);
        newDirection.y /= count;
    }

    //Constraining
    // newDirection.x = Math.min(Math.max(newDirection.x, -1), 1);
    // newDirection.y = Math.min(Math.max(newDirection.y, -1), 1);

    return newDirection;		
}	
/*------------- END CIRCLE -------------*/

/*---------- SHARED FUNCTIONS ----------*/
function bounceObj(){
    if(this.position.x < this.size){
        this.velocity.x *= -1;
        this.position.x = this.size;
    }
    if(this.position.x > canvas.width - this.size){
        this.velocity.x *= -1;
        this.position.x = canvas.width - this.size;
    }
    if(this.position.y < this.size){
        this.velocity.y *= -1;
        this.position.y = this.size;
    }
    if(this.position.y > canvas.height - this.size){
        this.velocity.y *= -1;
        this.position.y = canvas.height - this.size;
    }
}

//Resizing the canvas
canvasResize();

positionDivs();

$('#run').click(function(){
	console.log('calling function');

	if(isRunning){
		clearInterval(myLoop);
		isRunning = false;
	}
	//Calling the setup function
	setup();
});

$('#male').change(function(){
	nHarassers = $('#male').val();
	console.log('male: ' + nHarassers);
	$('#nMale').html(nHarassers);
});

$('#female').change(function(){
	nVictims = $('#female').val();
	console.log('female: ' + nVictims);
	$('#nFemale').html(nVictims);
});

$('#introLink').click(function(){
	goToByScroll("intro");
});

$('#simulationLink').click(function(){
	goToByScroll("simulation");
});
