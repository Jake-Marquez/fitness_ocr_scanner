import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

interface WebCameraProps {
  onCapture: (imageDataUrl: string) => void;
  onError: (error: string) => void;
}

export const WebCamera: React.FC<WebCameraProps> = ({ onCapture, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 3840, min: 1280 },
          height: { ideal: 2160, min: 720 }
        }
      });

      console.log('Camera access granted, stream:', mediaStream);
      setStream(mediaStream);
      setHasPermission(true);

      // Wait a bit for the ref to be ready
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Setting video srcObject');
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        } else {
          console.error('Video ref is null');
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
      onError('Failed to access camera. Please check permissions.');
    }
  };

  const takePicture = () => {
    console.log('takePicture called');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error('Video not ready yet');
        onError('Camera not ready. Please wait a moment and try again.');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        console.log('Image captured, data URL length:', imageDataUrl.length);
        console.log('Canvas resolution:', canvas.width, 'x', canvas.height);
        console.log('JPEG quality: 0.95');
        onCapture(imageDataUrl);
      }
    } else {
      console.error('Video or canvas ref is null');
      onError('Camera not ready. Please try again.');
    }
  };

  const retryCamera = () => {
    setHasPermission(null);
    startCamera();
  };

  if (hasPermission === false) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Text variant="titleMedium" style={styles.errorText}>
            Camera access denied
          </Text>
          <Text variant="bodyMedium" style={styles.errorSubtext}>
            Please enable camera permissions in your browser settings
          </Text>
          <Button mode="contained" onPress={retryCamera} style={styles.retryButton}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: '80%',
            height: '60%',
            border: '2px solid white',
            borderRadius: '8px',
          }} />
        </div>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        textAlign: 'center',
      }}>
        <Text variant="bodyMedium" style={styles.instructionText}>
          Position the nutrition label within the frame
        </Text>
        <Button
          mode="contained"
          onPress={takePicture}
          style={styles.captureButton}
          icon="camera"
        >
          Capture
        </Button>
      </div>
    </div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  guidebox: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  captureButton: {
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
});
