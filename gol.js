// global variables
var ticker,
	handbrake,
	speed,
	cells,
	nextGenerationCells,
	generation,
	gridSize = 40;

// possible speed levels
var gameSpeeds = {
	slow : {
		name : 'Slow',
		time : 500
	},
	medium : {
		name : 'Normal',
		time : 200
	},
	fast : {
		name : 'Fast',
		time : 50
	}
};

// possible cell formations
var cellFormations = {
	pentonimo : {
		name  : 'The R-pentonimo',
		cells : [[0,1],[1,0],[1,1],[1,2],[2,0]]
	},
	dieHard : {
		name  : 'Die hard',
		cells : [[0,1],[1,1],[1,2],[5,2],[6,2],[7,2],[6,0]]
	}
};

// this is the heartbeat; the clock that makes it all work
function tick()
{
	// stop the ticker and the execution of this tick if handbrake is on
	if( handbrake ){
		clearInterval( ticker );
		return;
	}

	
	calculateNextGeneration();		// get next generation cells
	var t1 = new Date();
	cells = nextGenerationCells;	// replace current cells with new ones
	liveCellsCount = drawState();	// draw new generation on stage

	var t2 = new Date();
	var elapsed = t2 - t1;

	// display text feedback
	generation++;
	updateDashboard( generation, liveCellsCount, elapsed );

}

// initializes the ticker and starts the game
function startTicker()
{
	clearInterval( ticker );
	handbrake = false;
	ticker = setInterval( 'tick();', speed );
}

// stops the game by putting a handbrake which will disable the ticker on its next iteration
function stopTicker()
{
	handbrake = true;
}

// toggles the game on or off
function toggleGame ( a_state )
{
	if( a_state === undefined ){
		var a_state = handbrake;
	}

	if( a_state ){
		startTicker();
		$('#toggleGame').text('Pause');
		$('.dashboard').addClass('running');
	} else {
		stopTicker();
		$('#toggleGame').text('Start');
		$('.dashboard').removeClass('running');
	}
}

// initially creates the stage HTML and cells array
function setStage()
{
	var htmlContent = '<ul>', 
		i, 
		j, 
		className;

	cells = [];
	for( i = 0; i < gridSize; i++ )
	{
		cells[i] = [];
		for( j = 0; j < gridSize; j++ )
		{
			className = '';
			if( j == 0 ){
				// force this row of cells to wrap to a new line
				className += ' first';
			}

			htmlContent += '<li id="' + i + '-' + j + '" class="' + className + '" title="[' + i + ':' + j + ']"></li>';
			
			cells[i][j] = false;
		}
	}

	htmlContent += '</ul>';
	$('.stage').html( htmlContent );
}

// returns a cell object
function getCell( a_x, a_y )
{
	return cells[ a_x ][ a_y ];
}

// returns true or false for a given cell
/*function isAlive( a_x, a_y )
{
	var item = getCell( a_x, a_y );
	return item;
}*/

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

			nextGenerationCells[i][j] = willLive;
		}
	}
}

// uses the cells array to "draw" living cells on the stage
// returns the number of live cells so it can be displayed in the dashboard
function drawState()
{
	var currentItem,
		liveCells = 0,
		i, j;

	$( '.stage li.on' ).removeClass('on');

	for( i = 0; i < gridSize; i++ )
	{
		for( j = 0; j < gridSize; j++ )
		{
			if( cells[i][j] ){
				$( '#' + i + '-' + j ).addClass('on');
				liveCells++;
			}
		}
	}

	return liveCells;
}

// takes an array of cell coordinates ant turns them alive.
// used to display a preset cell pattern
function setItemsAlive( a_items )
{
	for( i in a_items ){
		currentItem = a_items[i];
		cells[ currentItem[0] + parseInt(gridSize/2) ][ currentItem[1] + parseInt(gridSize/2) ] = true;
	}
}

// updates a short string with generation and cell counter
function updateDashboard( a_generation, a_count, a_time )
{
	if( !a_count ){
		alert('All cells have died. Game over!');
		toggleGame(false);
	}

	$('.dashboard').text('Generation: '+a_generation+'; Cells: '+a_count+'; Time: '+a_time);
}

// takes the selected options from the configuration and applies them to the game
// resets the stage and cells array
function applyConfiguration ()
{
	var selectedSpeed = gameSpeeds[ $('#gameSpeed').val() ].time,
		cellFormation = cellFormations[ $('#cellFormation').val() ].cells;
	
	toggleGame(false);

	speed = selectedSpeed;
	generation = 0;

	setStage();
	setItemsAlive( cellFormation );
	drawState();
}

// uses the formation and speed objects to populate options in the configuration panel
function populateConfigurationPanel ()
{
	var cellFormationOptions = '',
		gameSpeedOptions = '';

	for( key in cellFormations ){
		cellFormationOptions += '<option value="'+key+'">'+cellFormations[key].name+'</option>';
	}

	for( key in gameSpeeds ){
		gameSpeedOptions += '<option value="'+key+'">'+gameSpeeds[key].name+'</option>';
	}

	$('#gameSpeed').html( gameSpeedOptions );
	$('#cellFormation').html( cellFormationOptions );
}

// toggles a cell alive or dead both in the cells array and the HTML stage
function toggleCellAlive ( a_x, a_y ) 
{
	var targetCell;

	$('#' + a_x + '-' + a_y).toggleClass('on');
	cells[a_x][a_y] = !cells[a_x][a_y];
}

// binds a click delegate to the whole stage.
// when clicking on a cell it figures out the cell coordinates and launches toggleCellAlive
function bindCellClickHandler () 
{
	var target, 
		targetCoordinates, 
		targetX, 
		targetY;
	
	$('.stage').click(function(e){
		target = $(e.target);
		if( target.is('li') ){
			targetCoordinates = target.attr('id').split('-');
			targetX = parseInt(targetCoordinates[0]);
			targetY = parseInt(targetCoordinates[1]);
			toggleCellAlive( targetX, targetY );
		}
	});
}

$(document).ready(function()
{
	populateConfigurationPanel();
	applyConfiguration();
	bindCellClickHandler();
});