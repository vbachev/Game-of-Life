var Interface = {
  
  ticker : '',
  handbrake : true,
  speed : 0,
  generation : 0,
  
  // possible speed levels
  gameSpeeds : {
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
  },
  
  // possible cell formations
  cellFormations : {
    pentonimo : {
      name  : 'The R-pentonimo',
      cells : [[0,1],[1,0],[1,1],[1,2],[2,0]]
    },
    dieHard : {
      name  : 'Die hard',
      cells : [[0,1],[1,1],[1,2],[5,2],[6,2],[7,2],[6,0]]
    }
  },
  
  initialize : function()
  {
    this.populateConfigurationPanel();
    this.applyConfiguration();
    this.bindCellClickHandler();
  },

  // this is the heartbeat; the clock that makes it all work
  tick : function tick()
  {
    // stop the ticker and the execution of this tick if handbrake is on
    if( this.handbrake ){
      clearInterval( this.ticker );
      return;
    }

    var t1 = new Date(),
    t2, elapsed,
    cells,
    liveCellsCount;

    // get next generation cells and draw
    cells = Game.getNewGeneration();
    this.drawState( cells );
    liveCellsCount = cells.length;

    t2 = new Date();
    elapsed = t2 - t1;

    // display text feedback
    this.generation++;
    this.updateDashboard( this.generation, liveCellsCount, elapsed );
  },

  // initializes the ticker and starts the game
  startTicker : function startTicker()
  {
    clearInterval( this.ticker );
    this.handbrake = false;
    this.ticker = setInterval( 'Interface.tick();', this.speed );
  },

  // stops the game by putting a handbrake which will disable the ticker on its next iteration
  stopTicker : function stopTicker()
  {
    this.handbrake = true;
  },

  // toggles the game on or off
  toggleGame : function toggleGame ( a_state )
  {
    if( a_state === undefined ){
      var a_state = this.handbrake;
    }

    if( a_state ){
      this.startTicker();
      $('#toggleGame').text('Pause');
      $('.dashboard').addClass('running');
    } else {
      this.stopTicker();
      $('#toggleGame').text('Start');
      $('.dashboard').removeClass('running');
    }
  },

  // initially creates the stage HTML and cells array
  setStage : function setStage()
  {
    var stageWidth = Game.stage.width,
      stageHeight = Game.stage.height,
      cellSize = Game.stage.cell,
      stage = $('.stage'),
      cssChunks = [];
    
    // width and height
    cssChunks.push('width:' + (stageWidth * (cellSize+1) + 1) + 'px;');
    cssChunks.push('height:' + (stageHeight * (cellSize+1) + 1) + 'px;');
    
    // background-size
    cssChunks.push('-webkit-background-size:' + (cellSize+1) + 'px ' + (cellSize+1) + 'px;');
    cssChunks.push('-moz-background-size:' + (cellSize+1) + 'px ' + (cellSize+1) + 'px;');
    cssChunks.push('background-size:' + (cellSize+1) + 'px ' + (cellSize+1) + 'px;');
    
    // background-image with gradient
    cssChunks.push('background-image:-webkit-gradient(linear, 0 0, 0 100%, color-stop(0, black), color-stop(0.1, transparent), to(transparent)),'+
                                    '-webkit-gradient(linear, 0 0, 100% 0, color-stop(0, black), color-stop(0.1, transparent), to(transparent));');
    cssChunks.push('background-image:-webkit-linear-gradient(rgba(0, 0, 0, 1) 0, transparent 1px), ' +
                                    '-webkit-linear-gradient(0deg, rgba(0, 0, 0, 1) 0, transparent 1px);');
    cssChunks.push('background-image:-moz-linear-gradient(rgba(0, 0, 0, 1) 0, transparent 1px),' +
                                    '-moz-linear-gradient(0deg, rgba(0, 0, 0, 1) 0, transparent 1px);');
                                  
    stage.attr( 'style', cssChunks.join('') );
  },

  // uses the cells array to "draw" living cells on the stage
  drawState : function drawState( a_gen )
  {
    var shadows = [],
    cellSize = Game.stage.cell,
    cell, 
    i;
    
    // add a box-shadow definition for each cell
    for( i in a_gen ){
      cell = a_gen[i];
      shadows.push( 
        (cell[1]*(cellSize+1)+(Math.floor(cellSize/2)+1))+'px '+
        (cell[0]*(cellSize+1)+(Math.floor(cellSize/2)+1))+'px 0 '+
        (Math.floor(cellSize/2))+'px rgba(0,150,50,.6)'
      );
    }

    // apply to shadow projector element
    $('.projector').css('box-shadow', shadows.join(', '));
  },

  // updates a short string with generation and cell counter
  updateDashboard : function updateDashboard( a_generation, a_count, a_time )
  {
    if( !a_count ){
      alert('All cells have died. Game over!');
      this.toggleGame(false);
    }

    $('.dashboard').text('Generation: '+a_generation+'; Cells: '+a_count+'; Time: '+a_time);
  },

  // takes the selected options from the configuration and applies them to the game
  // resets the stage and cells array
  applyConfiguration : function applyConfiguration ()
  {
    var selectedSpeed = this.gameSpeeds[ $('#gameSpeed').val() ].time,
    cellFormation = this.cellFormations[ $('#cellFormation').val() ].cells;

    this.toggleGame(false);

    this.speed = selectedSpeed;
    this.generation = 0;

    this.setStage();
    Game.setGeneration( cellFormation );
    this.drawState( Game.cellGeneration );
  },

  // uses the formation and speed objects to populate options in the configuration panel
  populateConfigurationPanel : function populateConfigurationPanel ()
  {
    var cellFormationOptions = [],
      gameSpeedOptions = [],
      key;

    for( key in this.cellFormations ){
      cellFormationOptions.push('<option value="'+key+'">'+this.cellFormations[key].name+'</option>');
    }

    for( key in this.gameSpeeds ){
      gameSpeedOptions.push('<option value="'+key+'">'+this.gameSpeeds[key].name+'</option>');
    }

    $('#gameSpeed').html( gameSpeedOptions.join('') );
    $('#cellFormation').html( cellFormationOptions.join('') );
  },

  // toggles a cell alive or dead both in the cells array and the HTML stage
  activateCell : function activateCell ( a_x, a_y ) 
  {
    $('#' + a_x + '-' + a_y).toggleClass('on');
    Game.toggleCellAlive( a_x, a_y );
  },

  // binds a click delegate to the whole stage.
  // when clicking on a cell it figures out the cell coordinates and launches toggleCellAlive
  bindCellClickHandler : function bindCellClickHandler () 
  {
    var target, 
        targetCoordinates, 
        targetX, 
        targetY;

    $('.stage').click(function(e){console.log(e);
      target = $(e.target);
      if( target.is('li') ){
        targetCoordinates = target.attr('id').split('-');
        targetX = parseInt( targetCoordinates[0], 10 );
        targetY = parseInt( targetCoordinates[1], 10 );
        
        this.activateCell( targetX, targetY );
      }
    });
  }
};