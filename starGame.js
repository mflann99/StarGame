// @ts-check
export {};

/**
 * Example 2 (Insides and Outsides) - Squares with style
 * Part B
 */

/** @type {HTMLCanvasElement} */
let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("boxCanvas"));
let context = canvas.getContext('2d');

//i didn't want to change var names but its no longer based on mouse input
let mouseX = 200;
let mouseY = 500;

//function to get rid of the star screen and begin animating
let start = false
function begin(s){
    if (!s){
        start =true;
        animate();
    }
}
const move_constant = 5; //max speed
let accel_x = 0;
let accel_y = 0;
const a_init = 2; //initial acceleration
const a = 0.5; //incremental acceleration. Increase for less "floatiness"
let left = false;
let up = false;
let right = false;
let down = false;

document.onkeydown = function (event) {
    switch (event.keyCode) {
       case 37:
          //accel_x += -a_init;
          left = true;
          begin(start);
          break;
       case 38:
          //accel_y += -a_init;
          up = true;
          begin(start);
          break;
       case 39:
          //accel_x += a_init;
          right = true;
          begin(start);
          break;
       case 40:
          //accel_y += a_init;
          down = true;
          begin(start);
          break;
    }
 };

 document.onkeyup = function (event) {
    switch (event.keyCode) {
       case 37:
          left = false;
          begin(start);
          break;
       case 38:
          up = false;
          begin(start);
          break;
       case 39:
          right = false;
          begin(start);
          break;
       case 40:
          down = false;
          begin(start);
          break;
    }
 };

 //generates random integer
function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//draws hydrogen molecules
function drawH(x,y,scale,color,angle){
    context.fillStyle = color;
    context.save();
        context.translate(x,y);
        context.scale(scale*angle,scale);
        context.fillRect(-4.5,0,3,9);
        context.fillRect(-4.5,3,9,3);
        context.fillRect(1.5,0,3,9);

    context.restore();
}

//draws the main player star
function drawStar(x,y,radius,color){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x,y,radius,0,2*Math.PI);
    context.closePath();
    context.fill();

    //below code handles the trail
    context.fillStyle = "rgba(" + rgb[0]+","+rgb[1]+","+rgb[2]+",0.8)"
    context.beginPath();
    context.arc(x+(-accel_x*2),y+(-accel_y*2),radius*0.9,0,2*Math.PI);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(" + rgb[0]+","+rgb[1]+","+rgb[2]+",0.6)"
    context.beginPath();
    context.arc(x+(-accel_x*4),y+(-accel_y*4),radius*0.7,0,2*Math.PI);
    context.closePath();
    context.fill();

    context.fillStyle = "rgba(" + rgb[0]+","+rgb[1]+","+rgb[2]+",0.4)"
    context.beginPath();
    context.arc(x+(-accel_x*5),y+(-accel_y*5),radius*0.5,0,2*Math.PI);
    context.closePath();
    context.fill();

    //code to handle the gradual whitening of the core
    for(let i = 0.8; i>0; i-=0.1){
        context.fillStyle = "rgba(255,255,255,0.1)";
        context.beginPath();
        context.arc(x,y,radius*i,0,2*Math.PI);
        context.closePath();
        context.fill();
    }

}

//draws black hole
function drawHole(x,y, scale){
    context.save();
    context.scale(scale,scale);
    for(let i = 1.4; i>0.4; i-=0.1){
        context.fillStyle = "rgba(255,100,0,0.2)";
        context.beginPath();
        context.arc(x,y,30*i,0,2*Math.PI);
        context.closePath();
        context.fill();
    }

    for(let i = 1.4; i>0.4; i-=0.1){
        context.fillStyle = "rgba(255,100,0,0.2)";
        context.save()
            context.scale(1,0.2)
            context.beginPath();
            context.arc(x,5*y,50*i,0,2*Math.PI);
            context.closePath();
            context.fill();
        context.restore()
    }
    context.fillStyle = "black";
    context.beginPath();
    context.arc(x,y,25,0,2*Math.PI);
    context.closePath();
    context.fill();
    context.restore();
}

//updates the color of the star based on score
function changeColor(score,rgb){
    if(score<10){
        //rgb[0] -= 25;
        rgb[1] += 20;
    }
    else if(score<15){
        rgb[2] += 25;
    }
    else if(score<20){
        rgb[0] -= 10;
        rgb[1] -= 10;
        rgb[2] += 25;
    }
    else if(score<30){
        rgb[0] -= 10;
        rgb[1] -= 10;
    }

    return rgb
}

//initiates game over screen
function gameOver(){
    context.font = '48px copperplate';
    context.fillStyle = "red";
    context.textAlign = 'center';
    context.fillText("Game Over",200,250);
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.strokeText("Game Over",200,250);
}

let score_constant;
let s_c
let mass;
let temp;

//generates the mass and temperature
function updateScore(score,radius){
    mass = 0.1 + score* 0.1
    mass = Math.round(mass * 100) / 100

    temp = 1000 + score*1000
    temp = Math.round(temp * 100) / 100

    context.font = "16px Monaco";
    context.fillStyle = "white";
    context.textAlign = "left";
    context.fillText("Mass:" + mass + " Mo", 8,24);

    context.textAlign = "right";
    context.fillText("Temperature:" + temp + " K", 392,24);
}

let rgb = [255,50,0];
let back_stars = [];
let gen_int = 0;
let speed = 2;
const colors = ["rgba(255,50,0,0.8)","rgba(255,255,0,0.8)","rgba(0,50,255,0.8)"];
let h_p = [];
let black_holes =[]
let lastTimestamp;
let delta;
//change from score to mass/temp at some point
let score = 0;
let lose = false;
let radius = 20;

