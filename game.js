window.addEventListener("load", (event) => {
  var canvas = document.querySelectorAll("#canvas")[0],
      ctx = canvas.getContext('2d'),
      width = 40,
      height = 40,
      buffer = null,
      requestId,
      stop = false;
  var palette = [
    [127,120,210,255],
    [239,177,255,255],
    [255,226,255,255],
    [72,19,128,255],
  ]

  document.querySelectorAll("body")[0].style.cssText = "background: rgba(" + palette[3] + ");";
  
  function draw() {
    // Create an empty ImageData array
    var pixelData = ctx.createImageData(width, height),
        matrix;

    // Store a copy of the current ImageData in the buffer. We'll use this later as we generate a new array based on our rules.
    buffer = ctx.getImageData(0,0,width,height);
    matrix = imageDataToArray(buffer.data, width, height)

    // If this isn't the first pass, grab the first render and run it through the ruleset.
    if (matrix[0][0][0] !== 0) {
      let newMatrix = []

      // Create the matrix.
      for (var i = 0; i < matrix.length; i++) {
        let row = matrix[i],
            newRow = []

        // Create the rows.
        for (var j = 0; j < row.length; j++) {

          // Populate the indexes of this row with colors based on these arcane rules.
          if (JSON.stringify(matrix[i][j+1]) === JSON.stringify(palette[0])) {

            Math.random() < 0.5 ? newRow.push(palette[0]) : newRow.push(palette[2]);


          } else if (JSON.stringify(matrix[i+1]) && JSON.stringify(matrix[i+1][j+2]) === JSON.stringify(palette[0])) {

            newRow.push(palette[1]);
            continue

          } else if (JSON.stringify(matrix[i+1]) && JSON.stringify(matrix[i+1][j]) === JSON.stringify(palette[1])) {

            Math.random() < 0.5 ? newRow.push(palette[1]) : newRow.push(palette[3]) 
            continue

          } else if (JSON.stringify(matrix[i-1]) && JSON.stringify(matrix[i-1][j+4]) === JSON.stringify(palette[2])) {

            newRow.push(palette[2]);
            continue

          } else if (JSON.stringify(matrix[i][j]) === JSON.stringify(palette[3])) {

            Math.random() < .75 ? newRow.push(palette[3]) : newRow.push(palette[0])
            continue

          } else {newRow.push(matrix[i][j])}
        }

        // Add each row to the matrix
        newMatrix.push(newRow)
      }

      // FLatten our new 2d matrix, convert it into a Typed array, and update the canvas pixel data
      let newPixelData = [].concat(...newMatrix);
      pixelData.data.set(Uint8ClampedArray.from([].concat(...newPixelData)))

      // This is purely for debugging purposes, makes it easy to stop the thing after the first pass.
      //stop = true;
    } else {

      // This generates our seed frame by stepping through the pixelData indexes and randomly assigning one of our four colors (pixel + 0–3 covers the r, g, b, and a values)
      for (let pixel = 0; pixel < pixelData.data.length; pixel += 4) {
        let paletteStepper = Math.floor(Math.random() * (4 - 0)) + 0
        pixelData.data[pixel + 0] = palette[paletteStepper][0]; // R value
        pixelData.data[pixel + 1] = palette[paletteStepper][1]; // G value
        pixelData.data[pixel + 2] = palette[paletteStepper][2]; // B value
        pixelData.data[pixel + 3] = palette[paletteStepper][3]; // A value
      }
    }

    // Save our image data object to the canvas.
    ctx.putImageData(pixelData, 0, 0)

    // As long as we haven't told the thing to stop, run another frame.
    if (stop === false) {
      requestId = window.requestAnimationFrame(draw); 
    }
  }

  // I wrote this to convert raw image data (a massive sequence of discrete r, g, b, and a values) into a 2D matrix. This gets saved into a buffer and compared against when we go to draw our next frame based on the rules in the draw() function.
  const imageDataToArray = (imageData, imageHeight, imageWidth) => {
    
    let pixelArray = []

    // This just runs through the ImageData.data array, chunking sequential rgba values into discrete arrays
    for (var i = 0; i < imageData.length; i+= 4) {
      let pixel = [
        imageData[i],
        imageData[i+1],
        imageData[i+2],
        imageData[i+3]
      ]
      pixelArray.push(pixel)
    }

    let array = []

    // This takes our 1d array of rgba chunks and transforms it into a 2d array
    for (let i = 0; i < imageData.length/4; i+= 40) {
      let row = []
      for (let j = 0; j < 40; j++) {
        row.push(pixelArray[i + j])
      }
      array.push(row)
    }

    return array;
  }

  window.requestAnimationFrame(draw)

  // This lets us kill the animation if it starts getting to me.
  document.querySelectorAll("#stop")[0].addEventListener("click", (event) => {
    shuffle(palette);
    document.querySelectorAll("body")[0].style.cssText = "background: rgba(" + palette[3] + ");";
  })

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
})