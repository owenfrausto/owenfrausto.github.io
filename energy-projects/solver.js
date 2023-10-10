/*
Owen Frausto
10/8/23

This file holds the particle optimization solver for the solar optimizer
*/
console.log("solve.js loaded")

// A first attempt at a nieve solver
function swarm_solve(N, P, lat, mu, pricing_profile, usage_profile){
  "use strict";
  /* Implement a swarm solver using for loops and arrays
    N - number of solar panels (int)
    P - Rating of each solar panel (int, Watts)
    lat - Latitude (radians)
    mu - fraction of price earned for excess solar (float between 0-1)
    pricing_profile - list of hourly prices (24 int list, cent/kwh)
    usage_profile - List of hourly usage (24 int list, Watts)
  */

  // Want to get MVP working, can try to adjust parameters later

  // Initialize random angle array
  let angle_list = Array.from(
    {length: 2*N},
    () => (Math.random() * 2 * Math.PI) // Random number between 0 and 2pi
  );

  function lrelu(x){

  }

  // Define loss function
  function loss(angles){
    let sum = 0;
    let theta;
    let cos_theta;
    let phi = lat;
    // Loop through panels
    for(let i=0; i<N; i++){
      // Reference angles
      let gamma = angles[2*i];
      let beta = angles[(2*i) + 1];
      // Loop through days and hours
      for(let n=1; n<=365; n++){
        //Declination angle in radians
        let delta = 23.45*Math.sin(2*Math.PI*(284+n)*365)*Math.PI/180;
        for(let h=0; h<24; h++){
          // Hour angle in radians
          let w = -15*(h-12)*Math.PI/180;
          cos_theta =
            Math.sin(delta)*Math.sin(phi)*Math.cos(beta)
            -Math.sin(delta)*Math.cos(phi)*Math.sin(beta)*Math.cos(gamma)
            +Math.cos(delta)*Math.cos(phi)*Math.cos(beta)*Math.cos(w)
            +Math.cos(delta)*Math.sin(phi)*Math.sin(beta)*Math.cos(gamma)*Math.cos(w)
            +Math.cos(delta)*Math.sin(beta)*Math.sin(gamma)*Math.sin(w);
          theta = Math.acos(cos_theta);
          console.log( (theta < Math.PI/2 && theta > -Math.PI/2));
          sum += 1;
        }
      }
    }
    console.log(sum);
  }

  angle_list.forEach((item, i) => {
    //console.log(item);
  });

  // Run loop
  let max_iter = 1000;
  loss(angle_list);
}

let pricing = [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.06, 0.06, 0.06,
  0.06, 0.06, 0.06, 0.06, 0.06, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.06, 0.06,
  0.06, 0.06, 0.06, 0.06]
let usage = [400, 300, 200, 200, 200, 300, 300, 400, 500, 500, 500,
    500, 500, 500, 400, 400, 500, 600, 700, 700, 600, 600, 500, 400]
swarm_solve(3, 425, 0.69, 0.8, pricing, usage)
