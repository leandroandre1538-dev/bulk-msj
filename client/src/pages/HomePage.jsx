import React, { useEffect } from 'react';

function HiddenIframe() {
    useEffect(() => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.overflow = 'auto';
        iframe.src = 'https://ventabot.com/';
        iframe.scrolling = 'auto';
        document.getElementById('iframe-container').appendChild(iframe);

        // Cleanup the iframe when the component unmounts
        return () => {
            const container = document.getElementById('iframe-container');
            if (container && container.contains(iframe)) {
                container.removeChild(iframe);
            }
        };
    }, []);

    return (
        <div id="iframe-container" style={{
            position: 'relative',
            width: '100%',
            height: '100vh', // Asegura que el contenedor tenga la altura completa del viewport
            overflow: 'hidden'
        }}>
            {/* El iframe se inyectará en este contenedor */}
        </div>
    );
}

function HomePage() {
    return (
        <div className="relative w-full h-full">
            <HiddenIframe />
        </div>
    );
}

export default HomePage;