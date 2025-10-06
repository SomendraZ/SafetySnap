import React, { useState } from "react";
import API from "../services/api";

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    setMessages([]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMessages(["Please select at least one image."]);
      return;
    }

    setLoading(true);
    setMessages([]);
    setUploadedImages([]);
    setProgress(0);

    const uploaded = [];
    const newMessages = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        const res = await API.post("/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Idempotency-Key": `upload-${Date.now()}-${i}`,
          },
        });

        uploaded.push(res.data);
        newMessages.push(`✅ ${files[i].name} uploaded successfully`);
      } catch (err) {
        const errorMsg = err.response?.data?.error?.message || "Upload failed";
        newMessages.push(`❌ ${files[i].name}: ${errorMsg}`);
      }

      setProgress(i + 1);
    }

    setUploadedImages(uploaded);
    setMessages(newMessages);
    setFiles([]);
    setLoading(false);

    setTimeout(() => {
      setUploadedImages([]);
      setMessages([]);
      setProgress(0);
    }, 5000);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-700 text-gray-100">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Upload Images</h1>
        <p className="mb-4 text-gray-300">
          Upload multiple safety images for PPE analysis.
        </p>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={loading}
            className={`border p-2 rounded bg-gray-800 text-gray-100 ${
              loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          />

          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 rounded transition ${
              loading
                ? "bg-gray-700 cursor-not-allowed opacity-50 text-gray-200"
                : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
            }`}
          >
            {loading ? `Uploading ${progress}/${files.length}` : "Upload All"}
          </button>
        </form>

        {files.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 border rounded overflow-hidden bg-gray-800"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <div className="mt-4 space-y-1">
            {messages.map((msg, idx) => (
              <p key={idx} className="text-sm text-gray-300">
                {msg}
              </p>
            ))}
          </div>
        )}

        {uploadedImages.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Uploaded Images:</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((img, idx) => (
                <div
                  key={idx}
                  className="border rounded overflow-hidden shadow bg-gray-800"
                >
                  <img
                    src={img.fileUrl}
                    alt={`uploaded-${idx}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
