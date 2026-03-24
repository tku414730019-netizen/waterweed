


let colors = ["#2ec4b6", "#e71d36", "#ff9f1c"];
let anemoneData = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    generateAnemoneData();
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

        // 搖擺幅度隨機
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
            let deltaX = deltaFactor * (noise(i / 400, frameCount / 100, data.id) - 0.5) * data.amplitude;

            // ===== ⭐ 滑鼠互動（最終版） =====

            // 影響半徑（只影響附近）
            let influenceRadius = width * 0.30;

            let distToMouse = abs(mouseX - xx);

            // 平滑距離衰減
            let normDist = constrain(1 - distToMouse / influenceRadius, 0, 1);
            let distFactor = pow(normDist, 2);

            // 海葵本身高度影響（上半部動比較大）
            let heightFactor = pow(progress, 1.8);

            // 滑鼠Y影響（越上面影響越大）
            // ⭐ 轉成 0~1
            let yNorm = mouseY / height;

            // ⭐ 計算「距離畫面中間的距離」
            let distFromCenter = abs(yNorm - 0.5);

            // ⭐ 增加自然感（曲線）
            let mouseYFactor = pow(1 - distFromCenter * 2, 2);

            // 綜合垂直影響
            let verticalInteraction = heightFactor * mouseYFactor;

            // 滑鼠水平推力
            let mouseDelta = map(mouseX, 0, width, -200, 200);

            let mouseEffect = mouseDelta * distFactor * verticalInteraction;

            // =============================

            let yy = -progress * data.height;

            curveVertex(xx + deltaX + xOffset + mouseEffect, yy); 
        }

        endShape();
    }
}

function draw() {
    background(0);
    translate(0, height);
    noFill();
    
    for (let i = 0; i < anemoneData.length; i++) {
        anemone(anemoneData[i]);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}



