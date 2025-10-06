import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ImageCard({ image, onDelete }) {
  const imgRef = useRef(null);
  const navigate = useNavigate();
  const [aspectRatio, setAspectRatio] = useState(1);
  const [deleting, setDeleting] = useState(false);

  // Update aspect ratio
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setAspectRatio(imgRef.current.naturalWidth / imgRef.current.naturalHeight);
    }
  }, [image.fileUrl]);

  const handleLoad = () => {
    if (imgRef.current) {
      setAspectRatio(imgRef.current.naturalWidth / imgRef.current.naturalHeight);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // prevent triggering card click
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await API.delete(`/images/${image._id}`);
      if (onDelete) onDelete(image._id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete image.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/images/${image._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative rounded-lg shadow-lg overflow-hidden w-full max-w-sm bg-gray-800 flex justify-center items-center border-black border-2 cursor-pointer hover:shadow-2xl transition-shadow duration-200"
    >
      {/* Image container */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: aspectRatio,
          maxHeight: "300px",
          maxWidth: "300px",
          overflow: "hidden",
        }}
      >
        <img
          ref={imgRef}
          src={image.fileUrl}
          alt="uploaded"
          className="w-full h-full object-contain bg-gray-800"
          onLoad={handleLoad}
        />

        {/* Overlay bounding boxes */}
        {image.detections.map((det, index) => {
          if (!det.bbox || det.bbox.length !== 4) return null;
          const [x, y, width, height] = det.bbox;

          return (
            <div
              key={index}
              className="absolute border-2 border-red-500 pointer-events-none"
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
            >
              <span className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1">
                {det.label} {(det.confidence * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
