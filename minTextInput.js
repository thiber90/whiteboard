(function () {

    const extraWidth = 10;
    const buttonRadius = 6;
    // initialize the Canvas Input
    var MinTextInput = window.MinTextInput = function (o) {
        this.canvas = o.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.x = o.x;
        this.y = o.y;
        this.font = o.font;
        this.onsubmit = o.onsubmit;
        this.text = '';

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);

        this.canvas.addEventListener('mousedown', this.handleMouseDown);

        // create the hidden input element
        this.hiddenInput = document.createElement('input');
        this.hiddenInput.type = 'text';
        this.hiddenInput.style.position = 'absolute';
        this.hiddenInput.style.opacity = 0;
        this.hiddenInput.style.pointerEvents = 'none';
        this.hiddenInput.style.zIndex = 0;

        this.hiddenInput.addEventListener('input', this.handleKeydown);
        document.body.appendChild(this.hiddenInput);


        // Force focus on the hidden input element
        setTimeout(() => {
            this.hiddenInput.focus();
        }, 0);
    };

    // setup the prototype
    MinTextInput.prototype = {
        handleMouseDown: function (event) {
            // Handle mouse down event
            const { offsetX, offsetY } = event;

            // si sur bouton : supprimer hidden text et appeler onsubmit
            if (this.isClickInButton({ x: offsetX, y: offsetY })) {
                this.onsubmit(this);
                this.disable();
            } else {
                // Force focus on the hidden input element when the canvas is clicked
                setTimeout(() => {
                    this.hiddenInput.focus();
                }, 0);
            }
        },

        handleKeydown: function (event) {
            // update the canvas input state information from the hidden input
            this.text = this.hiddenInput.value;
        },


        getDimensions: function () {
            // Create a temporary span element
            const span = document.createElement('span');
            span.style.font = this.font;
            span.style.position = 'absolute';
            span.style.whiteSpace = 'nowrap';
            span.style.visibility = 'hidden';
            span.textContent = this.text;

            // Append the span to the body
            document.body.appendChild(span);

            // Get the dimensions of the text
            const rect = span.getBoundingClientRect();
            let width = rect.width;
            let height = rect.height;

            if (height === 0) {
                height = 18;
            }

            // Remove the span from the body
            document.body.removeChild(span);

            return { width: width + 10, height: height };
        },

        getPointsForRectShape: function () {
            let dimensions = this.getDimensions();
            return [
                { x: this.x, y: this.y },
                { x: this.x + dimensions.width + extraWidth, y: this.y },
                { x: this.x + dimensions.width + extraWidth, y: this.y - dimensions.height },
                { x: this.x, y: this.y - dimensions.height }
            ];
        },

        draw: function () {
            let dimensions = this.getDimensions();

            this.drawRectSelection();
            this.drawText();
            this.drawButton();
            this.drawLine({x: this.x + dimensions.width+extraWidth, y: this.y}, {x: this.x+ dimensions.width+extraWidth, y: this.y-buttonRadius/2});
            this.drawLine({x: this.x+ dimensions.width+extraWidth, y: this.y}, {x: this.x+ dimensions.width-buttonRadius/2+extraWidth, y: this.y});
            this.drawLine({x: this.x+ dimensions.width+extraWidth, y: this.y}, {x: this.x+ dimensions.width+extraWidth, y: this.y+buttonRadius/2});
            this.drawLine({x: this.x+ dimensions.width+extraWidth, y: this.y}, {x: this.x+ dimensions.width+buttonRadius/2+extraWidth, y: this.y});

        },

        drawRectSelection: function () {
            let points = this.getPointsForRectShape();
            this.ctx.save(); // Save the current context state
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
            this.ctx.closePath();

            this.ctx.globalAlpha = 0.3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'rgba(0, 0, 0)';
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgb(102, 153, 255)';
            this.ctx.fill();

            this.ctx.restore();
        },

        drawText: function () {
            // Function to draw text on the canvas
            this.ctx.save(); // Save the current context state
            this.ctx.font = this.font; // Set the font
            this.ctx.fillStyle = 'rgba(0, 0, 0)'; // Set the fill color
            this.ctx.textAlign = 'start'; // Set the text alignment
            this.ctx.fillText(this.text, this.x, this.y); // Draw the text
            this.ctx.restore(); // Restore the context to its original state
        },

        drawButton: function () {
            let points = this.getPointsForRectShape();
            this.ctx.save(); // Save the current context state
            this.ctx.beginPath();
            this.ctx.arc(points[1].x, points[1].y, buttonRadius, 0, 2 * Math.PI); // Draw the circle
            this.ctx.fillStyle = 'rgb(0, 153, 0)';
            // Set the fill color

            this.ctx.lineWidth = 2; // Set the border width
            this.ctx.strokeStyle = 'rgba(0, 0, 0)';
            this.ctx.stroke(); // Draw the border
            this.ctx.fill();
            this.ctx.restore();
        },

        drawLine: function (point1, point2) {
            this.ctx.save(); // Save the current context state
            this.ctx.beginPath();
            this.ctx.moveTo(point1.x, point1.y); // Move to the starting point
            this.ctx.lineTo(point2.x, point2.y); // Draw a line to the ending point
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'rgba(0, 0, 0)';
            this.ctx.stroke();
            this.ctx.restore();
        },

        isClickInButton: function (point) {
            const rect = this.getDimensions();

            let width = rect.width;
            let center = { x: this.x + width + extraWidth, y: this.y };


            let points = [
                { x: center.x - buttonRadius, y: center.y + buttonRadius },
                { x: center.x + buttonRadius, y: center.y + buttonRadius },
                { x: center.x + buttonRadius, y: center.y - buttonRadius },
                { x: center.x - buttonRadius, y: center.y - buttonRadius }
            ];
            return this.isPointInForm(point.x, point.y, points);
        },

        isPointInForm: function (x, y, points) {
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                const xi = points[i].x, yi = points[i].y;
                const xj = points[j].x, yj = points[j].y;

                const intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        },

        disable: function () {
            // Remove event listeners
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.hiddenInput.removeEventListener('keydown', this.handleKeydown);

            // Remove hidden input element from the DOM
            if (this.hiddenInput && this.hiddenInput.parentNode) {
                this.hiddenInput.parentNode.removeChild(this.hiddenInput);
            }
        },
    };
})();