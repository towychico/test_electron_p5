'use strict';

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//Imports P5. Instantiates the sketch at the bottom of this file.
const p5 = require('p5');
//Imports our custom function to decide what color the fill shall be.
const { getFillColor } = require('./js/src/colorController');

const sz = 20;
let cols;
let rows;
const charges = [];
const K = 1000;
let running = false;
let magField;
let w;
let h;

let holdingAlt = false;



const sketch = (p) => {

  class Charge {
    constructor(x, y, charge, lazy) {
      this.pos = p.createVector(x, y);
      this.vel = p.createVector();
      this.acc = p.createVector();
      this.charge = charge;
      this.lazy = lazy;
    }

    applyForce(force) {
      this.acc.add(force);
    }

    fieldLine(x, y) {
      const disp = p5.Vector.sub(p.createVector(x, y), this.pos);
      const distSq = disp.magSq();
      disp.setMag(K * this.charge / distSq);
      return disp;
    }

    update() {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }

    render() {
      const c = this.charge ? this.charge*20 : 20;
      const l = this.charge ? this.charge*7 : 7;
      if (this.charge > 0) {
        p.noStroke();
        p.fill(this.lazy ? 128 : 255, 0, 0);//Positive charge color
        p.circle(this.pos.x, this.pos.y, c);
        p.stroke(255);
        p.line(this.pos.x-l, this.pos.y, this.pos.x+l, this.pos.y);
        p.line(this.pos.x, this.pos.y-l, this.pos.x, this.pos.y+l);
      } else if (this.charge < 0) {
        p.noStroke();
        p.fill(0, 0, this.lazy ? 128 : 255); //Negative Charge Color
        p.circle(this.pos.x, this.pos.y, c);
        p.stroke(255);
        p.line(this.pos.x-l, this.pos.y, this.pos.x+l, this.pos.y);
      }
    }

  }


//Starting out sketch and
//injecting p5, as the param p, into our sketch function.
  function keyPressed() {
    if (p.key == 1) {
      //charges.push(new Charge(mouseX, mouseY, holdingAlt ? 0.5 : 1, false));
      drawPositivePlates();
    } if (p.key == 2) {
      //charges.push(new Charge(mouseX, mouseY, holdingAlt ? -0.5 : -1, false));
      drawNegativePlates()
    } else if (p.key == "!") {
      charges.push(new Charge(mouseX, mouseY, holdingAlt ? 0.5 : 1, true));
    } else if (p.key == "@") {
      charges.push(new Charge(mouseX, mouseY, holdingAlt ? -0.5 : -1, true));
    } else if (p.key == "r" || key == "R") {
      running = !running;
    } else if (p.keyCode == 18) {
      holdingAlt = true;
    }
  }
  p.setup = () => {
    // Create the canvas
    let myCanvas = p.createCanvas(p.windowWidth, p.windowHeight);
    cols = (p.width / sz) | 0;
    rows = (p.height / sz) | 0;
    magField = Array(rows).fill().map(() => Array(cols).fill(0));
    w = p.width - p.width % cols;
    h = p.height - p.height % rows;
   p.background('#ffffff');


  };

  p.draw = () => {
    let fillColor = getFillColor(p.mouseIsPressed);
    p.background("#ffffff");
    if (p.keyIsPressed) {
      const i = p.map(p.mouseX, 0, w, 0, cols) | 0;
      const j = p.map(p.mouseY, 0, h, 0, rows) | 0;
      if (p.key == "3") {
        magField[j][i] = 1;
      } else if (p.key == "4") {
        magField[j][i] = 2;
      } else if (p.key == "0") {
        magField[j][i] = 0;
      }
    }
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i*sz + sz/2;
        const y = j*sz + sz/2;
        p.stroke('#f26806');//Electromacnetic field Color
        p.fill('#f26806');
        const sum = p.createVector();
        for (const c of charges)  {
          const line = c.fieldLine(x, y);
          sum.add(line);
        }
        if (magField[j][i] == 1) {
          p.fill(255, 0, 217);
          p.square(i*sz, j*sz, sz);
        } else if (magField[j][i] == 2) {
          p.fill(255, 0, 255);
          p.square(i*sz, j*sz, sz);
        }
        sum.mult(100);
        sum.limit(15);
        p.line(x, y, x + sum.x, y + sum.y);
        p.circle(x, y, 4);
      }
    }
    if (running) {
      for (const a of charges) {
        for (const b of charges) {
          if (a != b) {
            const line = a.fieldLine(b.pos.x, b.pos.y);
            line.mult(b.charge);
            b.applyForce(line);
          }
        }
      }
      for (const c of charges) {
        const i = map(c.pos.x, 0, w, 0, cols) | 0;
        const j = map(c.pos.y, 0, h, 0, rows) | 0;
        if (i >= 0 && i < cols && j >= 0 && j < rows) {
          if (magField[j][i] == 1) {
            c.vel.rotate(radians(3) * c.charge);
          } else if (magField[j][i] == 2) {
            c.vel.rotate(-radians(3) * c.charge);
          }
        }
      }
    }
    for (const c of charges) {
      if (running && !c.lazy) {
        c.update();
      }
      c.render();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  }
  const drawPositivePlates = () => {
    for (let i = 0; i < 120; i++) {
      charges.push((new Charge(230, i+200,  1, false)))
    }
  }
  const drawNegativePlates = () => {
    for (let i = 0; i < 80; i++) {
      charges.push((new Charge(330, i+200,  -1, false)))
    }
  }


drawPositivePlates();
  drawNegativePlates();
}


//Instantiates P5 sketch to keep it out of the global scope.
const app = new p5(sketch);