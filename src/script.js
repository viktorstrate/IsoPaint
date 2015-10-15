function sign(p1, p2, p3){
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function triangleInPoint(pt, v1, v2, v3){
    var b1,b2,b3;
    b1 = sign(pt, v1, v2) < 0.0;
    b2 = sign(pt, v2, v3) < 0.0;
    b3 = sign(pt, v3, v1) < 0.0;

    return ((b1 == b2) && (b2 == b3));
}

var iso = {
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    collisionMouseBaseX: 0,
    collisionMouseBaseX: 0,

    canvas: null,
    ctx: null,

    GRID_WIDTH: 40,
    GRID_HEIGHT: 40,

    TILE_SIZE: 20,

    showGrid: true,

    currentColor: "#048df2",
    colors: Array(),
    lastUsedColors: Array(),
    
    usedColors: null,
    colorPicker: null,

    init: function(){
        
        iso.usedColors = document.getElementById('usedColors');
        iso.colorPicker = document.getElementById('myColor');
        
        // setup grid color array
        for(var x = 0; x < iso.GRID_WIDTH; x++){
            iso.colors[x] = Array();
            for(var y = 0; y < iso.GRID_HEIGHT; y++){
                iso.colors[x][y] = "#ffffff";
            }
        }
        
        iso.canvas = document.getElementById("board");
        iso.ctx = iso.canvas.getContext('2d');

        iso.canvas.addEventListener('mousemove', function(evt) {
            iso.updateMousePosition(iso.canvas, evt);
            if(iso.mouseDown) iso.paintTriangle();
        }, false);

        iso.canvas.addEventListener('mousedown', function(){
            iso.mouseDown = true;
            iso.paintTriangle();
        });

        iso.canvas.addEventListener('mouseup', function(){
            iso.mouseDown = false;
        });
        
        window.addEventListener('resize', function(e){
            iso.resize(window.innerWidth-301, window.innerHeight);
        }, false);

        iso.resize(window.innerWidth-301, window.innerHeight);
        
        iso.render();
        
    },
    
    resize: function(width, height){
        iso.canvas.width = width;
        iso.canvas.height = height;
    },

    render: function() {

        iso.hoverTriangle = false;
        
        // temp variables for optimization
        ctx = iso.ctx;
        TILE_SIZE = iso.TILE_SIZE;
        mouseX = iso.mouseX;
        mouseY = iso.mouseY;

        
        
        for(var y = 0; y < iso.GRID_HEIGHT; y++){
            for(var x = 0; x < iso.GRID_WIDTH; x++){

                iso.ctx.fillStyle = iso.colors[x][y];
                var path = new Path2D();
                

                // Start posistion of the triangle
                var startPosX, startPosY;

                // sets the start position
                if(y%2==0){
                    if(x%2==0){
                        startPosX = x*TILE_SIZE;
                        startPosY = TILE_SIZE*0.6+y*TILE_SIZE*0.6;
                    } else {
                        startPosX = x*TILE_SIZE;
                        startPosY = 0+y*TILE_SIZE*0.6;
                    }
                } else {
                    if(x%2==0){
                        startPosX = x*TILE_SIZE+TILE_SIZE;
                        startPosY = TILE_SIZE*0.6+y*TILE_SIZE*0.6;
                    } else {
                        startPosX = x*TILE_SIZE+TILE_SIZE;
                        startPosY = 0+y*TILE_SIZE*0.6;
                    }
                }

                // makes triangle path
                if(x%2==0){

                    path.moveTo(startPosX,startPosY);
                    path.lineTo(startPosX+TILE_SIZE,startPosY-TILE_SIZE*0.6);
                    path.lineTo(startPosX+TILE_SIZE,startPosY+TILE_SIZE*0.6);
                    path.lineTo(startPosX,startPosY);

                    if(iso.hoverTriangle == false &&
                       triangleInPoint({x: iso.mouseX, y: iso.mouseY}, {x: startPosX, y: startPosY},
                                       {x: startPosX+TILE_SIZE, y: startPosY-TILE_SIZE*0.6},
                                       {x: startPosX+TILE_SIZE, y: startPosY+TILE_SIZE*0.6})){

                        ctx.fillStyle = iso.currentColor;
                        iso.hoverTriangle = {x: x, y: y};
                    }
                    

                } else {

                    path.moveTo(startPosX,startPosY);
                    path.lineTo(startPosX+TILE_SIZE, startPosY+TILE_SIZE*0.6);
                    path.lineTo(startPosX,startPosY+TILE_SIZE*0.6+TILE_SIZE*0.6);
                    path.lineTo(startPosX,startPosY+TILE_SIZE*0.6);

                    if(iso.hoverTriangle == false &&
                       triangleInPoint({x: mouseX, y: mouseY}, {x: startPosX, y: startPosY},
                                       {x: startPosX+TILE_SIZE, y: startPosY+TILE_SIZE*0.6},
                                       {x: startPosX, y: startPosY+TILE_SIZE*0.6+TILE_SIZE*0.6})){

                        ctx.fillStyle = iso.currentColor;
                        iso.hoverTriangle = {x: x, y: y};
                    }
                    
                }

                ctx.fill(path);

                ctx.strokeStyle = '#cccccc';
                if(iso.showGrid)
                    ctx.stroke(path);

            }

        }
        
    },
    
    colorChange: function(color){
        iso.currentColor = '#'+color;
    },

    toggleGrid: function(){
        iso.showGrid = !iso.showGrid;
        iso.render();
    },

    loop: function(){
        //window.requestAnimationFrame(iso.loop);
        //setInterval(iso.render(), 1000/30);
    },

    updateMousePosition: function(canvas, evt){
        var rect = iso.canvas.getBoundingClientRect();
        
        iso.mouseX = evt.clientX - rect.left;
        iso.mouseY = evt.clientY - rect.top;
        
        iso.collisionMouseBaseX = parseInt(iso.mouseX/iso.TILE_SIZE);
        iso.collisionMouseBaseY = parseInt(iso.mouseY/(iso.TILE_SIZE*0.6));
        
        iso.render();
    },

    paintTriangle: function(){
        iso.colors[iso.hoverTriangle.x][iso.hoverTriangle.y] = iso.currentColor;
        iso.updatelastUsedColors();
    },
    
    updatelastUsedColors: function(){
        
        for(var i = 0; i < iso.lastUsedColors.length; i++){
            if(iso.lastUsedColors[i] == iso.currentColor){
                iso.lastUsedColors.splice(i, 1);
                break;
            }
        }
        iso.lastUsedColors.push(iso.currentColor);
        
        while (iso.usedColors.hasChildNodes()) {
            iso.usedColors.removeChild(iso.usedColors.firstChild);
        }
        
        for(var i = 0; i < iso.lastUsedColors.length; i++){
            var colorPattle = document.createElement('div');
            colorPattle.className = 'usedColor';
            colorPattle.style.backgroundColor = iso.lastUsedColors[i];
            
            colorPattle.addEventListener('click', function(e){
                console.log(e);
                var colorString = e.target.style.backgroundColor;
                var match = colorString.match(/\d+/g);
                
                iso.setCurrentColor("#" + ((1 << 24) + (parseInt(match[0]) << 16) + (parseInt(match[1]) << 8) + parseInt(match[2])).toString(16).slice(1));
                
            }, false);
            
            iso.usedColors.appendChild(colorPattle);
        }
        
        while(iso.lastUsedColors.length>25){
            iso.lastUsedColors.splice(0,1);
        }
    },
    
    setCurrentColor: function(color){
        iso.currentColor = color;
        iso.colorPicker.color.fromString(color, 0);
        iso.updatelastUsedColors();
    }
}

var onBodyLoad = function(){
    iso.init();
    document.getElementById('myColor').color.showPicker();
    iso.currentColor = '#'+document.getElementById('myColor').color;
}