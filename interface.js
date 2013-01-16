// global variables
var ticker,
    handbrake = true,
    speed,
    generation = 0;

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
  
  var t1 = new Date(),
  t2, elapsed,
  liveCellsCount;
  
  // get next generation cells and draw
  cells = game.getNewGeneration();
  drawState( cells );
  liveCellsCount = cells.length;

  t2 = new Date();
  elapsed = t2 - t1;

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
  var htmlContent = [], 
    i, 
    j, 
    className,
    width = game.stage.width,
    height = game.stage.height;

  for( i = 0; i < width; i++ )
  {
    for( j = 0; j < height; j++ )
    {
      className = '';
      if( j == 0 ){
        // force this row of cells to wrap to a new line
        className += ' first';
      }

      htmlContent.push('<li id="' + i + '-' + j + '" class="' + className + '" title="[' + i + ':' + j + ']"></li>');
    }
  }

  $('.stage').html( '<ul>' + htmlContent.join('') + '</ul>');
}

// uses the cells array to "draw" living cells on the stage
// returns the number of live cells so it can be displayed in the dashboard
function drawState( a_gen )
{
  var selector = '', 
  cell, 
  i;
  
  $('li.alive').removeClass('alive');
  for( i in a_gen ){
    cell = a_gen[i];
    selector = '#'+cell[0]+'-'+cell[1];
    $(selector).addClass('alive');
  }

  /*
  
  var selectors = '', 
  cell, 
  i;
  
  for( i in a_gen ){
    cell = a_gen[i];
    selectors += '#'+cell[0]+'-'+cell[1]+', ';
  }
  selectors = selectors.substr( 0, selectors.length - 2 );

  $('li.alive').removeClass('alive');
  $(selectors).addClass('alive');

   */
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
  game.setGeneration( cellFormation );
  drawState( game.cellGeneration );
}

// uses the formation and speed objects to populate options in the configuration panel
function populateConfigurationPanel ()
{
  var cellFormationOptions = [],
    gameSpeedOptions = [],
    key;

  for( key in cellFormations ){
    cellFormationOptions.push('<option value="'+key+'">'+cellFormations[key].name+'</option>');
  }

  for( key in gameSpeeds ){
    gameSpeedOptions.push('<option value="'+key+'">'+gameSpeeds[key].name+'</option>');
  }

  $('#gameSpeed').html( gameSpeedOptions.join('') );
  $('#cellFormation').html( cellFormationOptions.join('') );
}

// toggles a cell alive or dead both in the cells array and the HTML stage
function activateCell ( a_x, a_y ) 
{
  $('#' + a_x + '-' + a_y).toggleClass('on');
  game.toggleCellAlive( a_x, a_y );
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
      activateCell( targetX, targetY );
    }
  });
}

$(document).ready(function()
{
  game.initialize();
  populateConfigurationPanel();
  applyConfiguration();
  bindCellClickHandler();
});