/*
Owen Frausto
10/8/23

This file holds the particle optimization solver for the solar optimizer
*/
console.log("solve.js loaded");

// A first attempt at a nieve solver
function swarm_solve(max_iter, N_swarm, N, P, lat, mu, pricing_profile, usage_profile){
  "use strict";
  /* Implement a swarm solver using for loops and arrays
    N - number of solar panels (int)
    P - Rating of each solar panel (int, Watts)
    lat - Latitude (radians)
    mu - fraction of price earned for excess solar (float between 0-1)
    pricing_profile - list of hourly prices (24 int list, cent/kwh)
    usage_profile - List of hourly usage (24 int list, Watts)
  */

  // Want to get MVP working, can try to adjust parameters and improve efficiency later
  function addVector(v, w){
      return v.map((e,i) => e + w[i]);
  }

  function subtractVector(v, w){
      return v.map((e,i) => e - w[i]);
  }

  function scaleVector(v,c){
      return v.map((e,i) => e*c);
  }

  // Leaky rectified linear unit (LReLU) function
  function lrelu(a, x){
    return Math.min(a*x,0) + Math.max(x,0);
  }

  // Define gain function
  function gain(angles){
    // Returns cost of an entire year subject to the given angles
    //Initialize function-level variables
    let sum = 0;
    let theta;
    let excess;
    let sun_visible;
    let cos_theta;
    let phi = lat;

    // Loop through days and hours
    for(let n=1; n<=365; n++){
      // Declination angle in radians
      let delta = 23.45*Math.sin(2*Math.PI*(284+n)/365)*Math.PI/180;
      // Sunrise angle in radians
      let w_s = Math.acos(-Math.tan(phi)*Math.tan(delta));

      for(let h=0; h<24; h++){
        // Hour angle in radians
        let w = -15*(h-12)*Math.PI/180;

        //Calculate total generation for hour
        let generation = 0;
        for(let i=0; i<N; i++){ // Loop through pairs of solar panel angles
          // Index angles
          let gamma = angles[2*i];
          let beta = angles[(2*i) + 1];

          // See document for derivation/justification:
          cos_theta =
            Math.sin(delta)*Math.sin(phi)*Math.cos(beta)
            -Math.sin(delta)*Math.cos(phi)*Math.sin(beta)*Math.cos(gamma)
            +Math.cos(delta)*Math.cos(phi)*Math.cos(beta)*Math.cos(w)
            +Math.cos(delta)*Math.sin(phi)*Math.sin(beta)*Math.cos(gamma)*Math.cos(w)
            +Math.cos(delta)*Math.sin(beta)*Math.sin(gamma)*Math.sin(w);
          theta = Math.acos(cos_theta);
          sun_visible = (theta < Math.PI/2 && theta > -Math.PI/2)
                          && (w < w_s && w > -w_s);
          if(sun_visible){
            generation += P*cos_theta;
          }
        }
        excess = -usage_profile[h] + generation;
        sum += -pricing_profile[h] * lrelu(mu, -excess);
      }
    }
    return sum;
  }

  function generate_random_coordinates(){
    return Array.from(
      {length: 2*N},
      (v, i) => {
        // i even -> beta -> between 0 and pi/2
        // i odd -> gamma -> between -pi and pi
        return i%2 == 0 ? Math.random() * Math.PI/2
                : (Math.random()*2*Math.PI)-Math.PI;
    });
  }

  function generate_random_velocity(){
    return Array.from(
      {length: 2*N},
      (v, i) => {
        // i even -> beta -> between -pi/2 and pi/2
        // i odd -> gamma -> between -2pi and 2pi
        return i%2 == 0 ? (Math.random() * Math.PI) - (Math.PI/2)
                : (Math.random()*4*Math.PI)-(2*Math.PI);
    });
  }

  // Define particle object
  class Particle {
    constructor(N){
      // Takes dimension of problem
      this.x = generate_random_coordinates();
      // angle_list is laid out as [beta_1, gamma_1, ..., beta_N, gamma_N]
      // recall 0 < beta < pi/2 and -pi < gamma < pi

      this.local_best_gain = gain(this.x);
      this.local_best_x = this.x;
      // Define particle update parameters
      this.phi_cog = 3; // cognitive coefficent
      this.phi_soc = 1; // social coefficient
      this.w = 0.1 // Inertia
    }

    stepParticle(global_best_x){
      // Generate cognitive and social random terms
      let r_cog = Math.random()
      let r_soc = Math.random()

      // Add velocity/inertia term
      this.x = addVector(
        this.x,
        scaleVector(generate_random_velocity(), this.w)
      );

      // Add cognitive term
      this.x = addVector(
        this.x,
        scaleVector(
          subtractVector(this.local_best_x, this.x),
          this.phi_cog * r_cog
        )
      );

      // Add social term
      this.x = addVector(
        this.x,
        scaleVector(
          subtractVector(global_best_x, this.x),
          this.phi_soc * r_soc
        )
      );

      // Update gain
      this.gain = gain(this.x);

      // Check if gain is best
      if(this.gain > this.local_best_gain){
        this.local_best_gain = this.gain;
        this.local_best_x = this.x
      }
    }
  }

  class Swarm {
    constructor(N_swarm){
      this.N_swarm = N_swarm;
      // Initialize particles
      this.particles = Array.from(
          {length:N_swarm},
          () => new Particle(N)
      );

      // Initialize global best_gain
      this.global_best_x = this.particles[0].local_best_x;
      this.global_best_gain = this.particles[0].local_best_gain;
      this.updateGlobalBests();
    }

    // Find global historical best
    updateGlobalBests(){
      this.particles.forEach((particle, i) => {
        if(particle.local_best_gain > this.global_best_gain){
          this.global_best_gain = particle.local_best_gain;
          this.global_best_x = particle.local_best_x;
        }
      });
    }

    stepSwarm(){
      this.particles.forEach((particle, i) => {
        particle.stepParticle(this.global_best_x);
      });
      this.updateGlobalBests();
    }
  }

  // Run training loop
  let swarm = new Swarm(30);
  for(let i = 0; i < max_iter; i++){
    //console.log(swarm.global_best_gain);
    swarm.stepSwarm();
    console.log(swarm.global_best_gain);
  }
  //console.log(swarm.global_best_x);
  return swarm.global_best_x;
}