function animate(timestamp) {
    // clear the canvas
    context.fillStyle = "black"
    context.fillRect(0,0,canvas.width,canvas.height);

    delta = 0.001 * (lastTimestamp ? timestamp - lastTimestamp : 0);
    lastTimestamp = timestamp;
    //timestamp += 1;

    gen_int = randInt(0,10);
    if(gen_int>8){
        let x = randInt(5,595);
        back_stars.push({"x":x,"y":0});
    }

    back_stars.forEach(function(star){
        //moves stars down for feeling of movement. Speed can be adjusted
        star.y = star.y + speed;
        context.fillStyle = colors[star.x%3];
        context.fillRect(star.x-2,star.y-2,4,4);
        context.fillStyle = "rgba(255,255,255,0.9)"
        context.fillRect(star.x-1,star.y-1,2,2);

    })

    back_stars = back_stars.filter(
        star => (star.y<canvas.height)
    )
if(!lose){
    
    //hydrogen spawn freq
    gen_int = randInt(0,100);
    if(gen_int > 98){
        let x = randInt(10,390);
        let s = 3*Math.random()
        h_p.push({"x":x,"y":0,"speed":speed+s,"collect":false,"time":0});
    }

    //generates hydrogen. Collect to increase your stars mass and temperature
    h_p.forEach(function(h){
        h.y = h.y + h.speed;
        context.save();
            //context.scale(Math.cos(lastTimestamp/100),1);
            drawH(h.x,h.y,1.8,"Chartreuse",Math.cos(h.time));
            drawH(h.x,h.y,1.6,"white",Math.cos(h.time));
        context.restore();

        if((Math.abs(mouseX-h.x)<radius) && (Math.abs(mouseY-h.y)<radius)){
            if (score<=30){
                score += 1;
            } else{
                score += 0.1;
            }
            h.collect = true;
            rgb = changeColor(score,rgb); //changes color of star as more H collected
            radius -= 0.5 //decreases size of star
        }
        h.time += 2*delta;
    })

    h_p = h_p.filter(
        h => ((h.y<canvas.height+10) && h.collect == false)
    )
    
    //black hole spawn freq
    gen_int = randInt(0,1000);
    if(gen_int > 995){
        let x = randInt(30,380);
        let s = 1 + Math.random()
        black_holes.push({"x":x,"y":-30,"scale":1,"hit":false});
    }

    black_holes.forEach(function(bh){
        bh.y += speed;
        drawHole(bh.x,bh.y,bh.scale);
        //the 30 will need to be changed depending on final size of the black hole
        if((Math.abs(mouseX-bh.x)<radius+(25*bh.scale)) && (Math.abs(mouseY-bh.y)<radius+(25*bh.scale))){
            bh.hit = true;
            lose = true;
        }
    })

    black_holes = black_holes.filter(
        bh => ((bh.y<canvas.height+30)) //&& bh.hit == false)
    )

    mouseX += accel_x;
    mouseY += accel_y;
    
    //make sure star doesn't go out of bounds
    if(mouseX<radius/2){
        mouseX=radius/2;
        accel_x = 0;
    }
    if(mouseX>400-(radius/2)){
        mouseX=400-(radius/2);
        accel_x = 0;
    }
    if(mouseY<radius/2){
        mouseY=radius/2;
        accel_y = 0;
    }
    if(mouseY>600-(radius/2)){
        mouseY=600-(radius/2);
        accel_y = 0;
    }

    //accelleration increase
    if(left && accel_x>-move_constant){
        accel_x -= a;
    }
    if(right && accel_x<move_constant){
        accel_x += a;
    }
    if(up && accel_y>-move_constant){
        accel_y -= a;
    }
    if(down && accel_y<move_constant){
        accel_y += a;
    }

    //deacceleration. Increase for less "floatiness"
    if (accel_x<0){
        accel_x += 0.07
    } else{
        accel_x -= 0.07
    }
    if (accel_y<0){
        accel_y += 0.07
    } else{
        accel_y -= 0.07
    }

    drawStar(mouseX,mouseY,radius,"rgba(" + rgb[0]+","+rgb[1]+","+rgb[2]+",1)")

    if (speed<4) speed += delta/50;
    else speed += delta/100;
    //radius expansion rate
    radius += delta/2
} else{
   gameOver();
}
updateScore(score,radius);
        window.requestAnimationFrame(animate);

}

context.fillStyle = "black"
context.fillRect(0,0,canvas.width,canvas.height);
context.font = '48px copperplate';
context.fillStyle = "red";
context.textAlign = 'center';
context.fillText("Shooting Stars",200,250);
context.strokeStyle = "white";
context.lineWidth = 2;
context.strokeText("Shooting Stars",200,250);

context.font = "16px Monaco";
context.fillStyle = "white";
context.textAlign = "center";
context.fillText("Collect Hydrogen", 180,300);

drawH(280,285,1.8,"Chartreuse",1);
drawH(280,285,1.6,"white",1);

context.font = "16px Monaco";
context.fillStyle = "white";
context.textAlign = "center";
context.fillText("Avoid Black Holes", 150,350);

drawHole(410,490,0.7);

context.font = "16px Monaco";
context.fillStyle = "white";
context.textAlign = "center";
context.fillText("(Press Arrow Keys To Start)", 200,400);



drawStar(mouseX, mouseY, radius, "rgba(" + rgb[0]+","+rgb[1]+","+rgb[2]+",1)");




