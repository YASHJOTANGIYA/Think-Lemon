import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as fabric from 'fabric'; // v6 import style
import './DesignTool.css';

const DesignTool = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [fabricCanvas, setFabricCanvas] = useState(null);
    const [selectedObject, setSelectedObject] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Product details passed from the previous page
    const { product, canvasWidth, canvasHeight, templateType } = location.state || {};

    const faceWidth = canvasWidth || product?.width || 800;
    const faceHeight = canvasHeight || product?.height || 500;
    const effectiveProduct = product || { name: 'Custom Design' };

    // Flap dimensions (calculated if envelope)
    const isEnvelope = templateType === 'envelope';
    const flapTop = isEnvelope ? faceHeight * 0.35 : 0;
    const flapBottom = isEnvelope ? faceHeight * 0.15 : 0;
    const flapSide = isEnvelope ? faceWidth * 0.08 : 0; // Left and Right

    const totalWidth = faceWidth + (flapSide * 2);
    const totalHeight = faceHeight + flapTop + flapBottom;

    const faceOriginX = flapSide;
    const faceOriginY = flapTop;

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = new fabric.Canvas(canvasRef.current, {
                width: totalWidth,
                height: totalHeight,
                backgroundColor: '#ffffff',
                preserveObjectStacking: true,
            });

            setFabricCanvas(canvas);

            canvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
            canvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
            canvas.on('selection:cleared', () => setSelectedObject(null));

            // Initial setup
            if (isEnvelope) {
                drawEnvelopeDieCut(canvas);
            }

            // Center the view initially
            // canvas.setViewportTransform([1, 0, 0, 1, 0, 0]); 

            return () => {
                canvas.dispose();
            };
        }
    }, [totalWidth, totalHeight, isEnvelope]);

    const drawEnvelopeDieCut = (canvas) => {
        // Clear existing guides
        const objects = canvas.getObjects();
        objects.forEach(obj => {
            if (obj.id && obj.id.startsWith('die-cut')) {
                canvas.remove(obj);
            }
        });

        const strokeColor = '#ff0000';
        const dashArray = [5, 5];

        // 1. Face Rectangle (Dashed - Fold Lines)
        const faceRect = new fabric.Rect({
            left: faceOriginX,
            top: faceOriginY,
            width: faceWidth,
            height: faceHeight,
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: 1,
            strokeDashArray: dashArray,
            selectable: false,
            evented: false,
            id: 'die-cut-face'
        });
        canvas.add(faceRect);

        // 2. Top Flap (Trapezoid)
        // Points: TopLeft of Face, TopCenter(Peak), TopRight of Face
        // Actually standard envelope flap is curved or trapezoidal. Let's do a simple path.
        const topFlapPath = new fabric.Path(`
            M ${faceOriginX} ${faceOriginY} 
            L ${faceOriginX + (faceWidth * 0.1)} ${0} 
            L ${faceOriginX + (faceWidth * 0.9)} ${0} 
            L ${faceOriginX + faceWidth} ${faceOriginY}
        `, {
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: 2,
            selectable: false,
            evented: false,
            id: 'die-cut-flap-top'
        });
        canvas.add(topFlapPath);

        // 3. Bottom Flap (Trapezoid)
        const bottomFlapPath = new fabric.Path(`
            M ${faceOriginX} ${faceOriginY + faceHeight} 
            L ${faceOriginX + (faceWidth * 0.1)} ${totalHeight} 
            L ${faceOriginX + (faceWidth * 0.9)} ${totalHeight} 
            L ${faceOriginX + faceWidth} ${faceOriginY + faceHeight}
        `, {
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: 2,
            selectable: false,
            evented: false,
            id: 'die-cut-flap-bottom'
        });
        canvas.add(bottomFlapPath);

        // 4. Left Flap
        const leftFlapPath = new fabric.Path(`
            M ${faceOriginX} ${faceOriginY} 
            L ${0} ${faceOriginY + (faceHeight * 0.1)} 
            L ${0} ${faceOriginY + (faceHeight * 0.9)} 
            L ${faceOriginX} ${faceOriginY + faceHeight}
        `, {
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: 2,
            selectable: false,
            evented: false,
            id: 'die-cut-flap-left'
        });
        canvas.add(leftFlapPath);

        // 5. Right Flap
        const rightFlapPath = new fabric.Path(`
            M ${faceOriginX + faceWidth} ${faceOriginY} 
            L ${totalWidth} ${faceOriginY + (faceHeight * 0.1)} 
            L ${totalWidth} ${faceOriginY + (faceHeight * 0.9)} 
            L ${faceOriginX + faceWidth} ${faceOriginY + faceHeight}
        `, {
            fill: 'transparent',
            stroke: strokeColor,
            strokeWidth: 2,
            selectable: false,
            evented: false,
            id: 'die-cut-flap-right'
        });
        canvas.add(rightFlapPath);
    };

    const addText = (type = 'text') => {
        if (!fabricCanvas) return;

        // Center in the FACE area
        const centerX = faceOriginX + (faceWidth / 2);
        const centerY = faceOriginY + (faceHeight / 2);

        let textObj;
        if (type === 'paragraph') {
            textObj = new fabric.Textbox('Add your paragraph text here.\nYou can resize this box.', {
                left: centerX - 100,
                top: centerY,
                width: 200,
                fontSize: 16,
                fontFamily: 'Arial',
                fill: '#333'
            });
        } else {
            textObj = new fabric.IText('Double click to edit', {
                left: centerX - 80,
                top: centerY,
                fontFamily: 'Arial',
                fill: '#333',
                fontSize: 24,
            });
        }

        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && fabricCanvas) {
            const reader = new FileReader();
            reader.onload = (f) => {
                const imgObj = new Image();
                imgObj.src = f.target.result;
                imgObj.onload = () => {
                    const imgInstance = new fabric.Image(imgObj);
                    const scale = Math.min(200 / imgInstance.width, 200 / imgInstance.height);
                    imgInstance.scale(scale);

                    // Center in FACE area
                    imgInstance.set({
                        left: faceOriginX + (faceWidth / 2) - ((imgInstance.width * scale) / 2),
                        top: faceOriginY + (faceHeight / 2) - ((imgInstance.height * scale) / 2)
                    });

                    fabricCanvas.add(imgInstance);
                    fabricCanvas.setActiveObject(imgInstance);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const addShape = () => {
        if (!fabricCanvas) return;
        const rect = new fabric.Rect({
            left: faceOriginX + (faceWidth / 2) - 50,
            top: faceOriginY + (faceHeight / 2) - 50,
            width: 100,
            height: 100,
            fill: '#cccccc'
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
    };

    const addClipart = () => {
        if (!fabricCanvas) return;
        const star = new fabric.IText('⭐', {
            left: faceOriginX + (faceWidth / 2),
            top: faceOriginY + (faceHeight / 2),
            fontSize: 60,
            selectable: true
        });
        fabricCanvas.add(star);
        fabricCanvas.setActiveObject(star);
    };

    const setCanvasBackground = (color) => {
        if (fabricCanvas) {
            fabricCanvas.backgroundColor = color;
            fabricCanvas.requestRenderAll();
        }
    };

    const saveDesign = () => {
        if (fabricCanvas) {
            // Hide guides
            const objects = fabricCanvas.getObjects();
            const guides = objects.filter(obj => obj.id && obj.id.startsWith('die-cut'));
            guides.forEach(g => g.visible = false);
            fabricCanvas.renderAll();

            const dataURL = fabricCanvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 3,
            });

            // Show guides
            guides.forEach(g => g.visible = true);
            fabricCanvas.renderAll();

            const link = document.createElement('a');
            link.download = `design-${effectiveProduct.slug || 'custom'}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Design saved! (Downloaded as PNG)');
        }
    };

    const handleZoom = (direction) => {
        if (!fabricCanvas) return;
        let newZoom = zoomLevel + (direction === 'in' ? 0.1 : -0.1);
        newZoom = Math.max(0.5, Math.min(newZoom, 3)); // Limit zoom
        setZoomLevel(newZoom);

        fabricCanvas.setZoom(newZoom);
        fabricCanvas.requestRenderAll();
    };

    // Helper to delete object
    const deleteSelected = () => {
        if (fabricCanvas && selectedObject) {
            fabricCanvas.remove(selectedObject);
            setSelectedObject(null);
        }
    };

    // Helper to change color
    const changeColor = (color) => {
        if (fabricCanvas && selectedObject) {
            selectedObject.set('fill', color);
            fabricCanvas.requestRenderAll();
        }
    };

    return (
        <div className="design-tool-container">
            {/* Header */}
            <div className="design-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button className="btn-back" onClick={() => navigate(-1)}>←</button>
                    <h2>Envelopes</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-save" onClick={saveDesign}>
                        <span>💾</span> Save design & Proceed
                    </button>
                </div>
            </div>

            <div className="design-workspace">
                {/* Canvas Area (Left) */}
                <div className="canvas-area">
                    <canvas ref={canvasRef} />

                    {/* Floating Zoom Controls */}
                    <div className="zoom-controls">
                        <button className="zoom-btn" onClick={() => handleZoom('in')}>+</button>
                        <button className="zoom-btn" onClick={() => handleZoom('out')}>-</button>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="design-sidebar">
                    <div className="sidebar-section">
                        <h3>Background Color</h3>
                        <div className="color-options">
                            {['#ffffff', '#f8f9fa', '#fff5f5', '#f0f7ff', '#f0fff4', '#fff0f6', '#000000'].map(color => (
                                <div
                                    key={color}
                                    className="color-swatch"
                                    style={{ backgroundColor: color }}
                                    onClick={() => setCanvasBackground(color)}
                                />
                            ))}
                            <button className="full-width-btn" style={{ marginTop: '10px', fontSize: '0.8rem' }}>Pick Color</button>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Add</h3>
                        <div className="tools-grid">
                            <label className="tool-item">
                                <span className="icon">🖼️</span>
                                <span>Upload Image</span>
                                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </label>
                            <div className="tool-item" onClick={() => addText('text')}>
                                <span className="icon">Tt</span>
                                <span>Text</span>
                            </div>
                            <div className="tool-item" onClick={() => addText('paragraph')}>
                                <span className="icon">¶</span>
                                <span>Paragraph</span>
                            </div>
                            <div className="tool-item" onClick={() => alert('Logo placeholder')}>
                                <span className="icon">🤖</span>
                                <span>Logo</span>
                            </div>
                            <div className="tool-item" onClick={addShape}>
                                <span className="icon">⬜</span>
                                <span>Shapes</span>
                            </div>
                            <div className="tool-item" onClick={addClipart}>
                                <span className="icon">🚀</span>
                                <span>Clipart</span>
                            </div>
                            <div className="tool-item" onClick={() => alert('QR Code feature coming soon!')}>
                                <span className="icon">📱</span>
                                <span>QR Code</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <button className="full-width-btn">
                            <span>田</span> Design Templates
                        </button>
                    </div>

                    {selectedObject && (
                        <div className="properties-panel">
                            <h4>Edit Selected</h4>
                            <div className="color-picker">
                                <p style={{ fontSize: '0.8rem', marginBottom: '5px' }}>Fill Color:</p>
                                <div className="color-options">
                                    {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map(color => (
                                        <div
                                            key={color}
                                            className="color-swatch"
                                            style={{ backgroundColor: color }}
                                            onClick={() => changeColor(color)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button className="btn-danger" onClick={deleteSelected}>Delete Object</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignTool;
