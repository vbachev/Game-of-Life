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
	// stop the ticker and this function
	if( handbrake ){
		clearInterval( ticker );
		return;
	}

	calculateNextGeneration();		// get next generation cells
	cells = nextGenerationCells;	// replace current cells with new ones
	liveCellsCount = drawState();	// draw new generation on stage

	generation++;
	updateDashboard( generation, liveCellsCount );
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
			className = 'item-' + i + '-' + j;
			if( j == 0 ){
				className += ' first';
			}

			htmlContent += '<li id="'+i+'-'+j+'" class="' + className + '" title="[' + i + ':' + j + ']"></li>';
			
			itemObject = {
				x		 : i,
				y		 : j,
				alive 	 : false
			}
			cells[i][j] = itemObject;
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
function isAlive( a_x, a_y )
{
	var item = getCell( a_x, a_y );
	return item.alive;
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

	// if at edges of the stage
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
		if( isAlive( neighbours[i][0], neighbours[i][1] )){
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
	
	nextGenerationCells = [];

	for( i = 0; i < gridSize; i++ )
	{
		nextGenerationCells[i] = [];
		for( j = 0; j < gridSize; j++ )
		{
			oldObject = getCell( i, j );
			neighbours = countLiveNeighbours( i, j ) >> 0;

			if( oldObject.alive ){
				willLive = ( neighbours == 2 || neighbours == 3 ) ? true : false;
			} else {
				willLive = ( neighbours == 3 ) ? true : false;
			}

			newObject = {
				x : i,
				y : j,
				alive : willLive
			};
			nextGenerationCells[i][j] = newObject;
		}
	}
}

// uses the cells array to "draw" living cells on the stage
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
			currentItem = getCell( i, j );
			if( currentItem.alive ){
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
		cells[ currentItem[0] + parseInt(gridSize/2) ][ currentItem[1] + parseInt(gridSize/2) ].alive = true;
	}
}

// updates a short string with generation and cell counter
function updateDashboard( a_generation, a_count )
{
	if( !a_count ){
		alert('All cells have died. Game over!');
		toggleGame(false);
	}

	$('.dashboard').text('Generation: '+a_generation+'; Cells: '+a_count);
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

function toggleCellAlive ( a_x, a_y ) 
{
	var targetCell;

	$('#' + a_x + '-' + a_y).toggleClass('on');
	targetCell = getCell( a_x, a_y );
	targetCell.alive = !targetCell.alive;
}

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