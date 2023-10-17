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

class TouchInProgress {
	constructor(elem, elem_type){
		this.elem_type = elem_type;
		this.setTargetElement(elem);
	}

	setTargetElement(elem){
		this.bar = elem.querySelectorAll(`.${this.elem_type}-bar`)[0];
		this.labelHeight = elem.querySelectorAll(`.${this.elem_type}-label`)[0].clientHeight;
		this.sliderHeight = elem.querySelectorAll(`.${this.elem_type}-slider`)[0].clientHeight
		this.maxHeight = (elem.clientHeight - this.sliderHeight - this.labelHeight);
	}

	update(e){
		this.setTargetElement(e.currentTarget);
		let position = e.clientY;

		let height = this.maxHeight + this.sliderHeight + e.currentTarget.getBoundingClientRect().top - position;
		setBoxHeight(height, this.maxHeight, this.bar);
	}
}

class DragInProgress {
	constructor(elem, elem_type){
		this.elem_type = elem_type;
		this.elem = elem;
		this.target_elem;
		//this.setTargetElement(elem);
	}

	setTargetElement(elem){
		this.bar = elem.querySelectorAll(`.${this.elem_type}-bar`)[0];
		this.labelHeight = elem.querySelectorAll(`.${this.elem_type}-label`)[0].clientHeight;
		this.sliderHeight = elem.querySelectorAll(`.${this.elem_type}-slider`)[0].clientHeight
		this.maxHeight = (elem.clientHeight - this.sliderHeight - this.labelHeight);
	}

	update(e){
		let touch = e.touches[0];
		Array.from(this.elem.children).forEach((elem, i) => {
			let rect = elem.getBoundingClientRect();
			// Recall origin is at top left, so y logic is reversed
			if(!elem.classList.contains(`${this.elem_type}-axis-label`)
				&& touch.clientX < rect.right
				&& touch.clientX > rect.left
				&& touch.clientY < rect.bottom
				&& touch.clientY > rect.top){
					this.setTargetElement(elem);

					let position = e.touches[0].clientY;

					let height = this.maxHeight + this.sliderHeight + e.currentTarget.getBoundingClientRect().top - position;
					setBoxHeight(height, this.maxHeight, this.bar);
			}
		});
	}
}

function endMovement(e){
	if(inProgress.length > 0){
		inProgress = [];
	}
}

function addEventListeners(){
	// Initialize event listeners
	// Add for pricing and usage graphs
	elem_types = ["pricing", "usage"];
	elem_types.forEach((elem_type, i) => {
		// Begin movement
		$(`.${elem_type}-box`).on('touchenter', (e) => {
			inProgress.push(new TouchInProgress(e.currentTarget, elem_type));
	  });
	  $(`.${elem_type}-box`).on('mousedown', (e) => {
			inProgress.push(new TouchInProgress(e.currentTarget, elem_type));
	  });

		// End movement
	  $(`.${elem_type}-box`).on('touchend', (e) => {
			endMovement(e);
	  });
		$(`.${elem_type}-box`).on('touchcancel', (e) => {
			endMovement(e);
		});

		$(`.${elem_type}-box`).on("mousemove", (e) => {
			//console.log(inProgress);
			if(inProgress.length != 0 && e.target.className != `${elem_type}-label w-100`){
				inProgress.forEach(x => {
					x.update(e);
				});
			}
		});

		$(`.${elem_type}-container`).on("touchmove", (e) => {
			e.preventDefault();
				if(inProgress.length == 0){
					inProgress.push(new DragInProgress(e.currentTarget, elem_type));
				} else{
					inProgress.forEach((x, i) => {
						x.update(e);
					});
				}
		});
	});

	// End movement
	$("body").on("mouseup", (e) => {
		endMovement(e);
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
	initialize_box_classes("result", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 125.01818181818182, 380.2636363636363, 755.3181818181819, 880.3363636363636, 1135.581818181818, 1135.581818181818, 1135.581818181818, 1135.581818181818, 1010.5636363636363, 755.3181818181819, 505.28181818181815, 0, 0, 0, 0], "auto");

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
