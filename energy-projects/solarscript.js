/* 
 *	solarscript.js
 *	Owen Frausto July 16 2023
 *
 * 	Handles control and loading of my solar project
 */

// Setup slider-input update handlers
function bound(lower, upper, value){
	if(value <= upper && value >= lower){
		return value;
	} else if(value < lower){
		return lower;
	} else{
		return upper;
	}
}

function initialize_clones(){
	/* Look for all elements with "clone" class, take their other classname,
	 * then look for that classname with "-template" appended to it
	 */
	let clones = document.querySelectorAll(".clone");
	// Remove clone class from clone desiring elements
	$(".clone").removeClass("clone");

	// Aggregate class names of desiring clones
	let cloned_classes = [];
	clones.forEach(elem =>{
		if(!cloned_classes.includes(elem.className)){
			cloned_classes.push(elem.className);
		}
	});

	// Go through each class name and clone elements from template
	cloned_classes.forEach(cloneClassName => {
		// Get the template and clone candidaes
		let template = document.querySelectorAll("." + cloneClassName + "-template")[0];
		let clone_candidates = document.querySelectorAll("." + cloneClassName);

		//	Remove "-template" from template class name
		template.className = template.className.replace("-template", "");

		// Swap inner html
		clone_candidates.forEach(elem => {
			elem.innerHTML = template.innerHTML;
			elem.className = template.className;
		});

	});

}

function label_price_times(){
	i = 12;
	let time_labels = document.querySelectorAll(".pricing-label");
	time_labels.forEach(elem => {
		elem.innerText = i;
		i = i == 12 ? 1 : i+1;
	});
}

$(document).ready(function(){
	console.log("solarscript.js running on document ready");
	
	// Initialize clones
	initialize_clones();

	// Label pricing boxes
	label_price_times();	

	// Initialize event listeners
	$(".slider-input").on("change", event =>{
		let slider = event.currentTarget;
		let v = bound(-90, 90, event.target.value);
		slider.querySelectorAll(".slider-input-number")[0].value = v;
		slider.querySelectorAll(".slider-input-range")[0].value = v;
	});
	

	// Initialize all slider inputs with class functions
	//$(".slider-input").each(i => {
	//	new SliderInput( $(".slider-input")[i] );
	//});
});

//---------------------------------------------------------------

var sliderPosition;
var mouseDown;
var initialHeight;

function touchMouseStart(e) {
	e.preventDefault();
  	mouseDown = true;
	console.log("mouseDown")
  	if (e.touches) {
    	sliderPosition = e.touches[0].clientY;
	} else {
    	sliderPosition = e.clientY;
	}	
	let bar = e.currentTarget.parentElement.querySelectorAll(".pricing-bar")[0];
  	
	e.currentTarget.style.backgroundColor = "pink";
	initialHeight = bar.offsetHeight;
  	//e.currentTarget.classList.add('slideable');
}

function touchMouseEnd(e) {
  	e.preventDefault();
	console.log(e);
	console.log("mouseUp");
  	mouseDown = false;
	
	let bar = e.currentTarget.parentElement.querySelectorAll(".pricing-bar")[0];
	e.currentTarget.style.backgroundColor = "purple";
	initialHeight = bar.offsetHeight;
	//e.currentTarget.classList.remove("slideable");
}

function touchMouseMove(e) {
	console.log(e);
	e.preventDefault();
  	if (!mouseDown)
    	return;
  	if (e.touches)
    	var position = e.touches[0].clientY;
  	else
		var position = e.clientY;
  	
	var height = position - sliderPosition;
	let bar = e.currentTarget.parentElement.querySelectorAll(".pricing-bar")[0];

  	//if ((initialHeight + height) <= bar.scrollHeight + 20) {
	//	console.log('yes');
    	bar.style.height = initialHeight - height + "px";
  	//} else{
	//	console.log("no");
	//}
}

window.onload = function() {

  $(".pricing-slider").on('touchstart', (e) => {
    touchMouseStart(e)
  });
  $(".pricing-slider").on('mousedown', (e) => {
    touchMouseStart(e)
  });
  $(".pricing-slider").on('touchend', (e) => {
    touchMouseEnd(e)
  });
  $(".pricing-slider").on('mouseup', (e) => {
    touchMouseEnd(e)
  });
  $(".pricing-slider").on('mouseout', (e) => {
    //touchMouseEnd(e)
  });
  $(".pricing-slider").on('click', function(e) {
    e.preventDefault();
  })
  $(".pricing-slider").on('touchcancel', (e) => {
    touchMouseEnd(e)
  });
  $(".pricing-slider").on('touchmove', (e) => {
    touchMouseMove(e)
  });
  $("body").on('mousemove', (e) => {
    touchMouseMove(e)
  });
}