function generateSolarProfile(angles, P, lat, mu){
  profile = [];
  let phi = lat;
  let n = 125; // Might want to update
  let N = angles.length/2;
  let delta = 23.45*Math.sin(2*Math.PI*(284+n)/365)*Math.PI/180;
  // Sunrise angle in radians
  let w_s = Math.acos(-Math.tan(phi)*Math.tan(delta));

  for(let h=0; h<24; h++){
    // Hour angle in radians
    let w = -15*(h-12)*Math.PI/180;

    //Calculate total generation for hour
    let generation = 0;
    for(let i=0; i<N; i++){ // Loop through pairs of solar panel angles
      // Index angles
      let gamma = angles[2*i];
      let beta = angles[(2*i) + 1];

      // See document for derivation/justification:
      cos_theta =
        Math.sin(delta)*Math.sin(phi)*Math.cos(beta)
        -Math.sin(delta)*Math.cos(phi)*Math.sin(beta)*Math.cos(gamma)
        +Math.cos(delta)*Math.cos(phi)*Math.cos(beta)*Math.cos(w)
        +Math.cos(delta)*Math.sin(phi)*Math.sin(beta)*Math.cos(gamma)*Math.cos(w)
        +Math.cos(delta)*Math.sin(beta)*Math.sin(gamma)*Math.sin(w);
      theta = Math.acos(cos_theta);
      sun_visible = (theta < Math.PI/2 && theta > -Math.PI/2)
                      && (w < w_s && w > -w_s);
      if(sun_visible){
        generation += P*cos_theta;
      }
    }
    profile.push(generation);
  }
  return profile;
}

/*
let pricing = [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.06, 0.06, 0.06,
  0.06, 0.06, 0.06, 0.06, 0.06, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.06, 0.06,
  0.06, 0.06, 0.06, 0.06]
let usage = [400, 300, 200, 200, 200, 300, 300, 400, 500, 500, 500,
    500, 500, 500, 400, 400, 500, 600, 700, 700, 600, 600, 500, 400]
swarm_solve(500, 30, 3, 425, 0.68, 0.8, pricing, usage)
*/

function getProfile(name, scale){
  container = $(`.${name}-container`);
  // Get maximum axis value
  axis_max = parseFloat(container.find(`.${name}-axis-label`)[0].children[0].innerHTML);
  sliders = Array.from(container.find(`.${name}-box`));
  profile = [];
  // Get the height of each bar
  sliders.forEach((elem, i) => {
    // THIS NEEDS TO CHANGE IF TEMPLATES CHANGE
    box_height = elem.offsetHeight;
    slider_height = elem.children[0].offsetHeight;
    bar_height = elem.children[1].offsetHeight;
    label_height = elem.children[2].offsetHeight;

    // Calculate proportion of height * axis max
    profile.push(axis_max * bar_height / (box_height - label_height - slider_height) * scale);
  });
  return profile
}

// Connect solver to front end
$(document).ready(function(){
  // Trigger solver
  $("#calculate").on("click", function(){

    // Get solver parameters from html elements
    let P = parseFloat($("#parameter-P")[0].value);
    let N = parseInt($("#parameter-N")[0].value);
    let lat = parseFloat($("#parameter-lat")[0].value);
    let mu = parseFloat($("#parameter-mu")[0].value);

    let pricing_profile = getProfile("pricing", scale=0.001);
    let usage_profile = getProfile("usage", scale=1);

      // Run solver
      solution = swarm_solve(max_iter=50, N_swarm=30, N, P, lat, mu, pricing_profile, usage_profile)

      // Generate solar profile
      solar_profile = generateSolarProfile(solution, P, lat, mu);

      // Display results
      initialize_box_classes("result", solar_profile, scale_axis="auto")
  });
});
