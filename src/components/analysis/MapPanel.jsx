import { useEffect, useRef } from 'react';

export default function MapPanel({ onMapInit }) {
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
                <button className="m-btn" onClick={handleZoomIn}>+</button>
                <button className="m-btn" onClick={handleZoomOut}>-</button>
            </div>
            <div id="map" ref={containerRef} />
        </main>
    );
}
