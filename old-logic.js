// global variables
var cells,
  nextGenerationCells;


// this is the heartbeat; the clock that makes it all work
function tick()
{
	// stop the ticker and the execution of this tick if handbrake is on
	if( handbrake ){
		clearInterval( ticker );
		return;
	}
	
	var t1 = new Date();
	calculateNextGeneration();		// get next generation cells
	cells = nextGenerationCells;	// replace current cells with new ones
	liveCellsCount = drawState();	// draw new generation on stage

	var t2 = new Date();
	var elapsed = t2 - t1;
	h.push(elapsed);
	// display text feedback
	generation++;
	updateDashboard( generation, liveCellsCount, elapsed );
}

// loops over a cell's neighbours and returns how many of them are alive
function countLiveNeighbours( a_x, a_y )
{
	var xMin = a_x - 1,
		xMax = a_x + 1,
		yMin = a_y - 1,
		yMax = a_y + 1,
		neighbours     = [],
		liveNeighbours = 0,
		i;

	// if at edges of the stage use the cells at the other side as neighbours
	// this way we make the live cells "teleport" through the edges
	if( xMin == -1 ){
		xMin = gridSize - 1;
	}
	if( xMax == gridSize ){
		xMax = 0;
	}
	if( yMin == -1 ){
		yMin = gridSize - 1;	
	}
	if( yMax == gridSize ){
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

	// loop over neighbours
	for( i in neighbours ){
		if( cells[ neighbours[i][0] ][ neighbours[i][1] ] ){
			liveNeighbours++;
		}
	}

	return liveNeighbours;
}

// core Game of Life logic. 
// loops over all cells and decides which will survive in the next generation. 
// Populates the nextGenerationCells array
function calculateNextGeneration()
{
	var neighbours,
		willLive,
		newObject,
		i, j;
	
	// empty the nextgen array
	nextGenerationCells = [];

	for( i = 0; i < gridSize; i++ )
	{
		nextGenerationCells[i] = [];
		for( j = 0; j < gridSize; j++ )
		{
			oldCell    = cells[i][j];
			neighbours = countLiveNeighbours( i, j ) >> 0;

			// survial logic for live and dead cells
			if( oldCell ){
				willLive = ( neighbours == 2 || neighbours == 3 ) ? true : false;
			} else {
				willLive = ( neighbours == 3 ) ? true : false;
			}

			/* This optimisation does not affect performance ...
			willLive = false;
			if( neighbours > 1 && neighbours < 4 ){
			//if( neighbours == 2 || neighbours == 3 ){
				willLive = ( oldCell || neighbours == 3 ) ? true : false;
			}*/

			nextGenerationCells[i][j] = willLive;
		}
	}
}

// returns a cell object
function getCell( a_x, a_y )
{
	return cells[ a_x ][ a_y ];
}

function toggleCellAlive( a_x, a_y )
{
  cells[a_x][a_y] = !cells[a_x][a_y];
}