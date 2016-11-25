window.onload = function() {
    var c,
        ctx,
        canvasSize,
        circles = [],
        radius,
        fill_circle = true,
        background_color,
        circle_color,
        fill_color;


    var init = function() {
        c = document.getElementById("canvas");
        ctx = c.getContext('2d');
        setCanvasSize(1000);
        background_color = {r: 50, g: 10, b: 0};
        circle_color = {r: 0, g: 100, b: 150};
        fill_color = {r: 0, g: 0, b: 0};

        radius = canvasSize/10;

        draw();
    };

    var setCanvasSize = function(size) {
        canvasSize = size;
        c.width = canvasSize;
        c.height = canvasSize;
    };

    var draw = function() {
        // Reset canvas to blank
        ctx.fillStyle=rgbObjectToHex(background_color);
        ctx.fillRect(0,0, c.width, c.height);
        // Draw the randomly placed circles
        drawNCircles(40);
        // Fill in color pattern
        fillCheckered();
    };

    var drawNCircles = function(num_circles) {
        var x, y, arc_end = 2*Math.PI;
        circles = [];
        // var min = 0, max = c.width;
        var min = radius, max = canvasSize - radius;
        for (var i = 0; i < num_circles; i++) {
            x = Math.floor(Math.random() * (max - min) + min);
            y = Math.floor(Math.random() * (max - min) + min);
            circles.push({x: x, y: y});

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, arc_end);

            if (fill_circle) {
                ctx.fillStyle = rgbObjectToHex(circle_color);
                ctx.fill();
            } else {
                ctx.lineWidth = 2;
                ctx.strokeStyle = rgbObjectToHex(circle_color);
                ctx.stroke();
            }
        }
    };

    var fillCheckered = function() {
        var image_data = ctx.getImageData(0, 0, c.width, c.height);
        var data = image_data.data;

        // enumerate over pixel colors
        for (var i = 0; i < data.length; i+=4) {

            // Get the x, y of current data point
            var x = (i/4) % canvasSize;
            var y = Math.floor((i/4) / canvasSize);

            // Compare the x,y to all circles
            var count = 0;
            for (var j = 0; j < circles.length; j++) {
                var x_dif = Math.abs(circles[j].x - x);
                var y_dif = Math.abs(circles[j].y - y);
                // Check if the point is inside the circle
                if ((x_dif <= radius) || (y_dif <= radius)) {
                    distance = Math.sqrt(x_dif*x_dif + y_dif*y_dif);
                    if (distance < radius) {
                        count++;
                    }
                }
            }

            // If the point is in an even number of circles
            // change the color to fill color
            // if (count % 2 === 0) {
            if ((count > 0) && (count % 2 === 0)) {
                data[i]   = fill_color.r;
                data[i+1] = fill_color.g;
                data[i+2] = fill_color.b;
            }
        }

        // Draw new pixel data to canvas≈
        ctx.putImageData(image_data, 0, 0);
    };

    var brokenFillCheckered = function() {
        var fill = false, r, g, b;

        var image_data = ctx.getImageData(0, 0, c.width, c.height);
        var data = image_data.data;
        for (var i = 0; i < data.length; i+=4) {
            if ((i / 4) % c.width === 0) {
                fill = false;
            }

            r = data[i];
            g = data[i+1];
            b = data[i+2];

            if ((r != background_color.r) &&
                (g != background_color.g) &&
                (b != background_color.b)) {
                fill = !fill;
            }

            if (fill) {
                data[i]   = fill_color.r;
                data[i+1] = fill_color.g;
                data[i+2] = fill_color.b;
            }
        }

        ctx.putImageData(image_data, 0, 0);
    };

    $('#draw').click(function() {
        draw();
    });

    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function rgbObjectToHex(rgb_object) {
        return rgbToHex(rgb_object.r, rgb_object.g, rgb_object.b);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    var gcd = function(a, b) {
        return !b ? a : gcd(b, a % b);
    };

    // Based on the total number of steps and current step,
    // get the intermediate gradient color
    var get_color_from_gradient = function(colors, progress, hex) {
        var color_one_prog, color_two_prog;
        if (progress <= 0.5) {
            color_one_prog = 1 - 2 * progress;
            color_two_prog = 2 * progress;
        } else {
            color_one_prog = 2 * progress - 1;
            color_two_prog = 2 - 2 * progress;
        }

        r = Math.floor((colors[0].r * color_one_prog + colors[1].r * color_two_prog) / 2);
        g = Math.floor((colors[0].g * color_one_prog + colors[1].g * color_two_prog) / 2);
        b = Math.floor((colors[0].b * color_one_prog + colors[1].b * color_two_prog) / 2);

        return hex ? rgbToHex(r, g, b) : {r: r, g: g, b: b};
    };

    init();
};