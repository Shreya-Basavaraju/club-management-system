import { useState, useEffect } from "react";
import API from "../../api/api";

function EventImagesPanel({ clubId, isAdmin }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      const res = await API.get(`/events/club/${clubId}`);
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  const fetchImages = async (eventId) => {
    try {
      const res = await API.get(`/event-images/${eventId}`);
      setImages(res.data.images || []);
    } catch (err) {
      console.error("Error fetching images:", err);
      setImages([]);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchImages(event._id);
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !selectedEvent) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const token = localStorage.getItem("token");
      await API.post(`/event-images/${selectedEvent._id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      alert("Images uploaded successfully!");
      setSelectedFiles([]);
      setShowUploadModal(false);
      fetchImages(selectedEvent._id);
    } catch (err) {
      console.error("Error uploading images:", err);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this image?")) return;

    try {
      const token = localStorage.getItem("token");
      await API.delete(`/event-images/${selectedEvent._id}/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Image deleted successfully!");
      fetchImages(selectedEvent._id);
      if (images.length === 1) {
        setDeleteMode(false);
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image");
    }
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="dashboard-panel">
      <h2 className="panel-title">Event Images</h2>

      {!selectedEvent ? (
        <div className="events-selection">
          <div className="events-list">
            {events.length === 0 ? (
              <p className="empty-state">No events available</p>
            ) : (
              events.map((event) => (
                <div
                  key={event._id}
                  className="event-item"
                  onClick={() => handleEventSelect(event)}
                  style={{ cursor: "pointer" }}
                >
                  {event.images && event.images[0] && (
                    <img
                      src={
                        event.images[0].startsWith("http")
                          ? event.images[0]
                          : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${event.images[0]}`
                      }
                      alt={event.title}
                      className="event-thumbnail"
                    />
                  )}
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-date">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="images-gallery">
          <div className="gallery-header">
            <button onClick={() => setSelectedEvent(null)} className="btn-back">
              ← Back to Events
            </button>
            <h3>{selectedEvent.title}</h3>
            {isAdmin && (
              <div className="gallery-actions">
                <button onClick={() => setShowUploadModal(true)} className="btn-add-images">
                  + Add Images
                </button>
                {images.length > 0 && (
                  <button 
                    onClick={() => setDeleteMode(!deleteMode)} 
                    className={`btn-delete-mode ${deleteMode ? 'active' : ''}`}
                  >
                    {deleteMode ? "Cancel Delete" : "Delete Images"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="images-grid">
            {images.length === 0 ? (
              <p className="empty-state">No images uploaded yet</p>
            ) : (
              images.map((image) => (
                <div 
                  key={image._id} 
                  className="image-card" 
                  onClick={() => !deleteMode && openImageModal(image)}
                  style={{ cursor: deleteMode ? 'default' : 'pointer' }}
                >
                  <img
                    src={
                      image.path.startsWith("http")
                        ? image.path
                        : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${image.path}`
                    }
                    alt="Event"
                    className="gallery-image"
                  />
                  {isAdmin && deleteMode && (
                    <button
                      onClick={(e) => handleDeleteImage(image._id, e)}
                      className="btn-delete-image-overlay"
                    >
                      🗑️ Delete
                    </button>
                  )}
                  <div className="image-footer">
                    <p className="image-date">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Images</h3>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFiles.length > 0 && (
              <p className="selected-count">{selectedFiles.length} file(s) selected</p>
            )}
            <div className="modal-buttons">
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="btn-submit"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button onClick={() => setShowUploadModal(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image View Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeImageModal} className="close-image-modal">
              ✕
            </button>
            <img
              src={
                selectedImage.path.startsWith("http")
                  ? selectedImage.path
                  : `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${selectedImage.path}`
              }
              alt="Event"
              className="full-image"
            />
            <p className="full-image-date">
              Uploaded on {new Date(selectedImage.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventImagesPanel;
