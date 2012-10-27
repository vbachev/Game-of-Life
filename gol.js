var ticker,
	handbrake,
	speed,
	cells,
	nextGenerationCells,
	generation,
	gridSize = 40;

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

function tick()
{
	if( handbrake ){
		clearInterval( ticker );
		return;
	}

	calculateNextGeneration();
	cells = nextGenerationCells;
	liveCellsCount = drawState();

	generation++;

	updateDashboard( generation, liveCellsCount );
}

function startTicker()
{
	clearInterval( ticker );
	handbrake = false;
	ticker = setInterval( 'tick();', speed );
}

function stopTicker()
{
	handbrake = true;
}

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

			htmlContent += '<li class="' + className + '" title="[' + i + ':' + j + ']"></li>';
			
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

function getItem( a_x, a_y )
{
	return cells[ a_x ][ a_y ];
}

function isAlive( a_x, a_y )
{
	var item = getItem( a_x, a_y );
	return item.alive;
}

function countLiveNeighbours( a_x, a_y )
{
	var xMin = a_x - 1,
		xMax = a_x + 1,
		yMin = a_y - 1,
		yMax = a_y + 1,
		neighbours     = [],
		liveNeighbours = 0,
		i;

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

	for( i in neighbours ){
		if( isAlive( neighbours[i][0], neighbours[i][1] )){
			liveNeighbours++;
		}
	}

	return liveNeighbours;
}

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
			oldObject = getItem( i, j );
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

function drawState()
{
	var currentItem,
		liveCells = 0,
		i, j;

	killAllCells();

	for( i = 0; i < gridSize; i++ )
	{
		for( j = 0; j < gridSize; j++ )
		{
			currentItem = getItem( i, j );
			if( currentItem.alive ){
				$( '.item-' + i + '-' + j ).addClass('on');
				liveCells++;
			}
		}
	}

	return liveCells;
}

function killAllCells () 
{
	$( '.stage li.on' ).removeClass('on');
}

function setItemsAlive( a_items )
{
	for( i in a_items ){
		currentItem = a_items[i];
		cells[ currentItem[0] + parseInt(gridSize/2) ][ currentItem[1] + parseInt(gridSize/2) ].alive = true;
	}
}

function updateDashboard( a_generation, a_count )
{
	if( !a_count ){
		alert('All cells have died. Game over!');
		toggleGame(false);
	}

	$('.dashboard').text('Generation: '+a_generation+'; Cells: '+a_count);
}

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

$(document).ready(function()
{
	populateConfigurationPanel();
	applyConfiguration();
});