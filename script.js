// Used to calculate which triangle the mouse is hovering over
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
    // The current position of the mouse
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,

    canvas: null,
    ctx: null,

    GRID_WIDTH: 40,
    GRID_HEIGHT: 60,
    
    RATIO: 0.5,

    // The width of the triangles in pixels
    TILE_SIZE: 20,

    showGrid: true,
    
    // Tools
    tools: {
        PENCIL: 0,
        PAINT_BUCKET: 1,
        EYE_DROPPER: 2
    },
    currentTool: 0,

    currentColor: "",
    // A multidimentional array of all the colors of the triangles
    colors: Array(),
    // An array of the last used colors shown under the color picker
    lastUsedColors: Array(),
    
    // DOM ELEMENTS
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

        // Event listeners
        iso.canvas.addEventListener('mousemove', function(evt) {
            iso.updateMousePosition(iso.canvas, evt);
            if(iso.mouseDown){
                if(iso.currentTool == iso.tools.PENCIL){
                    iso.paintTriangle();
                }
                if(iso.currentTool == iso.tools.EYE_DROPPER){
                    iso.eyeDrop();
                }
            }
        }, false);

        iso.canvas.addEventListener('mousedown', function(){
            iso.mouseDown = true;
            if(iso.currentTool == iso.tools.PENCIL){
                iso.paintTriangle();
            }
            if(iso.currentTool == iso.tools.EYE_DROPPER){
                iso.eyeDrop();
            }
        });

        iso.canvas.addEventListener('mouseup', function(){
            iso.mouseDown = false;
            if(iso.currentTool == iso.tools.PAINT_BUCKET){
                iso.fillColor(iso.currentColor, iso.hoverTriangle.x, iso.hoverTriangle.y);
            }
        });
        
        window.addEventListener('resize', function(e){
            iso.resize(window.innerWidth-301, window.innerHeight);
        }, false);

        // Set resize the canvas to fill the window
        iso.resize(window.innerWidth-301, window.innerHeight);
        
        iso.render();
        
    },
    
    resize: function(width, height){
        iso.canvas.width = width;
        iso.canvas.height = height;
    },

    render: function() {
        
        // The triangle the mouse is hovering over
        iso.hoverTriangle = false;
        
        // temporary variables for optimization
        ctx = iso.ctx;
        
        TILE_SIZE = iso.TILE_SIZE;
        mouseX = iso.mouseX;
        mouseY = iso.mouseY;
        
        for(var y = 0; y < iso.GRID_HEIGHT; y++){
            for(var x = 0; x < iso.GRID_WIDTH; x++){

                // Set the fillstyle color to be the color of the given triangle
                iso.ctx.fillStyle = iso.colors[x][y];
                
                var path = new Path2D();

                // Start posistion of the triangle to draw
                var startPosX, startPosY;

                // sets the start position
                if(y%2==0){
                    if(x%2==0){
                        startPosX = x*TILE_SIZE;
                        startPosY = TILE_SIZE*iso.RATIO+y*TILE_SIZE*iso.RATIO;
                    } else {
                        startPosX = x*TILE_SIZE;
                        startPosY = 0+y*TILE_SIZE*iso.RATIO;
                    }
                } else {
                    if(x%2==0){
                        startPosX = x*TILE_SIZE+TILE_SIZE;
                        startPosY = TILE_SIZE*iso.RATIO+y*TILE_SIZE*iso.RATIO;
                    } else {
                        startPosX = x*TILE_SIZE+TILE_SIZE;
                        startPosY = 0+y*TILE_SIZE*iso.RATIO;
                    }
                }

                // makes triangle path
                if(x%2==0){

                    path.moveTo(startPosX,startPosY);
                    path.lineTo(startPosX+TILE_SIZE,startPosY-TILE_SIZE*iso.RATIO);
                    path.lineTo(startPosX+TILE_SIZE,startPosY+TILE_SIZE*iso.RATIO);
                    path.lineTo(startPosX,startPosY);

                    // Tests for mouse hover over this triangle
                    if(iso.hoverTriangle == false &&
                       triangleInPoint({x: iso.mouseX, y: iso.mouseY}, {x: startPosX, y: startPosY},
                                       {x: startPosX+TILE_SIZE, y: startPosY-TILE_SIZE*iso.RATIO},
                                       {x: startPosX+TILE_SIZE, y: startPosY+TILE_SIZE*iso.RATIO})){

                        ctx.fillStyle = iso.currentColor;
                        iso.hoverTriangle = {x: x, y: y};
                    }
                    

                } else {

                    path.moveTo(startPosX,startPosY);
                    path.lineTo(startPosX+TILE_SIZE, startPosY+TILE_SIZE*iso.RATIO);
                    path.lineTo(startPosX,startPosY+TILE_SIZE*iso.RATIO+TILE_SIZE*iso.RATIO);
                    path.lineTo(startPosX,startPosY+TILE_SIZE*iso.RATIO);

                    // Tests for mouse hover over this triangle
                    if(iso.hoverTriangle == false &&
                       triangleInPoint({x: mouseX, y: mouseY}, {x: startPosX, y: startPosY},
                                       {x: startPosX+TILE_SIZE, y: startPosY+TILE_SIZE*iso.RATIO},
                                       {x: startPosX, y: startPosY+TILE_SIZE*iso.RATIO+TILE_SIZE*iso.RATIO})){

                        ctx.fillStyle = iso.currentColor;
                        iso.hoverTriangle = {x: x, y: y};
                    }
                    
                }

                ctx.fill(path);

                // Grid
                ctx.strokeStyle = '#cccccc';
                if(iso.showGrid)
                    ctx.stroke(path);

            }

        }
        
    },
    
    // Used by the color picker
    colorChange: function(color){
        iso.currentColor = '#'+color;
    },

    toggleGrid: function(){
        iso.showGrid = !iso.showGrid;
        iso.render();
    },
    
    // Called when the mouse moves
    updateMousePosition: function(canvas, evt){
        var rect = iso.canvas.getBoundingClientRect();
        
        iso.mouseX = evt.clientX - rect.left;
        iso.mouseY = evt.clientY - rect.top;
        
        // Updates the canvas
        iso.render();
    },

    // Paints the triangle the mouse is hovering over
    paintTriangle: function(){
        iso.colors[iso.hoverTriangle.x][iso.hoverTriangle.y] = iso.currentColor;
        iso.updatelastUsedColors();
    },
    
    // Updates the colors under the colorpicker
    updatelastUsedColors: function(){
        
        // removes dublicates of current color from array
        for(var i = 0; i < iso.lastUsedColors.length; i++){
            if(iso.lastUsedColors[i] == iso.currentColor){
                iso.lastUsedColors.splice(i, 1);
                break;
            }
        }
        // pushes the current color to array
        iso.lastUsedColors.push(iso.currentColor);
        
        while (iso.usedColors.hasChildNodes()) {
            iso.usedColors.removeChild(iso.usedColors.firstChild);
        }
        
        // adds the colors from array to DOM
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
        
        // keeps the array under 25 items
        while(iso.lastUsedColors.length>25){
            iso.lastUsedColors.splice(0,1);
        }
    },
    
    setCurrentColor: function(color){
        iso.currentColor = color;
        iso.colorPicker.color.fromString(color, 0);
        iso.updatelastUsedColors();
    },
    
    fillColor: function(color, x, y){
        var succededFields = Array(),
            fieldsToTest = Array();
            
            fieldColor = iso.colors[x][y];
        
        fieldsToTest.push({x: x, y: y});
        
        while(true){
            
            var tempFieldsToTest = Array();
            
            for(var i = 0; i < fieldsToTest.length; i++){
                var newFieldsToTest = Array();
                
                if(fieldsToTest[i].x<0 || fieldsToTest[i].y<0 ||
                   fieldsToTest[i].x>iso.GRID_WIDTH || fieldsToTest[i].y>iso.GRID_HEIGHT) continue;
                
                if(fieldsToTest[i].y%2==0){
                    if(fieldsToTest[i].x%2==0){
                        newFieldsToTest.push({x: fieldsToTest[i].x-1, y: fieldsToTest[i].y-1});
                        newFieldsToTest.push({x: fieldsToTest[i].x+1, y: fieldsToTest[i].y});
                        newFieldsToTest.push({x: fieldsToTest[i].x-1, y: fieldsToTest[i].y+1});
                    } else {
                        newFieldsToTest.push({x: fieldsToTest[i].x-1, y: fieldsToTest[i].y-1});
                        newFieldsToTest.push({x: fieldsToTest[i].x-1, y: fieldsToTest[i].y+1});
                        newFieldsToTest.push({x: fieldsToTest[i].x-1, y: fieldsToTest[i].y});
                    }
                } else {
                    if(fieldsToTest[i].x%2==0){
                        newFieldsToTest.push({x: fieldsToTest[i].x+1, y: fieldsToTest[i].y-1});
                        newFieldsToTest.push({x: fieldsToTest[i].x+1, y: fieldsToTest[i].y});
                        newFieldsToTest.push({x: fieldsToTest[i].x+1, y: fieldsToTest[i].y+1});
                    } else {
                        newFieldsToTest.push({x: fieldsToTest[i].x+1, y: fieldsToTest[i].y-1});
                        newFieldsToTest.push({x: fieldsToTest[i].x+1, y: fieldsToTest[i].y+1});
                        newFieldsToTest.push({x: fieldsToTest[i].x-1, y: fieldsToTest[i].y});
                    }
                }
                
                for(var a = 0; a < newFieldsToTest.length; a++){
                    if(iso.colors[newFieldsToTest[a].x][newFieldsToTest[a].y] == fieldColor){
                        var alreadyAdded = false;
                        for(var succeded = 0; succeded < succededFields.length; succeded++){
                            
                            if(newFieldsToTest[a].x == succededFields[succeded].x &&
                              newFieldsToTest[a].y == succededFields[succeded].y){
                                alreadyAdded = true;
                                break;
                            }
                        }
                        for(var temp = 0; temp < tempFieldsToTest.length; temp++){
                            if(newFieldsToTest[a].x == tempFieldsToTest[temp].x &&
                              newFieldsToTest[a].y == tempFieldsToTest[temp].y){
                                alreadyAdded = true;
                                break;
                            }
                        }
                        if(!alreadyAdded)
                            tempFieldsToTest.push(newFieldsToTest[a]);
                    }
                }
                
                succededFields.push(fieldsToTest[i]);
                iso.colors[fieldsToTest[i].x][fieldsToTest[i].y] = color;
            }
            
            if(tempFieldsToTest.length==0) break;
            
            fieldsToTest = tempFieldsToTest;
        }
        
        console.log(succededFields);
        
        iso.render();
        
        iso.updatelastUsedColors();
        
    },
    
    eyeDrop: function(){
        iso.setCurrentColor(iso.colors[iso.hoverTriangle.x][iso.hoverTriangle.y]);
        iso.render();
    }
}

var onBodyLoad = function(){
    iso.init();
    document.getElementById('myColor').color.showPicker();
    iso.setCurrentColor("#000000");
}