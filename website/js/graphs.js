function createTestCanvas() {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'green';
    ctx.fillRect(10, 10, 100, 10);

    document.getElementsByTagName("body")[0].appendChild(canvas);
}

function createTestGraph() {
    // First, create a box to hold everything inside
    var canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;

    var ctx = canvas.getContext('2d');
}

function drawLine(ctx, startX, startY, endX, endY, color){
    // Save the current context (any other colors in flight)
    ctx.save();

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX,startY);
    ctx.lineTo(endX,endY);
    ctx.stroke();

    // Restore to the previous context (colors, etc)
    ctx.restore();
}

function drawRectangle(ctx, upperLeftX, upperLeftY, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(upperLeftX, upperLeftY, width, height);
    ctx.restore();
}

var BarGraph = function(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.colors = options.colors;

    this.draw = function() {
        var maxValue = -999999999, minValue = 99999999;
        var numberOfElems = Object.keys(this.options.data).length;
        for (var index in this.options.data) {
            maxValue = Math.max(maxValue, this.options.data[index]);
            minValue = Math.min(minValue, this.options.data[index]);
        }

        // Give a little padding at the top
        maxValue += 5;

        // Differentiate between zeroIndexed and not by defining the
        // bottom point
        if (this.options.zeroIndexed === "False") {
            minValue -= 5;
            var spread = maxValue - minValue;
            var midpoint = (maxValue + minValue) / 2;
        }
        else {
            minValue = 0;
            var spread = maxValue;
        }

        // Drawing the bars
        var barIndex = 0;
        // Give 5 extra pixels for the labels
        var labelPadding = 20;
        var barWidth = (this.canvas.width - labelPadding) / numberOfElems;
        for (index in this.options.data) {
            var val = this.options.data[index];
            var barColor = this.colors[barIndex % this.colors.length];
            var nameColor = getFontColor(barColor);
            console.log(nameColor);
            var barHeight = Math.round(this.canvas.height * ((val - minValue) / spread));
            drawRectangle(
                this.ctx, 
                labelPadding + barIndex * barWidth, // Should add padding here 
                this.canvas.height - barHeight,
                barWidth,
                barHeight,
                this.colors[barIndex % this.colors.length]);
            this.ctx.save();
            this.ctx.fillStyle = nameColor;
            this.ctx.font = "bold 14px Georgia";
            this.ctx.fillText(index, labelPadding + barIndex * barWidth + 5, this.canvas.height - 1);
            this.ctx.restore();
            barIndex++;
        }

        // Draw grid lines
        var gridValue = Math.round(minValue);
        this.ctx.save();
        while (gridValue <= maxValue) {
            var gridY = this.canvas.height * (1 - (gridValue - minValue) / spread);
            this.ctx.globalAlpha = .15;
            drawLine(this.ctx, 0, gridY, this.canvas.width, gridY, this.options.gridColor);
            this.ctx.globalAlpha = 1.0;
            this.ctx.fillStyle = this.options.gridColor;
            this.ctx.font = "bold 11px Georgia";
            this.ctx.fillText(gridValue, 0, Math.min(gridY - 3, this.canvas.height - 2));
            this.ctx.restore();
            gridValue += this.options.gridScale;
        }
        drawLine(this.ctx, 0, this.canvas.height, this.canvas.width, this.canvas.height, this.options.gridColor);
        this.ctx.restore();
    }

    function getFontColor(hex) {
        if (hex.substring(0, 1) === "#") hex = hex.slice(1);
        var r, g, b;
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);

        if ((r * .299 + g * .587 + b * .114) > 125) {
            return "#000000";
        }
        return "#FFFFFF";
    }

}

console.log("This works, right?");
createTestCanvas();

var myVinyls = {
    "Ahri": 59,
    "Blitzcrank": 42.4,
    "Janna": 51.4,
    "All three": 55.2
};

var canvas = document.createElement("canvas");
document.getElementsByTagName("body")[0].appendChild(canvas);
canvas.width = 500;
canvas.height = 200;
var myBarchart = new BarGraph(
    {
        canvas: canvas,
        gridScale: 5,
        gridColor: "#000000",
        data: myVinyls,
        zeroIndexed: "False",
        colors: ["#a55ca5","#67b6c7", "#bccd7a","#eb9743"]
    }
);

myBarchart.draw();
