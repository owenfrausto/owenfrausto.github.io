/*
Owen Frausto
10/8/23

This file holds the particle optimization solver for the solar optimizer
*/
console.log("solve.js loaded")

// A first attempt at a nieve solver
function swarm_solve(N, P, pricing_profile, usage_profile){
  "use strict";
  /* Implement a swarm solver using for loops and arrays
    N - number of solar panels (int)
    P - Rating of each solar panel (int, Watts)
    pricing_profile - list of hourly prices (24 int list, cent/kwh)
    usage_profile - List of hourly usage (24 int list, Watts)
  */

  // Want to get MVP working, can try to adjust parameters later

  // Initialize zero array
  let angle_list = Array.from(
    {length: 2*N},
    () => (Math.random() * 2 * Math.PI) // Random number between 0 and 2pi
  );

  // Loss function
  function loss(angles){

  }

  angle_list.forEach((item, i) => {
    console.log(item)
  });

}

let pricing = [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.06, 0.06, 0.06,
  0.06, 0.06, 0.06, 0.06, 0.06, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.06, 0.06,
  0.06, 0.06, 0.06, 0.06]
let usage = [400, 300, 200, 200, 200, 300, 300, 400, 500, 500, 500,
    500, 500, 500, 400, 400, 500, 600, 700, 700, 600, 600, 500, 400]
swarm_solve(3, 425, pricing, usage)
