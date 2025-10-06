import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import ImageCard from "../components/ImageCard";

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchImage = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/images/${id}`);
      setImage(res.data);
    } catch (err) {
      console.error(err);
      alert("Image not found");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      await API.delete(`/images/${id}`);
      alert("Deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  if (loading) return <p className="p-4 text-gray-300">Loading...</p>;
  if (!image) return null;

  return (
    <div className="p-6 bg-gray-700 min-h-screen text-gray-100 shadow-lg">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Image Result</h1>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-colors"
          >
            Delete
          </button>
        </div>

        <ImageCard image={image} />

        <div className="mt-6 space-y-3">
          <p>
            <strong>Uploaded At:</strong>{" "}
            <span className="text-gray-300">
              {new Date(image.uploadedAt).toLocaleString()}
            </span>
          </p>

          <div>
            <strong>Detections:</strong>
            {image.detections.length === 0 ? (
              <p className="text-gray-400">No detections found.</p>
            ) : (
              <ul className="list-disc pl-5">
                {image.detections.map((det, idx) => (
                  <li key={idx}>
                    {det.label} - {(det.confidence * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
