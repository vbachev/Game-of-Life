var Interface = {
  debug : false,
  
  ticker      : '',
  handbrake   : true,
  speed       : 0,
  generation  : 0,

  options : {
    cellColor   : 'rgba(0,0,0,.5)',
    cellSize    : 10, // for ex. 10 means cells are blocks @10x10px
    cellOffset  : 0,
    cellBlur    : 0,
    gridColor   : 'rgba(0,0,0,.75)'
  },
  
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
    },
    gliderGun : {
      name  : 'Glider Gun',
      cells : [
        [0,4], [1,4], [1,5], [0,5], [10,5],[10,4],
        [10,6],[11,7],[11,3],[12,2],[13,2],[12,8],
        [13,8],[14,5],[15,3],[15,7],[16,6],[16,5],
        [16,4],[17,5],[20,4],[20,3],[21,3],[21,4],
        [21,2],[20,2],[22,5],[24,5],[24,6],[22,1],
        [24,1],[24,0],[34,2],[35,2],[35,3],[34,3]
      ]
    }
  },
  
  initialize : function initialize( a_options )
  {
    debug('initializing interface');

    // apply options or keep default values
    this.options.cellColor  = a_options.cellColor  || this.options.cellColor;
    this.options.cellSize   = a_options.cellSize   || this.options.cellSize;
    this.options.cellOffset = a_options.cellOffset || this.options.cellOffset;
    this.options.cellBlur   = a_options.cellBlur   || this.options.cellBlur;
    this.options.gridColor  = a_options.gridColor  || this.options.gridColor;

    this.debug              = a_options.debug      || this.debug;

    // initialize Game logic and pass grid dimensions
    var gridX = a_options.gridX || false,
        gridY = a_options.gridY || false;
    Game.initialize( gridX, gridY );

    // create and activate config panel and stage
    this.populateConfigurationPanel();
    this.applyConfiguration();
    this.setStage();
    this.bindCellClickHandler();
  },

  // this is the heartbeat; the clock that makes it all work
  // fires itself recursively
  tick : function tick()
  {
    // stop the ticker and the execution of this tick if handbrake is on
    if( this.handbrake ){
      clearInterval( this.ticker );
      return;
    }

    var t1 = new Date(),
    elapsed,
    cells,
    liveCellsCount;

    // get next generation cells and draw
    cells = Game.getNewGeneration();
    this.drawState( cells );
    liveCellsCount = cells.length;

    elapsed = (new Date()) - t1;

    // display text feedback
    this.generation++;
    this.updateDashboard( this.generation, liveCellsCount, elapsed );

    // fire tick recursively
    clearTimeout( this.ticker );
    this.ticker = setTimeout( 'Interface.tick();', this.speed );
  },

  // initializes the ticker and starts the game
  startTicker : function startTicker()
  {
    debug('game started');
    this.handbrake = false;
    this.tick();
  },

  // stops the game by putting a handbrake which will disable the ticker on its next iteration
  stopTicker : function stopTicker()
  {
    debug('game stopped');
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

  // initially creates the stage HTML
  setStage : function setStage()
  {
    debug('stage created');

    var stageWidth  = Game.stage.width,
        stageHeight = Game.stage.height,
        cellSize    = this.options.cellSize,
        stage       = $('.stage'),
        cssChunks   = [],
        gridColor   = this.options.gridColor;
    
    // width and height
    cssChunks.push('width:' + (stageWidth * (cellSize+1) + 1) + 'px;');
    cssChunks.push('height:' + (stageHeight * (cellSize+1) + 1) + 'px;');
    
    // background-size
    cssChunks.push('-webkit-background-size:' + (cellSize+1) + 'px ' + (cellSize+1) + 'px;');
    cssChunks.push('-moz-background-size:' + (cellSize+1) + 'px ' + (cellSize+1) + 'px;');
    cssChunks.push('background-size:' + (cellSize+1) + 'px ' + (cellSize+1) + 'px;');
    
    // background-image with gradient
    cssChunks.push('background-image:-webkit-gradient(linear, 0 0, 0 100%, color-stop(0, ' + gridColor + '), color-stop(0.01, transparent), to(transparent)),'+
                                    '-webkit-gradient(linear, 0 0, 100% 0, color-stop(0, ' + gridColor + '), color-stop(0.01, transparent), to(transparent));');
    cssChunks.push('background-image:-webkit-linear-gradient(' + gridColor + ' 0, transparent 1px), ' +
                                    '-webkit-linear-gradient(0deg, ' + gridColor + ' 0, transparent 1px);');
    cssChunks.push('background-image:-moz-linear-gradient(' + gridColor + ' 0, transparent 1px),' +
                                    '-moz-linear-gradient(0deg, ' + gridColor + ' 0, transparent 1px);');
                                  
    stage.attr( 'style', cssChunks.join('') );
  },

  // uses the cells array to "draw" living cells on the stage
  drawState : function drawState( a_gen )
  {
    var shadows = [],
    cellSize    = this.options.cellSize,
    cellColor   = this.options.cellColor,
    cellBlur    = this.options.cellBlur,
    cellOffset  = this.options.cellOffset,
    cell,
    i;
    
    // add a box-shadow definition for each cell
    // +/-1 is for the border thickness
    for( i in a_gen ){
      cell = a_gen[i];
      shadows.push(
        ( cell[0] * ( cellSize+1 ) + ( Math.floor( cellSize/2 ) + 1 ) )+'px '+
        ( cell[1] * ( cellSize+1 ) + ( Math.floor( cellSize/2 ) + 1 ) )+'px '+ cellBlur +'px '+
        ( Math.floor( cellSize/2 ) - cellOffset )+'px ' + cellColor
      );
    }

    // apply to shadow projector element
    $('.projector').css('box-shadow', shadows.join(', '));
  },

  // updates a short string with generation and cell counter
  updateDashboard : function updateDashboard( a_generation, a_count, a_time )
  {
    if( !a_count ){
      debug('All cells have died. Game over!');
      this.toggleGame(false);
    }

    $('.dashboard').text('Generation: '+a_generation+'; Cells: '+a_count+'; Time: '+a_time);
  },

  setSpeed : function setSpeed ()
  {
    this.speed = this.gameSpeeds[ $('#gameSpeed').val() ].time;
  },

  // takes the selected options from the configuration and applies them to the game
  // resets the stage and cells array
  applyConfiguration : function applyConfiguration ()
  {
    var cellFormation = this.cellFormations[ $('#cellFormation').val() ].cells;
    
    // apply speed configuration
    this.setSpeed();

    // reset the game
    this.toggleGame(false);
    this.generation = 0;

    // set formation and draw cells on stage
    Game.setGeneration( cellFormation );
    this.drawState( Game.cellGeneration );
  },

  // uses the formation and speed objects to populate options in the configuration panel
  populateConfigurationPanel : function populateConfigurationPanel ()
  {
    debug('configuration panel created');
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
    Game.toggleCellAlive( a_x, a_y );
    this.drawState( Game.cellGeneration );
  },

  // binds a click delegate to the whole stage.
  // when clicking on a cell it figures out the cell coordinates and launches toggleCellAlive
  bindCellClickHandler : function bindCellClickHandler ()
  {
    var targetX,
        targetY,
        clickX,
        clickY;

    $('.stage').off('click').on('click', function(e)
    {
      // get browser's specific event properties
      clickX = e.offsetX || e.originalEvent.layerX;
      clickY = e.offsetY || e.originalEvent.layerY;
      
      // calculate which cell got clicked
      // +/- 1 is for the border widths
      targetX = Math.floor( (clickX-1) / (Interface.options.cellSize+1) );
      targetY = Math.floor( (clickY-1) / (Interface.options.cellSize+1) );

      // if click is within bounds - toggle the cell
      if( targetX >= 0 && targetY >= 0 && targetX < Game.stage.width && targetY < Game.stage.height ){
        Interface.activateCell( targetX, targetY );
      }
    });
  }
};