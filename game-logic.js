var Game = {
  parsedCellsMap : [],
  cellMap        : [],
  cellGeneration : [],
  stage          : {
    width  : 50,
    height : 50,
    cell   : 10
  },

  initialize : function initialize( a_width, a_height, a_cell )
  {
    debug('game initialized');
    if( a_width && a_height ){
      this.setStage( a_width, a_height );
    }
    this.stage.cell = a_cell || this.stage.cell;
  },

  setStage : function setStage( a_width, a_height ) 
  {
    this.stage.width  = parseInt( a_width, 10 );
    this.stage.height = parseInt( a_height, 10 );
  },

  // takes an array of cell coordinates ant turns them alive.
  // used to display a preset cell pattern
  setGeneration : function setGeneration( a_cells )
  {
    var currentItem, i,
    midX = parseInt( this.stage.width/2, 10 ),
    midY = parseInt( this.stage.height/2, 10 );

    this.cellGeneration = [];

    for( i in a_cells ){
      currentItem = a_cells[i];
      this.cellGeneration.push([
        currentItem[0] + midX,
        currentItem[1] + midY
      ]);
    }

    this.createCellMap();
    debug('manually set cell generation configuration');
  },

  toggleCellAlive : function toggleCellAlive( a_x, a_y )
  {
    var liveCellFound = false,
    liveCells = this.cellGeneration,
    i, cell;

    for( i in liveCells ){
      cell = liveCells[i];
      if( cell[0] == a_x && cell[1] == a_y ){
        liveCellFound = true;
        this.cellGeneration.splice( i, 1 ); // remove from array
        debug('manually killed cell '+a_x+':'+a_y);
      }
    }

    if( !liveCellFound ){
      this.cellGeneration.push([ a_x, a_y ]);
      debug('manually revived cell '+a_x+':'+a_y);
    }

    this.createCellMap();
  },

  getNewGeneration : function getNewGeneration( a_gen )
  {
    var newGen = [], 
    i,
    cell, 
    cellBlock, 
    newCells;

    if( !a_gen ){
      a_gen = this.cellGeneration;
    }

    // clear the parsed cells map
    this.resetParsedCellsMap();

    // loop through live cells, get cell chunks and parse them, add results
    for( i in a_gen ){
      cell      = a_gen[i];
      cellBlock = this.getNeighbourhood( cell[0], cell[1], true );
      newCells  = this.parseCellBlock( cellBlock );
      newGen    = newGen.concat( newCells );
    }

    this.cellGeneration = newGen;
    this.createCellMap();

    return newGen;
  },

  getNeighbourhood : function getNeighbourhood( a_x, a_y, a_include )
  {
      var stage = this.stage,
      xMin = a_x - 1,
      xMax = a_x + 1,
      yMin = a_y - 1,
      yMax = a_y + 1,
      neighbours     = [],
      i;

    // if at edges of the stage use the cells at the other side as neighbours
    // this way we make the live cells "teleport" through the edges
    if( xMin == -1 ){
      xMin = stage.width - 1;
    }
    if( xMax == stage.width ){
      xMax = 0;
    }
    if( yMin == -1 ){
      yMin = stage.height - 1;  
    }
    if( yMax == stage.height ){
      yMax = 0;
    }

    // build neighbours array
    neighbours = [
      [ xMin, yMin ],
      [ a_x,  yMin ],
      [ xMax, yMin ],
      [ xMax, a_y  ],
      [ xMax, yMax ],
      [ a_x,  yMax ],
      [ xMin, yMax ],
      [ xMin, a_y  ]
    ];

    if( a_include ){
      neighbours.push([ a_x, a_y ]);
    }

    return neighbours;
  },

  runLifeConditions : function runLifeConditions( a_currentlyAlive, a_liveNeighbours )
  {
    var willLive = false;
    
    if( a_currentlyAlive ){
      willLive = ( a_liveNeighbours == 2 || a_liveNeighbours == 3 ) ? true : false;
    } else {
      willLive = ( a_liveNeighbours == 3 ) ? true : false;
    }
    
    return willLive;
  },

  parseCellBlock : function parseCellBlock( a_cellBlock )
  {
    var result = [], 
    i, 
    cell, 
    cellNeighbours, 
    liveNeighbours, 
    cellWillLive, 
    cellIsAlive,
    parsedCellsMap = this.parsedCellsMap;

    for( i in a_cellBlock ){
      cell = a_cellBlock[i];

      // skip parsed cells
      if( parsedCellsMap[ cell[0] ][ cell[1] ] ){
        continue;
      }

      // mark cell as parsed
      parsedCellsMap[ cell[0] ][ cell[1] ] = true;

      cellNeighbours = this.getNeighbourhood( cell[0], cell[1] );
      liveNeighbours = this.getLiveNeighbours( cellNeighbours );
      cellIsAlive    = this.cellMap[cell[0]][cell[1]];
      cellWillLive   = this.runLifeConditions( cellIsAlive, liveNeighbours );

      if( cellWillLive ){
        result.push([ cell[0], cell[1] ]);
      }
    }

    // update parsed cells map
    this.parsedCellsMap = parsedCellsMap;

    // return array of next generation live cells
    return result;
  },

  getLiveNeighbours : function getLiveNeighbours( a_neighbours )
  {
    var i, 
    cell, 
    result  = 0, 
    cellMap = this.cellMap;
    
    for( i in a_neighbours ){
      cell = a_neighbours[i];
      if( cellMap[ cell[0] ][ cell[1] ] ){
        result++;
      }
    }
    return result;
  },

  resetParsedCellsMap : function resetParsedCellsMap()
  {
    var i, 
    j,
    map = [],
    width  = this.stage.width,
    height = this.stage.height;

    for( i = 0; i < width; i++ ){
      map[i] = [];
      for( j = 0; j < height; j++ ){
        map[i][j] = false;
      }
    }

    this.parsedCellsMap = map;
  },

  createCellMap : function createCellMap()
  {
    var cellMap = [],
    width  = this.stage.width,
    height = this.stage.height,
    liveCellCount = this.cellGeneration.length,
    liveCell,
    i, j;

    // create a map with false values
    for( i = 0; i < width; i++ ){
      cellMap[i] = [];
      for( j = 0; j < height; j++ ){
        cellMap[i][j] = false;
      }
    }
    
    // turn the ones that represent a live cell to true
    for( i = 0; i < liveCellCount; i++ ){
      liveCell = this.cellGeneration[i];
      cellMap[ liveCell[0] ][ liveCell[1] ] = true;
    }

    this.cellMap = cellMap;
  }
}