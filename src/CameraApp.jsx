import { useState, useRef } from 'react';

export default function CameraApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // 啟動相機
  const startCamera = async () => {
    try {
      setErrorMsg('');
      console.log('正在請求相機權限...');
      
      // iOS 需要特別的設置
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('相機流已獲取:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Stream 已設定到 video 元素');
        
        // iOS Safari 需要這些屬性
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata 已加載');
          try {
            await videoRef.current.play();
            console.log('Video 正在播放');
          } catch (err) {
            console.error('播放失敗:', err);
          }
        };
        
        // 強制觸發 loadedmetadata
        if (videoRef.current.readyState >= 2) {
          // 如果已經加載，立即播放
          try {
            await videoRef.current.play();
          } catch (err) {
            console.error('直接播放失敗:', err);
          }
        }
        
        setIsCameraActive(true);
        setIsPreviewMode(false);
        console.log('相機已啟動');
      }
    } catch (err) {
      console.error('相機錯誤:', err);
      setErrorMsg(`無法存取相機: ${err.message}`);
      setIsCameraActive(false);
    }
  };

  // 停止相機
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      setIsPreviewMode(false);
    }
  };

  // 拍照
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    const video = videoRef.current;

    // 設定 canvas 尺寸
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;

    // 繪製視頻幀到 canvas
    context.drawImage(video, 0, 0);

    // 轉換為照片
    const photoUrl = canvasRef.current.toDataURL('image/jpeg');
    setPhotos([...photos, photoUrl]);
    setPreviewPhoto(photoUrl);
    setIsPreviewMode(true);
  };

  // 刪除照片
  const deletePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  // 下載照片
  const downloadPhoto = (photoUrl, index) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `photo-${Date.now()}-${index}.jpg`;
    link.click();
  };

  // 清空所有照片
  const clearAllPhotos = () => {
    if (confirm('確定要刪除所有照片嗎?')) {
      setPhotos([]);
      setPreviewPhoto(null);
      setIsPreviewMode(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📸 PWA 相機應用</h1>
        <p style={styles.subtitle}>使用原生鏡頭拍照</p>
      </header>

      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      <main style={styles.main}>
        {/* 相機預覽區域 */}
        <div style={styles.cameraSection}>
          {isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={styles.video}
              />
              <div style={styles.buttonGroup}>
                <button onClick={takePhoto} style={styles.btnPrimary}>
                  📷 拍照
                </button>
                <button onClick={stopCamera} style={styles.btnSecondary}>
                  關閉相機
                </button>
              </div>
            </>
          ) : isPreviewMode && previewPhoto ? (
            <>
              <img src={previewPhoto} alt="Preview" style={styles.preview} />
              <div style={styles.buttonGroup}>
                <button onClick={startCamera} style={styles.btnSecondary}>
                  重新拍照
                </button>
                <button
                  onClick={() => setIsPreviewMode(false)}
                  style={styles.btnSecondary}
                >
                  返回相機
                </button>
              </div>
            </>
          ) : (
            <div style={styles.noCamera}>
              <p style={{ fontSize: '48px', margin: '0' }}>📷</p>
              <p>按下方按鈕啟動相機開始拍照</p>
              <button onClick={startCamera} style={styles.btnPrimary}>
                🎥 開啟相機
              </button>
            </div>
          )}
        </div>

        {/* 照片庫 */}
        <div style={styles.gallerySection}>
          <div style={styles.galleryHeader}>
            <h2>📚 照片庫 ({photos.length})</h2>
            {photos.length > 0 && (
              <button onClick={clearAllPhotos} style={styles.btnDanger}>
                🗑️ 全部刪除
              </button>
            )}
          </div>

          {photos.length === 0 ? (
            <p style={styles.emptyMsg}>還沒有拍照，開始拍照吧！</p>
          ) : (
            <div style={styles.gallery}>
              {photos.map((photo, index) => (
                <div key={index} style={styles.photoCard}>
                  <img src={photo} alt={`Photo ${index + 1}`} style={styles.galleryImage} />
                  <div style={styles.photoActions}>
                    <button
                      onClick={() => downloadPhoto(photo, index)}
                      style={styles.btnSmall}
                      title="下載"
                    >
                      ⬇️
                    </button>
                    <button
                      onClick={() => deletePhoto(index)}
                      style={styles.btnSmallDanger}
                      title="刪除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 隱藏的 Canvas - 用於拍照 */}
      <canvas ref={canvasRef} style={styles.hidden} />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    paddingBottom: '20px',
  },
  header: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  subtitle: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    opacity: 0.9,
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  cameraSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
    minHeight: '300px',
    borderRadius: '8px',
    marginBottom: '16px',
    backgroundColor: '#000',
    display: 'block',
    objectFit: 'cover',
    WebkitTransform: 'scaleX(-1)',
    transform: 'scaleX(-1)',
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  preview: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  noCamera: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  btnSecondary: {
    backgroundColor: '#95a5a6',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  btnDanger: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  btnSmall: {
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  btnSmallDanger: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  gallerySection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  galleryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '16px',
  },
  photoCard: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    aspectRatio: '1',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    gap: '8px',
    padding: '8px',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
  },
  error: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    padding: '12px 20px',
    margin: '20px',
    borderRadius: '6px',
    textAlign: 'center',
  },
  hidden: {
    display: 'none',
  },
};