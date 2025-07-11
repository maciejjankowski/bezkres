import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Set backend to WebGL for better performance
await tf.setBackend('webgl');

const videoElement = document.getElementById('camera-feed');

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            } 
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

async function loadPoseDetectionModel() {
    try {
        console.log('Loading local pose detection model...');
        
        // Use MoveNet for better performance
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = { 
            modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
            enableTracking: true,
            trackerType: poseDetection.TrackerType.BoundingBox,
            maxPoses: 6, // Limit for better performance
            scoreThreshold: 0.3,
            nmsRadius: 20
        };
        
        const detector = await poseDetection.createDetector(model, detectorConfig);
        console.log('Local multi-person model loaded successfully');
        return detector;
    } catch (error) {
        console.error('Error loading model:', error);
        throw error;
    }
}

async function detectPoses(detector) {
    try {
        if (!videoElement.videoWidth || !videoElement.videoHeight) {
            return [];
        }
        
        const poses = await detector.estimatePoses(videoElement, {
            maxPoses: 6,
            flipHorizontal: false
        });
        
        if (!poses || poses.length === 0) {
            return [];
        }
        
        // Extract only face keypoints (indices 0-4 in COCO format)
        // 0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear
        const faceKeypointIndices = [0, 1, 2, 3, 4];
        
        const faceDataArray = poses.map((pose, personIndex) => {
            const faceKeypoints = faceKeypointIndices.map(index => {
                const point = pose.keypoints[index];
                return point ? {
                    name: getFaceKeypointName(index),
                    x: point.x,
                    y: point.y,
                    score: point.score,
                    index: index
                } : null;
            }).filter(point => point && point.score > 0.3);
            
            return {
                personId: personIndex,
                faceKeypoints: faceKeypoints,
                boundingBox: pose.box,
                id: pose.id || personIndex,
                confidence: pose.score || 0
            };
        });
        
        return faceDataArray;
    } catch (error) {
        console.error('Error detecting poses:', error);
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
    
    // Optimize canvas for better performance
    ctx.imageSmoothingEnabled = false;
    
    const updateCanvasSize = () => {
        if (videoElement.videoWidth && videoElement.videoHeight) {
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            canvas.style.width = videoElement.offsetWidth + 'px';
            canvas.style.height = videoElement.offsetHeight + 'px';
        } else {
            canvas.width = 1280;
            canvas.height = 720;
        }
    };
    
    updateCanvasSize();
    canvas.style.position = 'absolute';
    canvas.style.top = videoElement.offsetTop + 'px';
    canvas.style.left = videoElement.offsetLeft + 'px';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';
    document.body.appendChild(canvas);
    
    videoElement.addEventListener('loadedmetadata', updateCanvasSize);
    console.log('Canvas setup complete');
}

function drawKeypoints(faceDataArray) {
    if (!canvas || !ctx) return;
    
    // Clear with better performance
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const colors = ['#FF0000', '#0066FF', '#00FF00', '#FFD700', '#FF00FF', '#00FFFF', '#FFA500', '#FF69B4'];
    
    faceDataArray.forEach((faceData, personIndex) => {
        const color = colors[personIndex % colors.length];
        const { faceKeypoints, boundingBox, id, confidence } = faceData;
        
        // Draw bounding box with performance optimization
        if (boundingBox) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(boundingBox.xMin, boundingBox.yMin, 
                          boundingBox.width, boundingBox.height);
        }
        
        // Draw face connections
        drawFaceConnections(faceKeypoints, color);
        
        // Draw face keypoints with optimized rendering
        faceKeypoints.forEach((point) => {
            if (point.x && point.y && point.score > 0.3) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Optimized text rendering
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px Arial';
                ctx.fillText(point.name, point.x + 8, point.y - 8);
                ctx.fillText(`${(point.score * 100).toFixed(0)}%`, point.x + 8, point.y + 3);
            }
        });
        
        // Draw person label
        const labelY = boundingBox ? boundingBox.yMin - 10 : (faceKeypoints[0]?.y || 50) - 30;
        const labelX = boundingBox ? boundingBox.xMin : (faceKeypoints[0]?.x || 50) - 40;
        
        ctx.fillStyle = color;
        ctx.font = 'bold 14px Arial';
        const label = `Person ${personIndex + 1} (${(confidence * 100).toFixed(0)}%)`;
        ctx.fillText(label, labelX, labelY);
    });
    
    drawDataSummary(faceDataArray);
}

