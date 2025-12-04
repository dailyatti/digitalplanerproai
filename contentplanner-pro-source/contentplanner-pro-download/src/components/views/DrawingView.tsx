import React, { useState, useRef, useEffect } from 'react';
import { Brush, Save, Trash2, Download, Palette, RotateCcw, Square, Circle, Minus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const DrawingView: React.FC = () => {
  const { drawings, addDrawing, deleteDrawing } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#3B82F6');
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'line'>('pen');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState('');

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#000000', '#6B7280'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingTitle.trim()) return;

    const dataURL = canvas.toDataURL('image/png');
    addDrawing({
      title: drawingTitle,
      data: dataURL,
    });

    setDrawingTitle('');
    setShowSaveDialog(false);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `drawing-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Brush className="text-pink-500" size={32} />
              Digital Drawing Board
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Visual ideas, flowcharts and creative planning
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Save size={16} />
              <span className="hidden md:inline">Save</span>
            </button>
            <button
              onClick={downloadDrawing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Download size={16} />
              <span className="hidden md:inline">Download</span>
            </button>
            <button
              onClick={clearCanvas}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <RotateCcw size={16} />
              <span className="hidden md:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Tools */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tool Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tools
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`p-3 rounded-lg transition-colors duration-200 ${
                    tool === 'pen' ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Brush size={16} />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`p-3 rounded-lg transition-colors duration-200 ${
                    tool === 'eraser' ? 'bg-pink-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Square size={16} />
                </button>
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brush Size: {brushSize}px
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Color Palette */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      brushColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Save Drawing
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Drawing Title
                </label>
                <input
                  type="text"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500"
                  placeholder="Give your drawing a name..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveDrawing}
                  disabled={!drawingTitle.trim()}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setDrawingTitle('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-crosshair w-full h-auto max-w-full touch-none"
              style={{ 
                touchAction: 'none',
                maxHeight: '60vh'
              }}
            />
          </div>
        </div>

        {/* Saved Drawings */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Saved Drawings
            </h3>
            
            {drawings.length === 0 ? (
              <div className="text-center py-8">
                <Brush className="mx-auto text-gray-400 dark:text-gray-500 mb-3" size={32} />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No saved drawings yet
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {drawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {drawing.title}
                      </h4>
                      <button
                        onClick={() => deleteDrawing(drawing.id)}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <img
                      src={drawing.data}
                      alt={drawing.title}
                      className="w-full h-20 object-cover rounded border border-gray-200 dark:border-gray-600 mb-2"
                    />
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(drawing.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingView;