// just a tiny debug logger
function debug( a_msg )
{
  var info = {
    source : arguments.callee.caller.name,
    args : arguments.callee.caller.arguments
  },
  entry = { message : a_msg, details : info, time : new Date() };
  
  // record entries in the object itself
  if( typeof debug.log === 'object' ){
    debug.log.push(entry);
  } else {
    debug.log = [entry];
  }
  
  // if requested show debug messages
  if( Interface.debug ){
    console.log( entry.message, entry.details, entry.time.toLocaleString() );
  }
}