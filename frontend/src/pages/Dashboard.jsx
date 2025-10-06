import { useEffect, useState } from "react";
import API from "../services/api";
import ImageCard from "../components/ImageCard";

export default function Dashboard() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState(null);

  const limit = 9;

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await API.get("/images", { params: { limit, offset } });
      setImages(res.data.items || []);
      setNextOffset(res.data.next_offset);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [offset]);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/images/${id}`);
      setImages(images.filter((img) => img._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete image");
    }
  };

  const handlePrev = () => {
    if (offset > 0) setOffset(offset - limit);
  };

  const handleNext = () => {
    if (nextOffset !== null) setOffset(nextOffset);
  };

  if (loading)
    return (
      <p className="p-4  bg-gray-700 min-h-screen text-gray-100">Loading...</p>
    );
  if (images.length === 0)
    return (
      <p className="p-4  bg-gray-700 min-h-screen text-gray-100">
        No images uploaded yet.
      </p>
    );

  return (
    <div className="p-4 bg-gray-700 min-h-screen text-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-white">Image Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <ImageCard key={img._id} image={img} onDelete={handleDelete} />
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={offset === 0}
          className={`px-4 py-2 rounded transition border-2 border-black ${
            offset === 0
              ? "bg-gray-400 text-black cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-600 cursor-pointer"
          }`}
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          disabled={nextOffset === null}
          className={`px-4 py-2 rounded transition border-2 border-black ${
            nextOffset === null
              ? "bg-gray-400 text-black cursor-not-allowed"
              : "bg-gray-800 text-white hover:bg-gray-600 cursor-pointer"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
