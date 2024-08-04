window.onload = function() {
    const canvas = document.getElementById('grassCanvas');
    
    // Check if the element exists and is of type HTMLCanvasElement
    if (canvas instanceof HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
    
        // Set canvas dimensions
        const width = canvas.width;
        const height = canvas.height;
    
        // Function to draw a single blade of grass
        function drawGrassBlade(ctx, x, y, length, angle, color) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + length * Math.cos(angle), y - length * Math.sin(angle));
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    
        // Function to generate random grass blades
        function generateGrassTexture(ctx, width, height) {
            ctx.fillStyle = '#4CAF50'; // Base grass color
            ctx.fillRect(0, 0, width, height);
    
            for (let i = 0; i < 1000; i++) { // Adjust number of blades
                const x = Math.random() * width;
                const y = height - Math.random() * (height / 4); // Grass grows from bottom
                const length = Math.random() * 20 + 10; // Random length
                const angle = Math.random() * Math.PI / 6 - Math.PI / 12; // Random angle
                const color = `rgb(${Math.random() * 50 + 50}, ${Math.random() * 150 + 100}, ${Math.random() * 50 + 50})`;
                drawGrassBlade(ctx, x, y, length, angle, color);
            }
        }
    
        // Generate the grass texture
        generateGrassTexture(ctx, width, height);
    } else {
        console.error('Cannot find the canvas element or it is not of type HTMLCanvasElement.');
    }
};
