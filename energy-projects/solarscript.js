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

// Label and autoscale the axis for a given chart
function scaleAxis(axis_holder, max){
	// Set elements to 100%, 75%, 50%, and 25% of the max, respectively
	for(let i = 0; i < 4; i++){
		axis_holder.children[i].innerHTML = Math.round((4-i)/4*max*100, 2)/100;
	}
}

function setBoxHeight(height, maxHeight, box){
	// Takes in height in px and scales to incriment of 10% of max height
	let scaledHeight = height / maxHeight;
	scaledHeight = Math.min(scaledHeight - (scaledHeight % 0.1), 1);
	box.style.height = Math.round(scaledHeight * maxHeight) + "px";
}

// Initialize heights and hour labels
function initialize_box_classes(class_name, initial_heights, scale_axis="auto"){
	// Set Label al times with 12-hr time
	let i = 12;
	let time_labels = document.querySelectorAll(`.${class_name}-label`);
	time_labels.forEach(elem => {
		elem.innerText = i;
		i = i == 12 ? 1 : i+1;
	});

	// Set initial slider heights
	let maxHeight = scale_axis == "auto" ? Math.max(...initial_heights) : scale_axis;
	let bars = document.querySelectorAll(`.${class_name}-bar`);
	for(let i = 0; i < bars.length; i++){
		let maxHeightPx = (bars[i].parentNode.clientHeight
							- bars[i].parentNode.querySelectorAll(`.${class_name}-slider`)[0].clientHeight
							- bars[i].parentNode.querySelectorAll(`.${class_name}-label`)[0].clientHeight);
		setBoxHeight(initial_heights[i]/maxHeight*maxHeightPx, maxHeightPx, bars[i]);
	}

	// Set axis values$
	let elem = $(`.${class_name}-container`).find(`.${class_name}-axis-label`)[0];
	scaleAxis(elem, maxHeight);
}



//---------------------------------------------------------------
// Handle dynamic update of sliders

var inProgress = [];

class PricingDragInProgress {
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

class UsageDragInProgress {
	constructor(elem, initialHeight, sliderPosition){
		this.elem = elem;
		this.initialHeight = initialHeight;
		this.sliderPosition = sliderPosition;

		this.maxHeight = (elem.parentNode.clientHeight
							- elem.parentNode.querySelectorAll(".usage-slider")[0].clientHeight
							- elem.parentNode.querySelectorAll(".usage-label")[0].clientHeight);
	}

	update(e){
		if (e.touches)
    		var position = e.touches[0].clientY;
  		else
			var position = e.clientY;

		let diff = position - this.sliderPosition;
		let height = this.initialHeight - diff;
		//Scale to incriments of 10% of total height
		setBoxHeight(height, this.maxHeight, this.elem);
	}
}

function beginSlide(e, elem_type){
	/*
		Supported elem_type:
		pricing
		usage
	*/

	e.preventDefault();
	var bar;
	if (e.touches) {
		var sliderPosition = e.touches[0].clientY;
	} else{
		var sliderPosition = e.clientY;
	}
	switch(elem_type){
		case "pricing":
			bar = e.currentTarget.parentElement.querySelectorAll(".pricing-bar")[0];
			inProgress.push(new PricingDragInProgress(bar, bar.offsetHeight, sliderPosition));
			break;
		case "usage":
			bar = e.currentTarget.parentElement.querySelectorAll(".usage-bar")[0];
			inProgress.push(new UsageDragInProgress(bar, bar.offsetHeight, sliderPosition));
			break;
	}
}

function endSlide(e){
	e.preventDefault();
	inProgress = [];
}

function addEventListeners(){
	// Initialize event listeners
	// Pricing event listeners
	$(".pricing-slider").on('touchstart', (e) => {
		beginSlide(e, "pricing");
  });
  $(".pricing-slider").on('mousedown', (e) => {
		beginSlide(e, "pricing");
  });
  $(".pricing-slider").on('touchend', (e) => {
		endSlide(e);
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

	// Usage event listeners
	$(".usage-slider").on('touchstart', (e) => {
		beginSlide(e, "usage");
	});
	$(".usage-slider").on('mousedown', (e) => {
		beginSlide(e, "usage");
	});
	$(".usage-slider").on('touchend', (e) => {
		endSlide(e);
	});
	$(".usage-slider").on('touchend', (e) => {
		endSlide(e);
	});
	$(".usage-slider").on('click', function(e) {
		e.preventDefault();
	})
	$(".usage-slider").on('touchcancel', (e) => {
		endSlide(e);
	});

	// Body event listeners
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

// Initialize Document ---------------------------------------------------------

$(document).ready(function(){
	console.log("solarscript.js running on document ready");

	// Initialize clones
	initialize_clones();

	// Label boxes and set initial heights
	initialize_box_classes("pricing", [4, 4, 4, 4, 4, 4, 4, 6, 6, 6,
		6, 6, 6, 6, 6, 30, 30, 30, 30, 30, 30, 6, 6,
		6, 6, 6, 6]);
	initialize_box_classes("usage", [400, 300, 200, 200, 200, 300, 300, 400, 500, 500, 500,
			500, 500, 500, 400, 400, 500, 600, 700, 700, 600, 600, 500, 400]);
	initialize_box_classes("result", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 700);

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

	addEventListeners();
});
