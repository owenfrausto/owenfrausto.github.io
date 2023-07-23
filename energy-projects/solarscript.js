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
	let i = 12;
	let time_labels = document.querySelectorAll(".pricing-label");
	time_labels.forEach(elem => {
		elem.innerText = i;
		i = i == 12 ? 1 : i+1;
	});
}

function set_price_heights(){
	let heights = [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 
			0.7, 0.7, 0.7, 0.7, 0.7, 0.9, 0.9, 0.9, 0.9, 0.9, 0.7, 0.7, 0.7];
	i = 0
	
	let bars = document.querySelectorAll(".pricing-bar");
	for(let i = 0; i < bars.length; i++){
		let maxHeight = (bars[i].parentNode.clientHeight 
							- bars[i].parentNode.querySelectorAll(".pricing-slider")[0].clientHeight
							- bars[i].parentNode.querySelectorAll(".pricing-label")[0].clientHeight);
		bars[i].style.height = Math.round(heights[i] * maxHeight)+ "px";
	}
}

function initialize_pricing_boxes(){
	label_price_times();
	set_price_heights();	
}

$(document).ready(function(){
	console.log("solarscript.js running on document ready");
	
	// Initialize clones
	initialize_clones();

	// Label pricing boxes and set initial heights
	initialize_pricing_boxes();

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

var inProgress = [];

class DragInProgress {
	constructor(elem, initialHeight, sliderPosition){
		this.elem = elem;
		this.initialHeight = initialHeight;
		this.sliderPosition = sliderPosition;

		this.maxHeight = (elem.parentNode.clientHeight 
							- elem.parentNode.querySelectorAll(".pricing-slider")[0].clientHeight
							- elem.parentNode.querySelectorAll(".pricing-label")[0].clientHeight);
	}

	update(e){
		if (e.touches)
    		var position = e.touches[0].clientY;
  		else
			var position = e.clientY;
  	
		let diff = position - this.sliderPosition;
		let height = this.initialHeight - diff;
		//Scale to incriments of 10% of total height
		let scaledHeight = height / this.maxHeight;
		scaledHeight = Math.min(scaledHeight - (scaledHeight % 0.1), 1);
		this.elem.style.height = Math.round(scaledHeight * this.maxHeight) + "px";
	}
}

function beginSlide(e){
	e.preventDefault();
	if (e.touches) {
		var sliderPosition = e.touches[0].clientY;
	} else{
		var sliderPosition = e.clientY;
	}
	let bar = e.currentTarget.parentElement.querySelectorAll(".pricing-bar")[0]
	inProgress.push(new DragInProgress(bar, bar.offsetHeight, sliderPosition))
}

function endSlide(e){
	e.preventDefault();	
	inProgress = [];
}

window.onload = function() {

	$(".pricing-slider").on('touchstart', (e) => {
		beginSlide(e);
  	});
  	$(".pricing-slider").on('mousedown', (e) => {
		beginSlide(e);
  	});
  	$(".pricing-slider").on('touchend', (e) => {
		endSlide(e);
  	});
  	
	$(".pricing-slider").on('click', function(e) {
    	e.preventDefault();
  	})
  	$(".pricing-slider").on('touchcancel', (e) => {
		endSlide(e);
  	});
  	
	$("body").on('touchmove', (e) => {
    	inProgress.forEach( x => {
			x.update(e);
		});	
  	});

  	$("body").on('mousemove', (e) => {
		inProgress.forEach( x => {
			x.update(e);
		});
	});

	$("body").on("mouseup", (e) => {
		endSlide(e);
	});


}
