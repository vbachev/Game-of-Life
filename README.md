Conway's Game of Life
=====

I recently read about a developer event ([Balkan Code Retreat](http://balkan-coderetreat.com/)) that tries to hone people's programming skills while building Conway's Game of Life again and again. Thought it would be interesting to see if I can do it myslef in JS.

The script was slow and simple but I tried to optimize it based on [this article](http://dotat.at/prog/life/life.html). Another optimization was removing all DOM manipulations and using a box-shadow + background pattern implementation to represent the stage, grid and all cells (inspired by [bit-shadow machine](http://www.bitshadowmachine.com/)). Now a computation for the whole stage take around 5ms. 

Well ... JS is not the best environment for this but it's fun anyway :)

Limitations
-----
* Needs jQuery (included in `lib/`);
* May not work in IE or Opera;

_NB! Running the game for a long time will heat up your CPU!_