var ticker;
var generation = 0;

var cells = [];
var nextGenerationCells;

var gridSize = 60;
var speed    = 200;

var handbrake = false;

// var initialLiveItems = [[4,4],[4,3],[3,4],[3,3]];
// var initialLiveItems = [[4,4],[4,3],[4,5]];
var initialLiveItems = [[0,1],[1,0],[1,1],[1,2],[2,0]];

function tick()
{
	if( handbrake ){
		clearInterval( ticker );
		return;
	}

	getNewState();
	cells = nextGenerationCells;
	liveCells = drawState();

	generation++;

	updateDashboard( generation, liveCells );
}

function startTimer()
{
	clearInterval( ticker );
	handbrake = false;
	ticker = setInterval( 'tick();', speed );
}

function stopTimer()
{
	handbrake = true;
}

function setStage()
{
	var htmlContent = '<ul>', 
		i, 
		j, 
		className;

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

function getNewState()
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

	$( '.stage li.on' ).removeClass('on');

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

function setItemsAlive( a_items )
{
	for( i in a_items ){
		currentItem = a_items[i];
		cells[ currentItem[0] + gridSize/2 ][ currentItem[1] + gridSize/2 ].alive = true;
	}
}

function updateDashboard( a_generation, a_count )
{
	$('.dashboard').text('Generation: '+a_generation+'; Cells: '+a_count);
}

$(document).ready(function()
{
	setStage();
	setItemsAlive( initialLiveItems );
	drawState();
});