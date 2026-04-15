import { useEffect, useRef } from "react";

export default function MapPanel({ onMapInit, selectedData, onChatbotClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (containerRef.current && !mapRef.current) {
        const mapInstance = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(37.553, 126.918),
          level: 6,
        });
        mapRef.current = mapInstance;
        onMapInit(mapInstance);
      }
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
    }
  }, [onMapInit]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.setLevel(mapRef.current.getLevel() - 1);
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.setLevel(mapRef.current.getLevel() + 1);
  };

  return (
    <main className="map-panel">
      <div className="map-controls">
        <button className="m-btn" onClick={handleZoomIn}>
          +
        </button>
        <button className="m-btn" onClick={handleZoomOut}>
          -
        </button>
      </div>
      <div id="map" ref={containerRef} />

      <div
        className={`chatbot-widget${selectedData ? " chatbot-widget--active" : ""}`}
        onClick={onChatbotClick}
        title={
          selectedData
            ? "대출 정보 챗봇으로 이동"
            : "상권을 선택하면 맞춤 대출 정보를 확인할 수 있어요"
        }
      >
        <div className="chatbot-bubble">필요한 대출 정보를 확인해보세요!</div>
        <img
          src="/image.png"
          alt="입지너구리 챗봇"
          className="chatbot-mascot-img"
        />
      </div>
    </main>
  );
}