function drawFaceConnections(faceKeypoints, color) {
    const connections = [
        ['left_eye', 'nose'],
        ['right_eye', 'nose'],
        ['left_eye', 'left_ear'],
        ['right_eye', 'right_ear']
    ];
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
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
    const panelX = 10;
    const panelY = 10;
    const panelWidth = 280;
    const panelHeight = Math.min(180, 80 + faceDataArray.length * 30);
    
    // Optimized panel rendering
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    let textY = panelY + 20;
    
    ctx.fillText('FACE TRACKING (LOCAL MODEL)', panelX + 5, textY);
    textY += 20;
    
    ctx.font = '12px Arial';
    ctx.fillText(`People: ${faceDataArray.length}`, panelX + 5, textY);
    
    const totalPoints = faceDataArray.reduce((sum, data) => sum + data.faceKeypoints.length, 0);
    ctx.fillText(`Points: ${totalPoints}`, panelX + 120, textY);
    textY += 20;
    
    // Performance info
    const fps = Math.round(1000 / 100); // Approximate based on 100ms interval
    ctx.fillText(`FPS: ~${fps}`, panelX + 5, textY);
    textY += 20;
    
    // Person details
    faceDataArray.forEach((faceData, index) => {
        if (textY > panelY + panelHeight - 15) return;
        
        const avgConf = faceData.faceKeypoints.length > 0 
            ? (faceData.faceKeypoints.reduce((sum, p) => sum + p.score, 0) / faceData.faceKeypoints.length * 100).toFixed(0)
            : 0;
        ctx.fillText(`P${index + 1}: ${faceData.faceKeypoints.length}pts (${avgConf}%)`, panelX + 5, textY);
        textY += 15;
    });
}

// Performance monitoring
let frameCount = 0;
let lastTime = Date.now();

function logPerformance() {
    frameCount++;
    const now = Date.now();
    if (now - lastTime > 5000) { // Log every 5 seconds
        const fps = frameCount / 5;
        console.log(`Performance: ${fps.toFixed(1)} FPS`);
        frameCount = 0;
        lastTime = now;
    }
}

async function main() {
    try {
        console.log('Starting high-performance face tracking application...');
        
        // Warm up TensorFlow backend
        await tf.ready();
        console.log('TensorFlow backend ready:', tf.getBackend());
        
        await setupCamera();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setupCanvas();
        const detector = await loadPoseDetectionModel();
        
        console.log('Starting optimized detection loop...');
        
        // Use requestAnimationFrame for better performance
        const detectLoop = async () => {
            const faceDataArray = await detectPoses(detector);
            
            if (faceDataArray.length > 0) {
                // Log detailed face data for MIDI mapping (less frequently)
                if (frameCount % 30 === 0) { // Every 3 seconds at 10 FPS
                    console.log('Face tracking data for MIDI:', 
                        faceDataArray.map((faceData, index) => ({
                            personId: index + 1,
                            id: faceData.id,
                            pointCount: faceData.faceKeypoints.length,
                            confidence: (faceData.confidence * 100).toFixed(1) + '%',
                            keypoints: faceData.faceKeypoints.map(p => ({
                                name: p.name,
                                x: Math.round(p.x),
                                y: Math.round(p.y),
                                normalized_x: (p.x / canvas.width).toFixed(3),
                                normalized_y: (p.y / canvas.height).toFixed(3),
                                confidence: (p.score * 100).toFixed(0) + '%'
                            }))
                        }))
                    );
                }
            }
            
            drawKeypoints(faceDataArray);
            logPerformance();
            
            // Use setTimeout for consistent timing
            setTimeout(detectLoop, 100); // 10 FPS for good performance
        };
        
        detectLoop();
        
    } catch (error) {
        console.error('Application error:', error);
        document.body.innerHTML += `<div style="color: red; font-size: 18px; margin: 20px;">Error: ${error.message}</div>`;
    }
}

main();
