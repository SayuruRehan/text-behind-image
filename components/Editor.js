import React, { useEffect, useRef, useState } from 'react';
import ImageUploader from './ImageUploader';
import { saveAs } from 'file-saver';

const Editor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [fabricModule, setFabricModule] = useState(null); // Store fabric module here
  const [textBox, setTextBox] = useState(null);
  const [text, setText] = useState('Your Text Here');
  const [fontSize, setFontSize] = useState(40);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined') {
      import('fabric')
        .then((module) => {
          if (!isMounted) return;

          console.log('fabricModule:', module);

          // Since fabricModule is the fabric object, we can use it directly
          setFabricModule(module);

          const { Canvas } = module;

          if (!Canvas) {
            console.error('fabricModule.Canvas is undefined');
            return;
          }

          const initCanvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            selection: false,
          });

          setCanvas(initCanvas);
        })
        .catch((error) => {
          console.error('Failed to load fabric:', error);
        });
    }

    return () => {
      isMounted = false;
      if (canvas) {
        canvas.dispose();
      }
    };
  }, []);

  const handleImageUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    if (!fabricModule || !canvas) {
      console.error('Fabric module or canvas is not ready.');
      return;
    }

    const { Image, Textbox } = fabricModule;

    const reader = new FileReader();
    reader.onload = function (f) {
      const data = f.target.result;
      Image.fromURL(data, (img) => {
        // Scale image to fit canvas
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let scaleFactor;

        if (canvasAspect >= imgAspect) {
          scaleFactor = canvas.height / img.height;
        } else {
          scaleFactor = canvas.width / img.width;
        }

        img.set({
          selectable: false,
          evented: false,
          scaleX: scaleFactor,
          scaleY: scaleFactor,
        });

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

        // Add text behind the image
        const textbox = new Textbox(text, {
          left: 100,
          top: 100,
          fontSize: fontSize,
          fill: fontColor,
          fontFamily: fontFamily,
          editable: true,
          objectCaching: false,
        });

        canvas.add(textbox);
        canvas.sendToBack(textbox); // Send text behind the image
        setTextBox(textbox);
        canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  // Update text properties
  useEffect(() => {
    if (textBox && canvas) {
      textBox.set({
        text: text,
        fontSize: fontSize,
        fill: fontColor,
        fontFamily: fontFamily,
      });
      canvas.renderAll();
    }
  }, [text, fontSize, fontColor, fontFamily, textBox, canvas]);

  const downloadImage = (format) => {
    if (!canvas) return;

    // Deselect any active object
    canvas.discardActiveObject();
    canvas.renderAll();

    // Adjust quality for JPEG
    const quality = format === 'jpeg' ? 0.95 : 1;

    const dataURL = canvas.toDataURL({
      format: format,
      quality: quality,
    });

    // Convert dataURL to Blob
    fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => {
        saveAs(blob, `edited-image.${format}`);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Image Editor</h1>
      <ImageUploader onUpload={handleImageUpload} />
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <div style={{ marginRight: '20px' }}>
          <label>Text:</label>
          <br />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div style={{ marginRight: '20px' }}>
          <label>Font Size:</label>
          <br />
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
        <div style={{ marginRight: '20px' }}>
          <label>Font Color:</label>
          <br />
          <input
            type="color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
          />
        </div>
        <div style={{ marginRight: '20px' }}>
          <label>Font Family:</label>
          <br />
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            {/* Add more fonts as needed */}
          </select>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => downloadImage('png')}>Download PNG</button>
        <button onClick={() => downloadImage('jpeg')}>Download JPEG</button>
      </div>
    </div>
  );
};

export default Editor;
