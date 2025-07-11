const videoElement = document.getElementById('camera-feed');

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        videoElement.srcObject = stream;
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                console.log('Camera setup complete');
                resolve(videoElement);
            };
        });
    } catch (error) {
        console.error('Error setting up camera:', error);
        throw error;
    }
}

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs';

async function loadFaceLandmarkModel() {
    try {
        console.log('Loading face landmark model...');
        await tf.setBackend('webgl');
        await tf.ready();
        const model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 4 }
        );
        console.log('Face landmark model loaded successfully');
        return model;
    } catch (error) {
        console.error('Error loading face landmark model:', error);
        throw error;
    }
}

async function detectFaces(model) {
    try {
        if (!videoElement.videoWidth || !videoElement.videoHeight) {
            return [];
        }
        const predictions = await model.estimateFaces({input: videoElement, returnTensors: false, flipHorizontal: false, predictIrises: false});
        if (!predictions || predictions.length === 0) {
            return [];
        }
        // For each face, extract keypoints (use 0: nose, 1: left eye, 2: right eye, 3: left ear, 4: right ear from mesh)
        const faceDataArray = predictions.map((face, personIndex) => {
            // MediaPipe FaceMesh: 1=nose tip, 33=left eye, 263=right eye, 234=left ear, 454=right ear
            const meshIndices = { nose: 1, left_eye: 33, right_eye: 263, left_ear: 234, right_ear: 454 };
            const faceKeypoints = Object.entries(meshIndices).map(([name, idx]) => {
                const point = face.scaledMesh[idx];
                return point ? {
                    name,
                    x: point[0],
                    y: point[1],
                    z: point[2],
                    score: face.faceInViewConfidence || 1.0,
                    index: idx
                } : null;
            }).filter(Boolean);
            return {
                personId: personIndex,
                faceKeypoints,
                boundingBox: face.boundingBox,
                id: personIndex
            };
        });
        console.log('Face data:', faceDataArray);
        return faceDataArray;
    } catch (error) {
        console.error('Error detecting faces:', error);
        return [];
    }
}

function getFaceKeypointName(index) {
    const names = {
        0: 'nose',
        1: 'left_eye',
        2: 'right_eye', 
        3: 'left_ear',
        4: 'right_ear'
    };
    return names[index] || `point_${index}`;
}

let canvas, ctx;

function setupCanvas() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    
    // Wait for video to be ready
    const updateCanvasSize = () => {
        if (videoElement.videoWidth && videoElement.videoHeight) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            canvas.style.width = videoElement.offsetWidth + 'px';
            canvas.style.height = videoElement.offsetHeight + 'px';
        } else {
            canvas.width = 640;
            canvas.height = 480;
        }
    };
    
    updateCanvasSize();
    canvas.style.position = 'absolute';
    canvas.style.top = videoElement.offsetTop + 'px';
    canvas.style.left = videoElement.offsetLeft + 'px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    document.body.appendChild(canvas);
    
    // Update canvas size when video loads
    videoElement.addEventListener('loadedmetadata', updateCanvasSize);
    console.log('Canvas setup complete');
}

function drawKeypoints(faceDataArray) {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw different colors for different people
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
    
    faceDataArray.forEach((faceData, personIndex) => {
        const color = colors[personIndex % colors.length];
        const { faceKeypoints, boundingBox, id } = faceData;
        
        // Draw bounding box if available
        if (boundingBox) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(boundingBox.xMin, boundingBox.yMin, 
                          boundingBox.width, boundingBox.height);
        }
        
        // Draw face connections
        drawFaceConnections(faceKeypoints, color);
        
        // Draw face keypoints
        faceKeypoints.forEach((point) => {
            if (point.x && point.y && point.score > 0.3) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Add keypoint name as text
                ctx.fillStyle = 'white';
                ctx.font = 'bold 12px Arial';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.strokeText(point.name, point.x + 10, point.y - 10);
                ctx.fillText(point.name, point.x + 10, point.y - 10);
                
                // Add confidence score
                ctx.font = '10px Arial';
                const scoreText = `${(point.score * 100).toFixed(0)}%`;
                ctx.strokeText(scoreText, point.x + 10, point.y + 5);
                ctx.fillText(scoreText, point.x + 10, point.y + 5);
            }
        });
        
        // Draw person label with detailed info
        const labelY = boundingBox ? boundingBox.yMin - 10 : (faceKeypoints[0]?.y || 50) - 40;
        const labelX = boundingBox ? boundingBox.xMin : (faceKeypoints[0]?.x || 50) - 50;
        
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        const label = `Person ${personIndex + 1} (ID: ${id})`;
        ctx.strokeText(label, labelX, labelY);
        ctx.fillText(label, labelX, labelY);
        
        // Show face keypoint count
        ctx.font = '12px Arial';
        const countText = `Face points: ${faceKeypoints.length}`;
        ctx.strokeText(countText, labelX, labelY + 20);
        ctx.fillText(countText, labelX, labelY + 20);
    });
    
    // Draw comprehensive data info
    drawDataSummary(faceDataArray);
}

