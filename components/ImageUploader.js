import React from 'react';

const ImageUploader = ({ onUpload }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUpload(e.target.files[0])}
      />
    </div>
  );
};

export default ImageUploader;
