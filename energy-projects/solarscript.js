/* 
 *	solarscript.js
 *	Owen Frausto July 16 2023
 *
 * 	Handles control and loading of my solar project
 */

class SliderInput {
	constructor(div){
		console.log(typeof div);
		const slider = div.children("#slider-input-slider")[0];
		const number = div.children("#slider-input-number")[0];
	}
}

$(document).ready(function(){
	console.log("solarscript.js running on document ready");

	//Initialize all slider inputs with class functions
	$(".slider-input").each(i => {
		new SliderInput( $(".slider-input")[i] );
	});
});