function drawFaceConnections(faceKeypoints, color) {
    // Define face connections
    const connections = [
        ['left_eye', 'nose'],
        ['right_eye', 'nose'],
        ['left_eye', 'left_ear'],
        ['right_eye', 'right_ear']
    ];
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    connections.forEach(([startName, endName]) => {
        const startPoint = faceKeypoints.find(p => p.name === startName);
        const endPoint = faceKeypoints.find(p => p.name === endName);
        
        if (startPoint && endPoint && 
            startPoint.score > 0.3 && endPoint.score > 0.3) {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
        }
    });
}

function drawDataSummary(faceDataArray) {
    // Create data summary panel
    const panelX = 10;
    const panelY = 10;
    const panelWidth = 300;
    const panelHeight = 200;
    
    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Draw summary text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    let textY = panelY + 25;
    
    ctx.fillText(`FACE TRACKING DATA`, panelX + 10, textY);
    textY += 25;
    
    ctx.font = '14px Arial';
    ctx.fillText(`People detected: ${faceDataArray.length}`, panelX + 10, textY);
    textY += 20;
    
    const totalFacePoints = faceDataArray.reduce((sum, data) => sum + data.faceKeypoints.length, 0);
    ctx.fillText(`Total face points: ${totalFacePoints}`, panelX + 10, textY);
    textY += 25;
    
    // Show details for each person
    faceDataArray.forEach((faceData, index) => {
        if (textY > panelY + panelHeight - 20) return; // Don't overflow panel
        
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`Person ${index + 1}:`, panelX + 10, textY);
        textY += 15;
        
        ctx.font = '11px Arial';
        const avgConfidence = faceData.faceKeypoints.length > 0 
            ? (faceData.faceKeypoints.reduce((sum, p) => sum + p.score, 0) / faceData.faceKeypoints.length * 100).toFixed(1)
            : 0;
        ctx.fillText(`  Points: ${faceData.faceKeypoints.length}, Avg confidence: ${avgConfidence}%`, panelX + 20, textY);
        textY += 15;
    });
}

async function main() {
    try {
        console.log('Starting application...');
        await setupCamera();
        // Wait a bit for video to fully load
        await new Promise(resolve => setTimeout(resolve, 1000));
        setupCanvas();
        const model = await loadFaceLandmarkModel();
        console.log('Starting face detection loop...');
        setInterval(async () => {
            const faceDataArray = await detectFaces(model);
            if (faceDataArray.length > 0) {
                console.log('Detected faces:', faceDataArray.length);
                faceDataArray.forEach((faceData, index) => {
                    console.log(`Person ${index + 1} face data:`, {
                        id: faceData.id,
                        pointCount: faceData.faceKeypoints.length,
                        keypoints: faceData.faceKeypoints.map(p => ({
                            name: p.name,
                            x: p.x.toFixed(1),
                            y: p.y.toFixed(1),
                            confidence: (p.score * 100).toFixed(1) + '%'
                        }))
                    });
                });
            }
            drawKeypoints(faceDataArray);
            // TODO: Map faceDataArray to MIDI sequencing
        }, 100);
    } catch (error) {
        console.error('Application error:', error);
        document.body.innerHTML += `<div style="color: red; font-size: 18px; margin: 20px;">Error: ${error.message}</div>`;
    }
}

main();
