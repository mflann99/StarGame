// @ts-check
export {};

/**
 * Example 2 (Insides and Outsides) - Squares with style
 * Part B
 */

/** @type {HTMLCanvasElement} */
let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("boxCanvas"));
let context = canvas.getContext('2d');

let mouseX = -10;
let mouseY = -10;
// when the mouse moves in the canvas, remember where it moves to
canvas.onmousemove = function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    // unfortunately, X,Y is relative to the overall window -
    // we need the X,Y inside the canvas!
    // we know that event.target is a HTMLCanvasElement, so tell typescript
    let box = /** @type {HTMLCanvasElement} */(event.target).getBoundingClientRect();
    mouseX -= box.left;
    mouseY -= box.top;
};

function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

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

function drawStar(x,y,radius,color){
    context.fillStyle = color;
    context.beginPath();
    context.arc(x,y,radius,0,2*Math.PI);
    context.closePath();
    context.fill();

    for(let i = 0.8; i>0; i-=0.1){
        context.fillStyle = "rgba(255,255,255,0.1)";
        context.beginPath();
        context.arc(x,y,radius*i,0,2*Math.PI);
        context.closePath();
        context.fill();
    }

}

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

//change with correct score proportions
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

function gameOver(){
    context.font = '48px copperplate';
    context.fillStyle = "red";
    context.textAlign = 'center';
    context.fillText("Game Over",200,250);
    context.strokeStyle = "white";
    context.lineWidth = 2;
    context.strokeText("Game Over",200,250);
}

function updateScore(score,radius){
    context.font = "16px Monaco";
    context.fillStyle = "white";
    context.textAlign = "left";
    context.fillText("Mass:" + score, 8,24);
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
let score_text = document.getElementById("score")
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
        h_p.push({"x":x,"y":0,"speed":speed+s,"collect":false});
        console.log(h_p.length);
    }

    //generates hydrogen. Collect to increase your stars mass and temperature
    h_p.forEach(function(h){
        h.y = h.y + h.speed;
        context.save();
            //context.scale(Math.cos(lastTimestamp/100),1);
            drawH(h.x,h.y,1.8,"Chartreuse",Math.cos(lastTimestamp/1000));
            drawH(h.x,h.y,1.6,"white",Math.cos(lastTimestamp/1000));
        context.restore();

        if((Math.abs(mouseX-h.x)<radius) && (Math.abs(mouseY-h.y)<radius)){
            score += 1;
            h.collect = true;
            rgb = changeColor(score,rgb); //changes color of star as more H collected
            radius += 0.5 //increases size of star
        }
    })

    h_p = h_p.filter(
        h => ((h.y<canvas.height) && h.collect == false)
    )
    
    //black hole spawn freq
    gen_int = randInt(0,1000);
    if(gen_int > 995){
        let x = randInt(30,380);
        let s = 1 + Math.random()
        black_holes.push({"x":x,"y":0,"scale":1,"hit":false});
    }

    black_holes.forEach(function(bh){
        bh.y += speed;
        drawHole(bh.x,bh.y,bh.scale);
        //the 30 will need to be changed depending on final size of the black hole
        if((Math.abs(mouseX-bh.x)<radius+(30*bh.scale)) && (Math.abs(mouseY-bh.y)<radius+(30*bh.scale))){
            bh.hit = true;
            lose = true;
        }
    })

    black_holes = black_holes.filter(
        bh => ((bh.y<canvas.height)) //&& bh.hit == false)
    )

    if ( (mouseX > 0) && (mouseY > 0) ) {
        drawStar(mouseX,mouseY,radius,"rgba(" + rgb[0]+","+rgb[1]+","+rgb[2]+",1)")
    }

    if (speed<4) speed += delta/50;
    else speed += delta/100;

} else{
   gameOver();
}
updateScore(score,radius);
        window.requestAnimationFrame(animate);

}
animate();

