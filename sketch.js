let colors = ["#2ec4b6", "#e71d36", "#ff9f1c"];
let anemoneData = [];
let bubbles = [];
let activeParticles = [];
let popSound;

// 自行追蹤滑鼠座標，不依賴 p5 的 mouseX/mouseY
// （因為 canvas 設了 pointer-events:none，p5 收不到滑鼠事件）
let mx = 0;
let my = 0;

function preload() {
    popSound = loadSound('pop.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    generateAnemoneData();

    // 從 #mouseOverlay 這個透明 div 監聽滑鼠事件
    const overlay = document.getElementById('mouseOverlay');

    overlay.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    overlay.addEventListener('mouseleave', () => {
        // 離開視窗時讓海葵回到靜止狀態（置中）
        mx = width / 2;
        my = height / 2;
    });
}

function generateAnemoneData() {
    anemoneData = [];

    const baseSpacing = 35;
    const count = Math.floor(width / baseSpacing) + 1;
    
    for (let i = 0; i < count; i++) {

        let ratio = i / count;

        const randomStroke = random(24, 45);

        const avgHeight = height / 3;
        const randomHeight = constrain(
            random(avgHeight * 0.8, avgHeight * 1.2), 
            0, 
            height / 2
        );

        const baseAmplitude = 200;
        const randomAmplitude = baseAmplitude * random(0.5, 1.5);

        anemoneData.push({
            ratio: ratio,
            id: i,
            color: colors[i % colors.length],
            strokeWeight: randomStroke,
            height: randomHeight,
            amplitude: randomAmplitude
        });
    }
}

function createBubble() {
    let earlyPop = random() < 0.7; 
    let popY = earlyPop ? random(height * 0.1, height * 0.9) : -50; 

    return {
        x: random(width),
        y: height,
        radius: random(8, 25),
        speedY: random(0.5, 1.5) * 1.7,
        opacity: random(80, 200),
        life: 0,
        maxLife: random(300, 500),
        popY: popY
    };
}

function burstBubble(bubble) {
    if (popSound) {
        popSound.play();
    }
    
    for (let i = 0; i < 12; i++) {
        let angle = TWO_PI / 12 * i;
        let velocity = createVector(cos(angle) * 3, sin(angle) * 3);
        activeParticles.push({
            x: bubble.x,
            y: bubble.y,
            vx: velocity.x,
            vy: velocity.y,
            life: 0,
            maxLife: 15,
            opacity: bubble.opacity * 0.8
        });
    }
}

function updateBubbles() {
    if (random() < 0.05) {
        bubbles.push(createBubble());
    }
    
    for (let i = bubbles.length - 1; i >= 0; i--) {
        let bubble = bubbles[i];
        
        bubble.y -= bubble.speedY;
        bubble.life++;
        
        if (bubble.y < bubble.popY || bubble.y < -bubble.radius || bubble.life > bubble.maxLife) {
            burstBubble(bubble);
            bubbles.splice(i, 1);
            continue;
        }
        
        noStroke();
        let bubbleAlpha = bubble.opacity * (1 - bubble.life / bubble.maxLife);
        fill(255, bubbleAlpha);
        circle(bubble.x, bubble.y, bubble.radius * 2);
        
        let highlightAlpha = bubbleAlpha * 0.6;
        fill(255, highlightAlpha);
        let highlightX = bubble.x - bubble.radius * 0.4;
        let highlightY = bubble.y - bubble.radius * 0.4;
        circle(highlightX, highlightY, bubble.radius * 0.5);
    }
    
    for (let i = activeParticles.length - 1; i >= 0; i--) {
        let particle = activeParticles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        
        let particleAlpha = particle.opacity * (1 - particle.life / particle.maxLife);
        fill(255, particleAlpha);
        noStroke();
        circle(particle.x, particle.y, 3);
        
        if (particle.life >= particle.maxLife) {
            activeParticles.splice(i, 1);
        }
    }
}

function anemone(data){  

    let xx = data.ratio * width;
    const layers = 4;

    for (let L = 0; L < layers; L++) {

        let xOffset = map(L, 0, layers - 1, -80, 8);

        let layerClr = color(data.color);
        layerClr.setAlpha(160 - L * 30);
        
        beginShape();

        strokeWeight(data.strokeWeight * map(L, 0, layers - 1, 1, 0.5));
        stroke(layerClr);
        
        for(let i = 0; i < 300; i++){

            let progress = i / 300;

            let deltaFactor = map(i, 0, 50, 0, 1, true);
            let deltaX = deltaFactor * (noise(i / 400, frameCount / 100 * 0.5, data.id) - 0.5) * data.amplitude; 

            let influenceRadius = width * 0.30;

            // 使用自訂的 mx 取代 p5 內建的 mouseX
            let distToMouse = abs(mx - xx);

            let normDist = constrain(1 - distToMouse / influenceRadius, 0, 1);
            let distFactor = pow(normDist, 2);

            let heightFactor = pow(progress, 1.8);

            // 使用自訂的 my 取代 p5 內建的 mouseY
            let yNorm = my / height;

            let distFromCenter = abs(yNorm - 0.5);

            let mouseYFactor = pow(1 - distFromCenter * 2, 2);

            let verticalInteraction = heightFactor * mouseYFactor;

            // 使用自訂的 mx 取代 p5 內建的 mouseX
            let mouseDelta = map(mx, 0, width, -200, 200);

            let mouseEffect = mouseDelta * distFactor * verticalInteraction;

            let yy = -progress * data.height;

            curveVertex(xx + deltaX + xOffset + mouseEffect, yy); 
        }

        endShape();
    }
}

function draw() {
    clear();
    translate(0, height);
    noFill();
    
    for (let i = 0; i < anemoneData.length; i++) {
        anemone(anemoneData[i]);
    }
    
    translate(0, -height);
    updateBubbles();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    // 重置滑鼠到畫面中心，避免 resize 後殘留舊座標
    mx = width / 2;
    my = height / 2;
}
