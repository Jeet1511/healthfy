/**
 * Live Video Feed Component
 * Renders live video stream from camera
 * Supports fullscreen, quality adjustments, and accessibility
 */

import React, { useEffect, useRef, useState } from "react";
import { mediaStreamManager } from "../services/mediaStreamManager";
import "./LiveVideoFeed.css";

function LiveVideoFeed({
  streamId,
  label = "Video Feed",
  onError = null,
  autoplay = true,
}) {
  const videoRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const streamData = mediaStreamManager.getStream(streamId);
    if (!streamData) {
      setHasError(true);
      return;
    }

    // Attach stream to video element
    if (videoRef.current && streamData.stream) {
      videoRef.current.srcObject = streamData.stream;

      // Handle video errors
      videoRef.current.onerror = () => {
        setHasError(true);
        if (onError) {
          onError("Video playback error");
        }
      };

      // Handle play promise
      if (autoplay) {
        videoRef.current
          .play()
          .catch((err) => {
            console.error("Autoplay failed:", err);
          });
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [streamId, autoplay, onError]);

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  /**
   * Take screenshot
   */
  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `screenshot-${Date.now()}.png`;
      link.click();
    }
  };

  if (hasError) {
    return (
      <div className="video-feed-error" role="alert">
        <span className="error-icon">📹</span>
        <p>Unable to display video feed</p>
        <p className="error-detail">Stream ID: {streamId}</p>
      </div>
    );
  }

  return (
    <div
      className="live-video-feed"
      ref={containerRef}
      aria-label={label}
      role="region"
    >
      <div className="video-header">
        <h3>{label}</h3>
        <span className="live-indicator">● LIVE</span>
      </div>

      <video
        ref={videoRef}
        className="video-element"
        autoPlay
        playsInline
        muted
        controls={false}
        aria-label="Live video stream"
      />

      <div className="video-controls">
        <button
          onClick={takeScreenshot}
          className="video-btn"
          title="Take screenshot"
          aria-label="Take screenshot"
        >
          📷
        </button>
        <button
          onClick={toggleFullscreen}
          className="video-btn"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? "⛔" : "⛳"}
        </button>
      </div>
    </div>
  );
}

export default LiveVideoFeed;
