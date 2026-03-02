//Individual ports
class Port { //ePow(bool), rPow(int), blockType(str), io(str), priority(bool)
    constructor(ePow, rPow, conBlockType, io, priority){
        //Electric power
        this.ePow = ePow;
        //Redstone power
        this.rPow = rPow;
        //block type;
        this.conBlockType = conBlockType;
        //input/output
        this.io = io;
        //priority
        this.priority = priority;
    }

    //clone method -_-
    clone() {
        return new Port(this.ePow, this.rPow, this.conBlockType, this.io, this.priority);
    }

    //get methods for port data
    getEPower() { //boolean
        return this.ePow; 
    }
    
    getRPower() { //integer
        return this.rPow; 
    }

    getConBlockType() { //string
        return this.conBlockType; 
    }

    getIo() { //string
        return this.io; 
    }

    getPrior() { //boolean
        //priority = redirection
        return this.priority; 
    }

    //set methods for port data
    setEPower(x) { //boolean
        this.ePow = x; 
    }
    
    setRPower(x) { //integer
        this.rPow = x; 
    }

    setConBlockType(x) { //string
        this.conBlockType = x; 
    }

    setIo(x) { //string
        this.io = x; 
    }

    setPrior(x) { //boolean
        //priority = redirection
        this.priority = x; 
    }
}

//Block main structure
class Block { //blockType(str), direction(int), state(int), imgPower(str), portsList(obj x4)
    constructor(blockType, direction, state, imgPower, img, portsList){
        //block name ("redstone_block")
        this.blockType = blockType;
        //refer to table below
        this.direction = direction;
        //repeator ticks etc.
        this.state = state;
        //"on" or "off"
        this.imgPower = imgPower;
        //stores image paths
        this.img = img;
        //port objects [north, east, south, west] (objects)
        this.portsList = portsList;
    }

    //clone method due to structuredClone() being annoying
    clone() {
        return new Block(this.blockType, this.direction, this.state, this.imgPower, this.img, this.portsList.map(port => port.clone()));
    }

    //get methods for general block data (mainly for image conversion)
    getBlockType(){ //string
        return this.blockType;
    }

    getDirection(){ //integer
        return this.direction;
    }

    getState(){ //integer
        return this.state;
    }

    getImgPower(){ //string
        return this.imgPower;
    }

    getImg(){ //string
        return this.img;
        //return "images/air_1234_1_off.png";
    }

    //set methods for general block data
    setBlockType(x){ //string
        this.blockType = x;
    }

    setDirection(x){ //integer
        this.direction = x;
    }

    setState(x){ //integer
        this.state = x;
    }

    setImgPower(){ //string
        if (this.powerTest("r")){
            this.imgPower = "on";
        }
        else {
            this.imgPower = "off";
        }
    }

    //no parameters - converts attributes to image path
    setImg(){ //string
        //images/redstone_repeator_13_1_off.png
        this.setImgPower();
        this.img = `images/${this.blockType}_${this.direction.toString()}_${this.state.toString()}_${this.imgPower}.png`;
    }

    //get methods for port objects
    getNorthPort(){ //object
        return this.portsList[0];
    }

    getEastPort(){ //object
        return this.portsList[1];
    }

    getSouthPort(){ //object
        return this.portsList[2];
    }

    getWestPort(){ //object
        return this.portsList[3];
    }

    //tests if the block has power (e/r)
    powerTest(x) { //boolean
        //tests and updates ePower
        if (x == "e"){
            //this.getNorthPort().setEPower(true);
            //this.getEastPort().setEPower(true);
            //this.getSouthPort().setEPower(true);
            //this.getWestPort().setEPower(true);
            return true;
        }

        //only tests rPower
        else if (x == "r" && (this.getNorthPort().getRPower() > 0 || this.getEastPort().getRPower() > 0 || this.getSouthPort().getRPower() > 0 || this.getWestPort().getRPower() > 0)){
            return true;
        }
        else {
            return false;
        }
    }

    //returns highest possible redstone power ouput value (minus one for spacing)
    travellingPowerOutput(){ //integer
        let max = 1;
        for (let i = 0; i < this.portsList.length; i++){
            if (this.portsList[i].getIo() == "input" && this.portsList[i].getRPower() > max){
                max = this.portsList[i].getRPower();
            }
        }
        return max-1;
    }
    
    //returns highest possible redstone power ouput value (no travelling)
    fixedPowerOutput(){ //integer
        let max = 1;
        for (let i = 0; i < this.portsList.length; i++){
            if (this.portsList[i].getIo() == "input" && this.portsList[i].getRPower() > max){
                max = this.portsList[i].getRPower();
            }
        }
        return max;
    }
}


//SECTION Update/Analysis
//generic block creator (genEmpty = default/single-use)
function genEmptyBlock(){
    return new Block(
        "air", 1234, 1, "off", 
        "images/air_1234_1_off.png", 
        [
            new Port(false, 0, "air", "none", false), 
            new Port(false, 0, "air", "none", false), 
            new Port(false, 0, "air", "none", false), 
            new Port(false, 0, "air", "none", false)
        ]);
}

//NOTE Main block generator and updater
function genBlock(block,y,x){
    let dirTest = edgeIdentifier(y,x);

    //constructing surrounding blocks list
    let surBlock = ["air","air","air","air"];
    if(dirTest.includes("1")){surBlock[0] = blocksV1[y-1][x].getBlockType(); }
    if(dirTest.includes("2")){surBlock[1] = blocksV1[y][x+1].getBlockType(); }
    if(dirTest.includes("3")){surBlock[2] = blocksV1[y+1][x].getBlockType(); }
    if(dirTest.includes("4")){surBlock[3] = blocksV1[y][x-1].getBlockType(); }

    //implementation
    if (block == "air"){
        return new Block(
            block, 1234, 1, "off", 
            "images/air_1234_1_off.png", 
            [
                new Port(false, 0, surBlock[0], "none", false), 
                new Port(false, 0, surBlock[1], "none", false), 
                new Port(false, 0, surBlock[2], "none", false), 
                new Port(false, 0, surBlock[3], "none", false)
            ]);
    }
    else if (block == "redstone_block"){
        return new Block(
            block, 1234, 1, "off", 
            "images/redstone_block_1234_1_off.png", 
            [
                new Port(false, 16, surBlock[0], "output", true), 
                new Port(false, 16, surBlock[1], "output", true), 
                new Port(false, 16, surBlock[2], "output", true), 
                new Port(false, 16, surBlock[3], "output", true)
            ]);
    }
    else if (block == "redstone_dust"){
        return new Block(
            block, 1234, 1, "off", 
            "images/redstone_dust_1234_1_off.png",
            [
                new Port(false, 0, surBlock[0], "none", true), 
                new Port(false, 0, surBlock[1], "none", true), 
                new Port(false, 0, surBlock[2], "none", true), 
                new Port(false, 0, surBlock[3], "none", true)
            ]);
    }
    else if (block == "redstone_repeator"){
        return new Block(
            block, 31, 1, "off", 
            "images/redstone_repeator_31_1_off.png", 
            [
                new Port(false, 0, surBlock[0], "output", true), 
                new Port(false, 0, surBlock[1], "none", false), 
                new Port(false, 0, surBlock[2], "input", true), 
                new Port(false, 0, surBlock[3], "none", false)
            ]);
    }
    else if (block == "redstone_comparator"){
        return new Block(
            block, 31, 1, "off", 
            "images/redstone_comparator_31_1_off.png", 
            [
                new Port(false, 0, surBlock[0], "output", true), 
                new Port(false, 0, surBlock[1], "input", true), 
                new Port(false, 0, surBlock[2], "input", true), 
                new Port(false, 0, surBlock[3], "input", true)
            ]);
    }
    else if (block == "redstone_lamp"){
        return new Block(
            block, 1234, 1, "off", 
            "images/redstone_lamp_1234_1_off.png", 
            [
                new Port(false, 0, surBlock[0], "input", false), 
                new Port(false, 0, surBlock[1], "input", false), 
                new Port(false, 0, surBlock[2], "input", false), 
                new Port(false, 0, surBlock[3], "input", false)
            ]);
    }
    else if (block == "cobblestone"){
        return new Block(
            block, 1234, 1, "off", 
            "images/cobblestone_1234_1_off.png", 
            [
                new Port(true, 0, surBlock[0], "input", false), 
                new Port(true, 0, surBlock[1], "input", false), 
                new Port(true, 0, surBlock[2], "input", false), 
                new Port(true, 0, surBlock[3], "input", false)
            ]);
    }
    //REVIEW Add direction changer
    else if (block == "stick"){
        if (blocksV1[y][x].getBlockType() == "redstone_repeator"){

        }
        else if (blocksV1[y][x].getBlockType() == "redstone_comparator"){

        }
        else if (blocksV1[y][x].getBlockType() == "observer"){

        }
        //NOTE remove later:
        return new Block(block, 1234, 1, "off", "images/air_1234_1_off.png", [new Port(false, 0, surBlock[0], "none", false), new Port(false, 0, surBlock[1], "none", false), new Port(false, 0, surBlock[2], "none", false), new Port(false, 0, surBlock[3], "none", false)]);
    }
    // …existing code…
    // …existing code…
    else if (block === "book") {
        const orig = blocksV1[y][x].getBlockType();          // keep the thing
        if (orig === "redstone_repeator") {
            let newDir, img, ports;
            if (blocksV1[y][x].getDirection() === 31) {
                newDir = 42;
                img   = "images/redstone_repeator_42_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"none",false),
                    new Port(false,0,surBlock[1],"output",true),
                    new Port(false,0,surBlock[2],"none",false),
                    new Port(false,0,surBlock[3],"input",true)
                ];
            } else if (blocksV1[y][x].getDirection() === 42) {
                newDir = 13;
                img   = "images/redstone_repeator_13_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"input",true),
                    new Port(false,0,surBlock[1],"none",false),
                    new Port(false,0,surBlock[2],"output",true),
                    new Port(false,0,surBlock[3],"none",false)
                ];
            } else if (blocksV1[y][x].getDirection() === 13) {
                newDir = 24;
                img   = "images/redstone_repeator_24_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"none",false),
                    new Port(false,0,surBlock[1],"input",true),
                    new Port(false,0,surBlock[2],"none",false),
                    new Port(false,0,surBlock[3],"output",true)
                ];
            } else if (blocksV1[y][x].getDirection() === 24) {
                newDir = 31;
                img   = "images/redstone_repeator_31_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"output",true),
                    new Port(false,0,surBlock[1],"none",false),
                    new Port(false,0,surBlock[2],"input",true),
                    new Port(false,0,surBlock[3],"none",false)
                ];
            }
            // <<< return the rotated repeater
            return new Block(orig, newDir, 1, "off", img, ports);

        } else if (orig === "redstone_comparator") {
            let newDir, img, ports;
            const dir = blocksV1[y][x].getDirection();
            if (dir === 31) {
                newDir = 42;
                img   = "images/redstone_comparator_42_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"none",false),
                    new Port(false,0,surBlock[1],"output",true),
                    new Port(false,0,surBlock[2],"input",true),
                    new Port(false,0,surBlock[3],"input",true)
                ];
            } else if (dir === 42) {
                newDir = 13;
                img   = "images/redstone_comparator_13_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"input",true),
                    new Port(false,0,surBlock[1],"none",false),
                    new Port(false,0,surBlock[2],"output",true),
                    new Port(false,0,surBlock[3],"input",true)
                ];
            } else if (dir === 13) {
                newDir = 24;
                img   = "images/redstone_comparator_24_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"input",true),
                    new Port(false,0,surBlock[1],"input",true),
                    new Port(false,0,surBlock[2],"none",false),
                    new Port(false,0,surBlock[3],"output",true)
                ];
            } else { // dir === 24
                newDir = 31;
                img   = "images/redstone_comparator_31_1_off.png";
                ports = [
                    new Port(false,0,surBlock[0],"output",true),
                    new Port(false,0,surBlock[1],"input",true),
                    new Port(false,0,surBlock[2],"input",true),
                    new Port(false,0,surBlock[3],"none",false)
                ];
            }
            // <<< return the rotated comparator
            return new Block(orig, newDir, 1, "off", img, ports);
        }

        // anything else – do nothing
        return blocksV1[y][x].clone();
    }
// …existing code…
}

//blocksV1 for setting genBlocks & original data | blocksV2 for updating data and immediately copying it over
var blocksV1;
var blocksV2;
//grid values
var gridX = 6;
var gridY = 6;
//when testing the puzzle (exclusive)
var testP = false; // grid initialisation happens once the DOM is ready (see window.onload)

blocksV1 = Array.from({length:gridY}, () => Array.from({length:gridX}, () => genEmptyBlock()));
blocksV2 = Array.from({length:gridY}, () => Array.from({length:gridX}, () => genEmptyBlock()));

//selection variables
var selectedOption = null;
var selectedBlock = null;

//sets grid count (rows, cols)
function setGridCount(y,x){
    gridY = y;
    gridX = x;
    // regenerate block arrays to match new dimensions
    blocksV1 = Array.from({length:gridY}, () => Array.from({length:gridX}, () => genEmptyBlock()));
    blocksV2 = Array.from({length:gridY}, () => Array.from({length:gridX}, () => genEmptyBlock()));
    // update CSS variables on the placement grid element if it exists
    const gridEl = document.getElementById("placementGrid");
    if (gridEl) {
        gridEl.style.setProperty('--grid-sizey', gridY); // number of rows
        gridEl.style.setProperty('--grid-sizex', gridX); // number of columns
    }
    // clear any existing selection and refresh display
    selectionRemoval();
    update();
}

//clear button
function reset(){
    console.log("Block reset!");
    blocksV1 = Array.from({length:gridY}, () => Array.from({length:gridX}, () => genEmptyBlock()));
    blocksV2 = Array.from({length:gridY}, () => Array.from({length:gridX}, () => genEmptyBlock()));
    selectionRemoval();
    update();
}

//updates surrounding blocks in blocksV2
function updateSurrounding(y,x){
    let dirTesting = edgeIdentifier(y,x);
    //constructing surrounding blocks list
    let surBlock = ["air","air","air","air"];
    if(dirTesting.includes("1")){surBlock[0] = blocksV1[y-1][x].getBlockType(); }
    if(dirTesting.includes("2")){surBlock[1] = blocksV1[y][x+1].getBlockType(); }
    if(dirTesting.includes("3")){surBlock[2] = blocksV1[y+1][x].getBlockType(); }
    if(dirTesting.includes("4")){surBlock[3] = blocksV1[y][x-1].getBlockType(); }

    blocksV2[y][x].getNorthPort().setConBlockType(surBlock[0]);
    blocksV2[y][x].getEastPort().setConBlockType(surBlock[1]);
    blocksV2[y][x].getSouthPort().setConBlockType(surBlock[2]);
    blocksV2[y][x].getWestPort().setConBlockType(surBlock[3]);
}

//tests and returns for available directions
function edgeIdentifier(y,x){
    let dirAvail = ["1","2","3","4"];
    // north
    if (y-1 < 0) dirAvail.splice(dirAvail.indexOf("1"),1);
    // east
    if (x+1 >= gridX) dirAvail.splice(dirAvail.indexOf("2"),1);
    // south
    if (y+1 >= gridY) dirAvail.splice(dirAvail.indexOf("3"),1);
    // west
    if (x-1 < 0) dirAvail.splice(dirAvail.indexOf("4"),1);
    return dirAvail;
}

//tests ePower on surrounding blocks
function ePowerTest(y,x){
    if (testP = true){
        return true;
    } else {
        return false;
    }
}

//ePowerTest path succession tester
function successfulPath(cobbleY, cobbleX, y, x, visited){
    return true;
    //recursion stuff for tracebacks
    const coor = `${cobbleY},${cobbleX}`;
    if (visited.has(coor)) return false;
    visited.add(coor);

    
    //cobblestone found
    if (blocksV1[cobbleY][cobbleX].getBlockType() == "cobblestone"){
        return true;
    }

    //checking ePower existence in block
    if (blocksV1[cobbleY][cobbleX].powerTest("e")){
        let dirTest = edgeIdentifier(cobbleY,cobbleX);
        //checking all (valid) directions
        //North
        if (dirTest.includes("1") && !(cobbleY-1 == y && cobbleX == x)){
            const neighbor = blocksV1[cobbleY-1][cobbleX];
            if (neighbor.getBlockType() != "air" && neighbor.getSouthPort().getEPower()){
                if (successfulPath(cobbleY-1,cobbleX,cobbleY,cobbleX,visited)){
                    return true;
                }
            }
        }
        //East
        if (dirTest.includes("2") && !(cobbleY == y && cobbleX+1 == x)){
            const neighbor = blocksV1[cobbleY][cobbleX+1];
            if (neighbor.getBlockType() != "air" && neighbor.getWestPort().getEPower()){
                if (successfulPath(cobbleY,cobbleX+1,cobbleY,cobbleX,visited)){
                    return true;
                }
            }
        }
        //South
        if (dirTest.includes("3") && !(cobbleY+1 == y && cobbleX == x)){
            const neighbor = blocksV1[cobbleY+1][cobbleX];
            if (neighbor.getBlockType() != "air" && neighbor.getNorthPort().getEPower()){
                if (successfulPath(cobbleY+1,cobbleX,cobbleY,cobbleX,visited)){
                    return true;
                }
            }
        }
        //West
        if (dirTest.includes("4") && !(cobbleY == y && cobbleX-1 == x)){
            const neighbor = blocksV1[cobbleY][cobbleX-1];
            if (neighbor.getBlockType() != "air" && neighbor.getEastPort().getEPower()){
                if (successfulPath(cobbleY,cobbleX-1,cobbleY,cobbleX,visited)){
                    return true;
                }
            }
        }
        
    }
    //if cobblestone is never found...
    return false;
}

//removes selection
function selectionRemoval(){
    if(selectedOption) selectedOption.classList.remove("selected");
    if(selectedBlock) selectedBlock.classList.remove("selected");
    selectedOption = null;
    selectedBlock = null;
}

//NOTE Updates the blocks list (and image list)
function update(){
    console.log("--------------------------- Block update! ---------------------------");
    //Does the corresponding update function for each corresponding block
    for(let r = 0; r < blocksV1.length; r++){
        for (let c = 0; c < blocksV1[0].length; c++){
            updateSurrounding(r,c);
            if (blocksV1[r][c].getBlockType() =="air"){
                air_update(r,c);
            } 
            else if (blocksV1[r][c].getBlockType() =="redstone_block"){
                redstone_block_update(r,c);
            } 
            else if (blocksV1[r][c].getBlockType() =="redstone_dust"){
                redstone_dust_update(r,c);
            } 
            else if (blocksV1[r][c].getBlockType() =="redstone_repeator"){
                redstone_repeator_update(r,c);
            } 
            else if (blocksV1[r][c].getBlockType() =="redstone_comparator"){
                redstone_comparator_update(r,c);
            } 
            else if (blocksV1[r][c].getBlockType() =="redstone_lamp"){
                redstone_lamp_update(r,c);
            } 
            else if (blocksV1[r][c].getBlockType() =="cobblestone"){
                cobblestone_update(r,c);
            }
            blocksV2[r][c].setImg();
        }
    }
    
    blocksV1 = blocksV2.map(row => row.map(bloc => bloc.clone()));
    implement();
    console.log("blocksV1[1]:", blocksV1[1]);
}   

//Implements the blocks list into the grid (HTML creation)
function implement(){
    //empties current div
    const grid = document.getElementById("placementGrid");
    grid.innerHTML = '';
    //adds stuff to the div
    for (let r = 0; r < gridY; r++){
        for (let c = 0; c < gridX; c++){
            //cell division
            const cell = document.createElement("div");
            cell.className = "grid-cell";
            cell.id = `cell-${r}-${c}`;
            cell.dataset.row = r;
            cell.dataset.col = c;
                //image creation
                const image = document.createElement("img");
                image.src = blocksV1[r][c].getImg();
                image.alt = blocksV1[r][c].getImg();
                cell.appendChild(image);
            grid.appendChild(cell);
        }
    }
}

//!SECTION


//SECTION Onsite processes
function supdate(){
    testP = true;
    update();
}


//Initial loading of content
window.onload = (() => {
    // ensure the CSS grid variables reflect the current dimensions
    setGridCount(gridY, gridX);
    // update() is already called inside setGridCount
    console.log("Content Initial load!");
});

//main activity detection and updating
document.addEventListener("DOMContentLoaded", function () {
    //Option grid element
    let opt = document.getElementById("blockPalette");
    //PLAcement grid element 
    let pla = document.getElementById("placementGrid");

    //selection manager - options palette
    opt.addEventListener("click", function(opt) {
        //initial element test (if outside; removes all selected)
        const option = opt.target.closest(".options");
        if(!option) {
            selectionRemoval();
            return;
        }
        
        //element toggle (if you click the same element twice)
        if (selectedOption == option) {
            option.classList.remove("selected");
            selectedOption = null;
            return;
        }
        
        //resets &reassigns selection    
        if (selectedOption) selectedOption.classList.remove("selected");
        option.classList.add("selected");
        selectedOption = option;

        //NOTE match instance (option-side)
        if(selectedBlock){
            // Use the global blockSubstitution function instead of the local one
            window.blockSubstitution();
            if(selectedBlock) selectedBlock.classList.remove("selected");
            selectedBlock = null;
        }
    });

    //selection manager - block grid
    pla.addEventListener("click", function(bloc) {
        //initial element test (if outside; removes all selected)
        const block = bloc.target.closest(".grid-cell");
        if(!block) {
            selectionRemoval();
            return;
        }

        //element toggle (if you click the same element twice)
        if (selectedBlock == block) {
            block.classList.remove("selected");
            selectedBlock = null;
            return;
        }

        //resets & reassigns selection    
        if (selectedBlock) selectedBlock.classList.remove("selected");
        block.classList.add("selected");
        selectedBlock = block;

        //NOTE match instance (block-side)
        if(selectedOption){
            // Use the global blockSubstitution function instead of the local one
            window.blockSubstitution();
            if(selectedBlock) selectedBlock.classList.remove("selected");
            selectedBlock = null;
        }
    });

    //background option removal
    document.addEventListener("click", function(event) {
        const cElement = event.target;

        //checks if element is the background
        if (cElement === document.body || cElement === document.documentElement){
            selectionRemoval();
        }
    });

});

 //(∞) update function
 //REVIEW Very buggy...
var continuousUpdate = false;
function conUpdate(){
    continuousUpdate = !continuousUpdate;
    let wupInt;

    //color toggle
    if (continuousUpdate){
        document.getElementById("wupdate").style.backgroundColor = "#6bf3a1";
        wupInt = setInterval(function() {
            update();
            console.log("while update process...")
            document.getElementById("wupdate").addEventListener("mouseup", function(){
                continuousUpdate = !continuousUpdate; 
                clearInterval(wupInt);
                document.getElementById("wupdate").style.backgroundColor = "#d36868";
            });
        },500);
    }
}

//!SECTION


/*//SECTION
Port Ref:  new Port(ePow(bool), rPow(int), conBlockType(str), io(str), priority(bool))
           s/getEPower(bool) | s/getRPower(int) | s/getConBlockType(str) | s/getIo(str) | s/getPrior(bool)

Block Ref: new Block(blockType(str), direction(int), state(int), imgPower(str), img(str), portsList(obj x4))
           s/getBlockType(str) | s/getDirection(int) | s/getState(int) | s/getImgPower(str) | s/getImg(str)
           get[dir]Port(obj) | powerTest(bool) | travelling/fixedPowerOutput(int)
           *setImg() & setImgPower() has no parameters | powerTest() requires parameter "e" or "r"

Function Ref: genEmptyBlock() | genBlock(block,y,x) | edgeIdentifier(y,x) | ePowertest(y,x) | selectionRemoval() | updateSurrounding(y,x) | successfulPath(neighY, neighX, y, x)

Implementation Ref: setGridCount(y,x) | (s)update() | implement() | reset() | conUpdate()

*/

function air_update(y,x){ //DONE
    blocksV2[y][x] = blocksV1[y][x].clone();
}

function redstone_block_update(y,x){ //DONE
    blocksV2[y][x] = blocksV1[y][x].clone();
    if (!testP){
        //no ePower (turns off dust)
        blocksV2[y][x].getNorthPort().setEPower(false);
        blocksV2[y][x].getEastPort().setEPower(false);
        blocksV2[y][x].getSouthPort().setEPower(false);
        blocksV2[y][x].getWestPort().setEPower(false);

        //turns image off
        blocksV2[y][x].setImgPower("off");
    }
}

function redstone_dust_update(y,x){ //DONE
    blocksV2[y][x] = blocksV1[y][x].clone();

        //direction availability - initial cleaning of edge "blocks"
        let dirTest = edgeIdentifier(y,x);
        //direction priority - testing priority in surrounding blocks
        let dirPrior = [];

        if (dirTest.includes("1") && blocksV1[y-1][x].getSouthPort().getPrior()) dirPrior.push("1");
        if (dirTest.includes("2") && blocksV1[y][x+1].getWestPort().getPrior()) dirPrior.push("2");
        if (dirTest.includes("3") && blocksV1[y+1][x].getNorthPort().getPrior()) dirPrior.push("3");
        if (dirTest.includes("4") && blocksV1[y][x-1].getEastPort().getPrior()) dirPrior.push("4");

        //direction establishment
        //0-directions / 4-directions
        if (dirPrior.length == 0 || dirPrior.length == 4){
            blocksV2[y][x].setDirection(1234);
        }
        //1-direction
        else if (dirPrior.length == 1){
            let dustExist = false;
            //tests if its the only redstone dust around
            if (dirTest.includes("1") && blocksV1[y-1][x].getBlockType() == "redstone_dust") dustExist = true;
            if (dirTest.includes("2") && blocksV1[y][x+1].getBlockType() == "redstone_dust") dustExist = true;
            if (dirTest.includes("3") && blocksV1[y+1][x].getBlockType() == "redstone_dust") dustExist = true;
            if (dirTest.includes("4") && blocksV1[y][x-1].getBlockType() == "redstone_dust") dustExist = true;

            if (dustExist == true && (dirPrior[0] == "1" || dirPrior[0] == "3")){
                blocksV2[y][x].setDirection(13);
            }
            else if (dustExist == true && (dirPrior[0] == "2" || dirPrior[0] == "4")){
                blocksV2[y][x].setDirection(24);
            }
            else {
                blocksV2[y][x].setDirection(1234);
            }
        }
        //2-directions
        else if (dirPrior.length == 2 || dirPrior.length == 3){
            blocksV2[y][x].setDirection(parseInt(dirPrior.join("")));
        }


    if (testP){
        //Max rPower establishment (applies to next 50 something lines of code)
        let rPowMax = 0;
        //power source existence
        let psExist = false;

        //check every direction for valid power source
        for (const direction of dirTest){
            //direction irrelevance test
            if (!blocksV2[y][x].getDirection().toString().includes(direction)) continue;

            //storing neighboring/next/new values (yeah call it whatever you want)
            let neighY = y;
            let neighX = x;

            switch(direction){
                case "1": neighY = y-1; break;
                case "2": neighX = x+1; break;
                case "3": neighY = y+1; break;
                case "4": neighX = x-1; break;
            }

            //checking neighboring blocks
            if (neighY < 0 || neighY >= gridY || neighX < 0 || neighX >= gridX) continue;
            const neighbor = blocksV1[neighY][neighX];
            let powerProvision = false;
            let neighborPower = 0;

            //direction analysis (power provision/block type)
            switch(direction){
                case "1": 
                    powerProvision = (neighbor.getSouthPort().getIo() == "output" || neighbor.getBlockType() == "redstone_dust");
                    neighborPower = neighbor.getSouthPort().getRPower();
                    break;
                case "2": 
                    powerProvision = (neighbor.getWestPort().getIo() == "output" || neighbor.getBlockType() == "redstone_dust");
                    neighborPower = neighbor.getWestPort().getRPower();
                    break;
                case "3": 
                    powerProvision = (neighbor.getNorthPort().getIo() == "output" || neighbor.getBlockType() == "redstone_dust");
                    neighborPower = neighbor.getNorthPort().getRPower();
                    break;
                case "4": 
                    powerProvision = (neighbor.getEastPort().getIo() == "output" || neighbor.getBlockType() == "redstone_dust");
                    neighborPower = neighbor.getEastPort().getRPower();
                    break;
            }

            //checks validity of power source
            if (powerProvision && neighborPower > 0){
                if (traceRedstoneSource(neighY, neighX, y, x, new Set())){
                    psExist = true;
                    //finding max power output
                    if (neighborPower-1 > rPowMax){
                        rPowMax = neighborPower - 1;
                    }
                }
            }
        }

        //setting corresponding port rPower if power source is valid
        if (psExist){
            if (blocksV2[y][x].getDirection().toString().includes("1")) blocksV2[y][x].getNorthPort().setRPower(rPowMax); 
            if (blocksV2[y][x].getDirection().toString().includes("2")) blocksV2[y][x].getEastPort().setRPower(rPowMax);
            if (blocksV2[y][x].getDirection().toString().includes("3")) blocksV2[y][x].getSouthPort().setRPower(rPowMax);
            if (blocksV2[y][x].getDirection().toString().includes("4")) blocksV2[y][x].getWestPort().setRPower(rPowMax);
            blocksV2[y][x].setImgPower("on");
        } 
        else {
            //no valid power source
            blocksV2[y][x].getNorthPort().setEPower(false);
            blocksV2[y][x].getEastPort().setEPower(false);
            blocksV2[y][x].getSouthPort().setEPower(false);
            blocksV2[y][x].getWestPort().setEPower(false);
            
            //turning "off" dust
            blocksV2[y][x].getNorthPort().setRPower(0); 
            blocksV2[y][x].getEastPort().setRPower(0);
            blocksV2[y][x].getSouthPort().setRPower(0);
            blocksV2[y][x].getWestPort().setRPower(0);

            //turns image off
            blocksV2[y][x].setImgPower("off");
        }
    }
    else {
        //no ePower
        blocksV2[y][x].getNorthPort().setEPower(false);
        blocksV2[y][x].getEastPort().setEPower(false);
        blocksV2[y][x].getSouthPort().setEPower(false);
        blocksV2[y][x].getWestPort().setEPower(false);
        
        //turning "off" dust
        blocksV2[y][x].getNorthPort().setRPower(0); 
        blocksV2[y][x].getEastPort().setRPower(0);
        blocksV2[y][x].getSouthPort().setRPower(0);
        blocksV2[y][x].getWestPort().setRPower(0);

        //turns image off
        blocksV2[y][x].setImgPower("off");
    }

    
    //local redstone tracer function
    function traceRedstoneSource(newY, newX, y, x, visited){
        //recursion for visited blocks
        const coor = `${newY},${newX}`;
        if (visited.has(coor)) return false;
        visited.add(coor);

        //check if block is a power source
        if (blocksV1[newY][newX].getBlockType() == "redstone_block" || (blocksV1[newY][newX].powerTest("r") && blocksV1[newY][newX].travellingPowerOutput() > 0)){
            return true;
        }

        //checking all directions
        let dirTest = edgeIdentifier(newY,newX);
        //North
        if (dirTest.includes("1") && !(newY-1 == y && newX == x)){
            const neighboring = blocksV1[newY-1][newX];
            if (neighboring.getBlockType() != "air" && neighboring.getSouthPort().getRPower() > 0){
                if (traceRedstoneSource(newY-1, newX, newY, newX, visited)){
                    return true;
                }
            }
        }
        //East
        if (dirTest.includes("2") && !(newY == y && newX+1 == x)){
            const neighboring = blocksV1[newY][newX+1];
            if (neighboring.getBlockType() != "air" && neighboring.getWestPort().getRPower() > 0){
                if (traceRedstoneSource(newY, newX+1, newY, newX, visited)){
                    return true;
                }
            }
        }
        //South
        if (dirTest.includes("3") && !(newY+1 == y && newX == x)){
            const neighboring = blocksV1[newY+1][newX];
            if (neighboring.getBlockType() != "air" && neighboring.getNorthPort().getRPower() > 0){
                if (traceRedstoneSource(newY+1, newX, newY, newX, visited)){
                    return true;
                }
            }
        }
        //West
        if (dirTest.includes("4") && !(newY == y && newX-1 == x)){
            const neighboring = blocksV1[newY][newX-1];
            if (neighboring.getBlockType() != "air" && neighboring.getEastPort().getRPower() > 0){
                if (traceRedstoneSource(newY, newX-1, newY, newX, visited)){
                    return true;
                }
            }
        }

        //if all else fails...
        return false;
    }
}

function redstone_repeator_update(y,x){
    /*
    block, 31, 1, "off", 
            "images/redstone_repeator_31_1_off.png", 
            [
                new Port(false, 0, surBlock[0], "output", true), 
                new Port(false, 0, surBlock[1], "none", false), 
                new Port(false, 0, surBlock[2], "input", true), 
                new Port(false, 0, surBlock[3], "none", false)
            ] 
    When book is used:
    direction{ 31 => 42 => 13 => 24}
    type
    */
    blocksV2[y][x] = blocksV1[y][x].clone();
    //sets repeator directionional power
    if (testP){
        let dirTest = edgeIdentifier(y,x);
        //direction priority - testing priority in surrounding blocks
        let dirPrior = [];

        if (dirTest.includes("1") && blocksV1[y-1][x].getSouthPort().getPrior()) dirPrior.push("1");
        if (dirTest.includes("2") && blocksV1[y][x+1].getWestPort().getPrior()) dirPrior.push("2");
        if (dirTest.includes("3") && blocksV1[y+1][x].getNorthPort().getPrior()) dirPrior.push("3");
        if (dirTest.includes("4") && blocksV1[y][x-1].getEastPort().getPrior()) dirPrior.push("4");
        blocksV2[y][x].setImgPower("on");
        if (blocksV1[y][x].getDirection() == 31 && dirTest.includes("3") && blocksV1[y+1][x].getNorthPort().getRPower() > 0){
            blocksV2[y][x].getNorthPort().setRPower(15); 
            blocksV2[y][x].getEastPort().setRPower(0);
            blocksV2[y][x].getSouthPort().setRPower(0);
            blocksV2[y][x].getWestPort().setRPower(0);
        } else if (blocksV1[y][x].getDirection() == 42 && dirTest.includes("4") && blocksV1[y][x-1].getEastPort().getRPower() > 0){
            blocksV2[y][x].getNorthPort().setRPower(0); 
            blocksV2[y][x].getEastPort().setRPower(15);
            blocksV2[y][x].getSouthPort().setRPower(0);
            blocksV2[y][x].getWestPort().setRPower(0);
        } else if (blocksV1[y][x].getDirection() == 13 && dirTest.includes("1") && blocksV1[y-1][x].getSouthPort().getRPower() > 0){
            blocksV2[y][x].getNorthPort().setRPower(0); 
            blocksV2[y][x].getEastPort().setRPower(0);
            blocksV2[y][x].getSouthPort().setRPower(15);
            blocksV2[y][x].getWestPort().setRPower(0);
        } else if (blocksV1[y][x].getDirection() == 24 && dirTest.includes("2") && blocksV1[y][x+1].getWestPort().getRPower() > 0){
            blocksV2[y][x].getNorthPort().setRPower(0); 
            blocksV2[y][x].getEastPort().setRPower(0);
            blocksV2[y][x].getSouthPort().setRPower(0);
            blocksV2[y][x].getWestPort().setRPower(15);
        } else {
            blocksV2[y][x].getNorthPort().setRPower(0); 
            blocksV2[y][x].getEastPort().setRPower(0);
            blocksV2[y][x].getSouthPort().setRPower(0);
            blocksV2[y][x].getWestPort().setRPower(0);
            blocksV2[y][x].setImgPower("off");
        }
    }
}

// …existing code…
function redstone_comparator_update(y,x){
    blocksV2[y][x] = blocksV1[y][x].clone();
    if (testP){
        let dirTest = edgeIdentifier(y,x);
        const dir = blocksV1[y][x].getDirection();

        // helpers to avoid out‑of‑bounds checks in every case
        const north = () => blocksV1[y-1] && blocksV1[y-1][x];
        const east  = () => blocksV1[y][x+1];
        const south = () => blocksV1[y+1] && blocksV1[y+1][x];
        const west  = () => blocksV1[y][x-1];

        let backPower = 0, side1 = 0, side2 = 0;

        if (dir === 31) {               // output north
            if (dirTest.includes("3") && south()) backPower = south().getNorthPort().getRPower();
            if (dirTest.includes("2") && east())  side1     = east().getWestPort().getRPower();
            if (dirTest.includes("4") && west())  side2     = west().getEastPort().getRPower();

            if (backPower > 0 && backPower > side1 && backPower > side2) {
                blocksV2[y][x].getNorthPort().setRPower(backPower);
                blocksV2[y][x].setImgPower("on");
            } else {
                blocksV2[y][x].getNorthPort().setRPower(0);
                blocksV2[y][x].setImgPower("off");
            }
        }
        else if (dir === 42) {          // output east
            if (dirTest.includes("4") && west())  backPower = west().getEastPort().getRPower();
            if (dirTest.includes("1") && north()) side1     = north().getSouthPort().getRPower();
            if (dirTest.includes("3") && south()) side2     = south().getNorthPort().getRPower();

            if (backPower > 0 && backPower > side1 && backPower > side2) {
                blocksV2[y][x].getEastPort().setRPower(backPower);
                blocksV2[y][x].setImgPower("on");
            } else {
                blocksV2[y][x].getEastPort().setRPower(0);
                blocksV2[y][x].setImgPower("off");
            }
        }
        else if (dir === 13) {          // output south
            if (dirTest.includes("1") && north()) backPower = north().getSouthPort().getRPower();
            if (dirTest.includes("2") && east())  side1     = east().getWestPort().getRPower();
            if (dirTest.includes("4") && west())  side2     = west().getEastPort().getRPower();

            if (backPower > 0 && backPower > side1 && backPower > side2) {
                blocksV2[y][x].getSouthPort().setRPower(backPower);
                blocksV2[y][x].setImgPower("on");
            } else {
                blocksV2[y][x].getSouthPort().setRPower(0);
                blocksV2[y][x].setImgPower("off");
            }
        }
        else if (dir === 24) {          // output west
            if (dirTest.includes("2") && east())  backPower = east().getWestPort().getRPower();
            if (dirTest.includes("1") && north()) side1     = north().getSouthPort().getRPower();
            if (dirTest.includes("3") && south()) side2     = south().getNorthPort().getRPower();

            if (backPower > 0 && backPower > side1 && backPower > side2) {
                blocksV2[y][x].getWestPort().setRPower(backPower);
                blocksV2[y][x].setImgPower("on");
            } else {
                blocksV2[y][x].getWestPort().setRPower(0);
                blocksV2[y][x].setImgPower("off");
            }
        }
    }
}

function redstone_lamp_update(y,x){ //DONE
    blocksV2[y][x] = blocksV1[y][x].clone();
    let dirTest = edgeIdentifier(y,x);
    if (testP){
        //track outputs
        let outputList = ["1","2","3","4"];
        //Max rPower establishment (applies to next 50 something lines of code)
        let powerr = false;

        /*SETTING OUTPUTS
        //If statement checks: 1.check edges; 2.check direction relevance; 3.check if output/redstone dust
        //North
        if (dirTest.includes("1")){
            //regular output case
            if (
                blocksV1[y-1][x].getBlockType() != "redstone_block" && 
                blocksV1[y-1][x].getSouthPort().getIo() == "output" && 
                blocksV1[y-1][x].getSouthPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("1"),1);
                powerr = true;
            }
            else if (
                blocksV1[y-1][x].getBlockType() == "redstone_dust" && 
                blocksV1[y-1][x].getDirection().toString().includes("3") && 
                blocksV1[y-1][x].getSouthPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("1"),1);
                powerr = true;
            }
        }
        //East
        if (dirTest.includes("2")){
            //regular output case
            if (
                blocksV1[y][x+1].getBlockType() != "redstone_block" && 
                blocksV1[y][x+1].getWestPort().getIo() == "output" && 
                blocksV1[y][x+1].getWestPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("2"),1);
                powerr = true;
            }
            else if (
                blocksV1[y][x+1].getBlockType() == "redstone_dust" && 
                blocksV1[y][x+1].getDirection().toString().includes("4") && 
                blocksV1[y][x+1].getWestPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("2"),1);
                powerr = true;
            }
        }
        //South
        if (dirTest.includes("3")){
            //regular output case
            if (
                blocksV1[y+1][x].getBlockType() != "redstone_block" && 
                blocksV1[y+1][x].getNorthPort().getIo() == "output" && 
                blocksV1[y+1][x].getNorthPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("3"),1);
                powerr = true;
            }
            else if (
                blocksV1[y+1][x].getBlockType() == "redstone_dust" && 
                blocksV1[y+1][x].getDirection().toString().includes("1") && 
                blocksV1[y+1][x].getNorthPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("3"),1);
                powerr = true;
            }
        }
        //West
        if (dirTest.includes("4")){
            //regular output case
            if (
                blocksV1[y][x-1].getBlockType() != "redstone_block" && 
                blocksV1[y][x-1].getEastPort().getIo() == "output" && 
                blocksV1[y][x-1].getEastPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("4"),1);
                powerr = true;
            }
            else if (
                blocksV1[y][x-1].getBlockType() == "redstone_dust" && 
                blocksV1[y][x-1].getDirection().toString().includes("2") && 
                blocksV1[y][x-1].getEastPort().getRPower() > 0
                ){
                outputList.splice(outputList.indexOf("4"),1);
                powerr = true;
            }
        }

        //sets outputs in output list as outputs
        if (outputList.includes("1")) blocksV2[y][x].getNorthPort().setIo("output");
        if (outputList.includes("2")) blocksV2[y][x].getEastPort().setIo("output");
        if (outputList.includes("3")) blocksV2[y][x].getSouthPort().setIo("output");
        if (outputList.includes("4")) blocksV2[y][x].getWestPort().setIo("output");
        */


        //SETSPOWERR
        //If statement checks: 1.check edges; 2.check direction relevance; 3.check if output/redstone dust
        //North
        if (dirTest.includes("1")){
            //regular output case
            if (blocksV1[y-1][x].getSouthPort().getIo() == "output" && blocksV1[y-1][x].getSouthPort().getRPower() > 0){
                powerr = true;
            }
            else if (
                blocksV1[y-1][x].getBlockType() == "redstone_dust" && 
                blocksV1[y-1][x].getDirection().toString().includes("3") && 
                blocksV1[y-1][x].getSouthPort().getRPower() > 0
                ){
                powerr = true;
            }
        }
        //East
        if (dirTest.includes("2")){
            //regular output case
            if (blocksV1[y][x+1].getWestPort().getIo() == "output" && blocksV1[y][x+1].getWestPort().getRPower() > 0){
                powerr = true;
            }
            else if (
                blocksV1[y][x+1].getBlockType() == "redstone_dust" && 
                blocksV1[y][x+1].getDirection().toString().includes("4") && 
                blocksV1[y][x+1].getWestPort().getRPower() > 0
                ){
                powerr = true;
            }
        }
        //South
        if (dirTest.includes("3")){
            //regular output case
            if (blocksV1[y+1][x].getNorthPort().getIo() == "output" && blocksV1[y+1][x].getNorthPort().getRPower() > 0){
                powerr = true;
            }
            else if (
                blocksV1[y+1][x].getBlockType() == "redstone_dust" && 
                blocksV1[y+1][x].getDirection().toString().includes("1") && 
                blocksV1[y+1][x].getNorthPort().getRPower() > 0
                ){
                powerr = true;
            }
        }
        //West
        if (dirTest.includes("4")){
            //regular output case
            if (blocksV1[y][x-1].getEastPort().getIo() == "output" && blocksV1[y][x-1].getEastPort().getRPower() > 0){
                powerr = true;
            }
            else if (
                blocksV1[y][x-1].getBlockType() == "redstone_dust" && 
                blocksV1[y][x-1].getDirection().toString().includes("2") && 
                blocksV1[y][x-1].getEastPort().getRPower() > 0
                ){
                powerr = true;
            }
        }

        //on/off establishment
        if (powerr){
            blocksV2[y][x].setImgPower("on");
            if (dirTest.includes("1")) blocksV2[y][x].getNorthPort().setRPower(1); 
            if (dirTest.includes("2")) blocksV2[y][x].getEastPort().setRPower(1);
            if (dirTest.includes("3")) blocksV2[y][x].getSouthPort().setRPower(1);
            if (dirTest.includes("4")) blocksV2[y][x].getWestPort().setRPower(1);
        }
        else {
            blocksV2[y][x].setImgPower("off");
            if (dirTest.includes("1")) blocksV2[y][x].getNorthPort().setRPower(0); 
            if (dirTest.includes("2")) blocksV2[y][x].getEastPort().setRPower(0);
            if (dirTest.includes("3")) blocksV2[y][x].getSouthPort().setRPower(0);
            if (dirTest.includes("4")) blocksV2[y][x].getWestPort().setRPower(0);
        }
    }
    else {
        //no ePower
        blocksV2[y][x].getNorthPort().setEPower(false);
        blocksV2[y][x].getEastPort().setEPower(false);
        blocksV2[y][x].getSouthPort().setEPower(false);
        blocksV2[y][x].getWestPort().setEPower(false);
        
        //turning off lamp
        if (dirTest.includes("1")) blocksV2[y][x].getNorthPort().setRPower(0); 
        if (dirTest.includes("2")) blocksV2[y][x].getEastPort().setRPower(0);
        if (dirTest.includes("3")) blocksV2[y][x].getSouthPort().setRPower(0);
        if (dirTest.includes("4")) blocksV2[y][x].getWestPort().setRPower(0);

        //turns image off
        blocksV2[y][x].setImgPower("off");
    }
}

function cobblestone_update(y,x){ //DONE
    blocksV2[y][x] = blocksV1[y][x].clone();
    let dirTest = edgeIdentifier(y,x);
    //track outputs
    let outputList = ["1","2","3","4"];
    
    //Max rPower establishment
    let powerr = false;

    //If statement checks: 1.check edges; 2.check direction relevance; 3.check if output/redstone dust
    //North
    if (dirTest.includes("1")){
        //regular output case
        if (
            blocksV1[y-1][x].getBlockType() != "redstone_block" && 
            blocksV1[y-1][x].getSouthPort().getIo() == "output" && 
            blocksV1[y-1][x].getSouthPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("1"),1);
            powerr = true;
        }
        else if (
            blocksV1[y-1][x].getBlockType() == "redstone_dust" && 
            blocksV1[y-1][x].getDirection().toString().includes("3") && 
            blocksV1[y-1][x].getSouthPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("1"),1);
            powerr = true;
        }
    }
    //East
    if (dirTest.includes("2")){
        //regular output case
        if (
            blocksV1[y][x+1].getBlockType() != "redstone_block" && 
            blocksV1[y][x+1].getWestPort().getIo() == "output" && 
            blocksV1[y][x+1].getWestPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("2"),1);
            powerr = true;
        }
        else if (
            blocksV1[y][x+1].getBlockType() == "redstone_dust" && 
            blocksV1[y][x+1].getDirection().toString().includes("4") && 
            blocksV1[y][x+1].getWestPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("2"),1);
            powerr = true;
        }
    }
    //South
    if (dirTest.includes("3")){
        //regular output case
        if (
            blocksV1[y+1][x].getBlockType() != "redstone_block" && 
            blocksV1[y+1][x].getNorthPort().getIo() == "output" && 
            blocksV1[y+1][x].getNorthPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("3"),1);
            powerr = true;
        }
        else if (
            blocksV1[y+1][x].getBlockType() == "redstone_dust" && 
            blocksV1[y+1][x].getDirection().toString().includes("1") && 
            blocksV1[y+1][x].getNorthPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("3"),1);
            powerr = true;
        }
    }
    //West
    if (dirTest.includes("4")){
        //regular output case
        if (
            blocksV1[y][x-1].getBlockType() != "redstone_block" && 
            blocksV1[y][x-1].getEastPort().getIo() == "output" && 
            blocksV1[y][x-1].getEastPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("4"),1);
            powerr = true;
        }
        else if (
            blocksV1[y][x-1].getBlockType() == "redstone_dust" && 
            blocksV1[y][x-1].getDirection().toString().includes("2") && 
            blocksV1[y][x-1].getEastPort().getRPower() > 0
            ){
            outputList.splice(outputList.indexOf("4"),1);
            powerr = true;
        }
    }

    //sets outputs in output list as outputs
    if (outputList.includes("1")) blocksV2[y][x].getNorthPort().setIo("output");
    if (outputList.includes("2")) blocksV2[y][x].getEastPort().setIo("output");
    if (outputList.includes("3")) blocksV2[y][x].getSouthPort().setIo("output");
    if (outputList.includes("4")) blocksV2[y][x].getWestPort().setIo("output");

    //on/off establishment
    if (powerr){
        blocksV2[y][x].setImgPower("on");
        if (dirTest.includes("1")) blocksV2[y][x].getNorthPort().setRPower(1); 
        if (dirTest.includes("2")) blocksV2[y][x].getEastPort().setRPower(1);
        if (dirTest.includes("3")) blocksV2[y][x].getSouthPort().setRPower(1);
        if (dirTest.includes("4")) blocksV2[y][x].getWestPort().setRPower(1);
    }
    else {
        blocksV2[y][x].setImgPower("off");
        if (dirTest.includes("1")) blocksV2[y][x].getNorthPort().setRPower(0); 
        if (dirTest.includes("2")) blocksV2[y][x].getEastPort().setRPower(0);
        if (dirTest.includes("3")) blocksV2[y][x].getSouthPort().setRPower(0);
        if (dirTest.includes("4")) blocksV2[y][x].getWestPort().setRPower(0);
    }
}

//----------------------- Level System ------------------------
const levels = [
    {
        id: 1,
        name: "Basics",
        description: "Connect the redstone block to the lamp",
        gridY: 6,
        gridX: 4,
        startBlocks: [
            { y: 0, x: 0, type: "redstone_block" },
            { y: 0, x: 3, type: "redstone_lamp" }
        ],
        locked: [],
        inventory: {
            redstone_dust: 2,
            redstone_repeator: 0,
            redstone_comparator: 0,
            redstone_lamp: 0,
            cobblestone: 0,
            redstone_block: 0
        },
        winCondition: {
            type: "lamp_lit",
            y: 0,
            x: 3
        }
    },
    {
        id: 2,
        name: "Severed Wires",
        description: "Power the lamp...",
        gridY: 6,
        gridX: 6,
        startBlocks: [
            { y: 0, x: 0, type: "redstone_block" },
            { y: 5, x: 5, type: "redstone_lamp" }
        ],
        locked: [],
        inventory: {
            redstone_dust: 8,
            redstone_repeator: 2,
            redstone_comparator: 0,
            redstone_lamp: 0,
            cobblestone: 0,
            redstone_block: 0
        },
        winCondition: {
            type: "lamp_lit",
            y: 5,
            x: 5
        }
    },
    {
        id: 3,
        name: "Comparator assembly",
        description: "Power the lamp...",
        gridY: 6,
        gridX: 6,
        startBlocks: [
            { y: 0, x: 0, type: "redstone_block" },
            { y: 5, x: 5, type: "redstone_lamp" }
        ],
        locked: [
            { y: 5, x: 4, type: "cobblestone" },
            { y: 4, x: 5, type: "cobblestone" }
        ],
        inventory: {
            redstone_dust: 6,
            redstone_repeator: 0,
            redstone_comparator: 3,
            redstone_lamp: 0,
            cobblestone: 0,
            redstone_block: 0
        },
        winCondition: {
            type: "lamp_lit",
            y: 5,
            x: 5
        }
    },
    {
        id: 4,
        name: "The OBL files",
        description: "",
        gridY: 8,
        gridX: 8,
        startBlocks: [
            { y: 0, x: 0, type: "redstone_block" },
            { y: 6, x: 6, type: "redstone_lamp" }
        ],
        locked: [],
        inventory: {
            redstone_dust: 2,
            redstone_repeator: 2,
            redstone_comparator: 2,
            redstone_lamp: 0,
            cobblestone: 50,
            redstone_block: 0
        },
        winCondition: {
            type: "lamp_lit",
            y: 6,
            x: 6
        }
    }
];

// Game state variables
let lockedCells = new Set();
let currentLevel = null;
let currentLevelIndex = -1;
let inventory = {};
let levelBackup = null;
let levelSelectInitialized = false;

//----------------------- Level Loading ------------------------

function loadLevel(index) {
    if (index < 0 || index >= levels.length) {
        console.error("Invalid level index:", index);
        return false;
    }
    
    console.log(`Loading level ${index + 1}...`);
    
    // Update current level
    currentLevelIndex = index;
    currentLevel = levels[index];
    
    // Update level description
    const descEl = document.getElementById("levelDescription");
    if (descEl) {
        descEl.innerHTML = `<strong>Level ${currentLevel.id}: ${currentLevel.name}</strong><br>${currentLevel.description}`;
    }
    
    // Update active button state
    document.querySelectorAll('.level-btn').forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Set grid dimensions
    setGridCount(currentLevel.gridY, currentLevel.gridX);
    
    // Clear locked cells
    lockedCells.clear();
    
    // Initialize empty grid
    blocksV1 = Array.from({length: currentLevel.gridY}, () => 
        Array.from({length: currentLevel.gridX}, () => genEmptyBlock())
    );
    
    // Place start blocks
    if (currentLevel.startBlocks && currentLevel.startBlocks.length > 0) {
        currentLevel.startBlocks.forEach(block => {
            if (block.y < currentLevel.gridY && block.x < currentLevel.gridX) {
                blocksV1[block.y][block.x] = genBlock(block.type, block.y, block.x);
                
                // Set direction if specified
                if (block.direction !== undefined) {
                    blocksV1[block.y][block.x].setDirection(block.direction);
                }
            }
        });
    }
    
    // Place locked blocks
    if (currentLevel.locked && currentLevel.locked.length > 0) {
        currentLevel.locked.forEach(block => {
            if (block.y < currentLevel.gridY && block.x < currentLevel.gridX) {
                blocksV1[block.y][block.x] = genBlock(block.type, block.y, block.x);
                lockedCells.add(`${block.y},${block.x}`);
                
                // Set direction if specified
                if (block.direction !== undefined) {
                    blocksV1[block.y][block.x].setDirection(block.direction);
                }
            }
        });
    }
    
    // Initialize inventory
    inventory = { ...currentLevel.inventory };
    
    // Sync blocksV2
    blocksV2 = blocksV1.map(row => 
        row.map(block => block.clone())
    );
    
    // Create backup
    createLevelBackup();
    
    // Update displays
    selectionRemoval();
    updateInventoryDisplay();
    update();
    return true;
}

function createLevelBackup() {
    if (!currentLevel) return;
    
    levelBackup = {
        blocks: blocksV1.map(row => row.map(block => block.clone())),
        inventory: { ...inventory },  // Saves the initial inventory
        lockedCells: new Set(lockedCells)
    };
}
function resetLevel() {
    if (!levelBackup || currentLevelIndex === -1) {
        console.log("No level to reset");
        return;
    }
    
    console.log(`Resetting level ${currentLevel.id}`);
    
    // Restore blocks from backup
    blocksV1 = levelBackup.blocks.map(row => 
        row.map(block => block.clone())
    );
    
    // Restore inventory from backup (this replenishes everything)
    inventory = { ...levelBackup.inventory };
    
    // Restore locked cells
    lockedCells = new Set(levelBackup.lockedCells);
    
    // Sync blocksV2
    blocksV2 = blocksV1.map(row => 
        row.map(block => block.clone())
    );
    
    // Update displays
    selectionRemoval();
    updateInventoryDisplay();
    update();
    hideMessages();
    
    console.log("Inventory replenished:", inventory);
}

// Update inventory display and palette visibility
function updateInventoryDisplay() {
    // Update palette item visibility and count badges
    document.querySelectorAll('.options[data-opt]').forEach(option => {
        const optType = option.dataset.opt;
        
        // Skip book and air (always available)
        if (optType === 'book' || optType === 'air') {
            option.classList.remove('inventory-empty');
            return;
        }
        
        const count = inventory[optType] || 0;
        const badge = document.getElementById(`count-${optType}`);
        
        if (badge) {
            badge.textContent = count;
            
            // Update badge color based on count
            if (count <= 0) {
                badge.style.background = '#8b0000'; // Red for empty
            } else {
                badge.style.background = '#4CAF50'; // Green for available
            }
        }
        
        // Add/remove empty class for visual feedback
        if (count <= 0) {
            option.classList.add('inventory-empty');
        } else {
            option.classList.remove('inventory-empty');
        }
    });
}

// Format item name for display
function formatItemName(item) {
    return item.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

//----------------------- Submit & Victory ------------------------

function submitSolution() {
    if (!currentLevel) {
        alert("No level loaded!");
        return;
    }
    
    console.log("⚡ Submitting solution...");
    showProcessing(true);
    
    // Turn on test mode
    testP = true;
    
    // Simulate redstone propagation (50 updates)
    let updates = 0;
    const maxUpdates = 50;
    
    function runUpdate() {
        if (updates < maxUpdates) {
            update();
            updates++;
            setTimeout(runUpdate, 30); // Small delay for visual feedback
        } else {
            // Finished all updates, check victory
            setTimeout(checkVictory, 100);
        }
    }
    
    runUpdate();
}

function checkVictory() {
    showProcessing(false);
    
    if (!currentLevel) return;
    
    const winCond = currentLevel.winCondition;
    let victory = false;
    
    // Check win condition
    if (winCond.type === "lamp_lit") {
        const lamp = blocksV1[winCond.y][winCond.x];
        victory = (lamp && 
                  lamp.getBlockType() === "redstone_lamp" && 
                  lamp.getImgPower() === "on");
    }
    
    // Turn off test mode
    testP = false;
    
    if (victory) {
        console.log(`Circuit ${currentLevel.id} complete!`);
        showVictoryMessage(); // This now handles both message and level advance
    } else {
        showFailureMessage();
        console.log("Still broken...");
    }
}

//----------------------- UI Functions ------------------------

function showProcessing(show) {
    let indicator = document.getElementById("processingIndicator");
    if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "processingIndicator";
        indicator.textContent = "Booting up...";
        document.body.appendChild(indicator);
    }
    indicator.style.display = show ? "block" : "none";
}

function showVictoryMessage() {
    hideMessages();
    
    const msg = document.createElement("div");
    msg.id = "victoryMessage";
    msg.className = "victory-message";
    msg.innerHTML = `
        <div style="background: #818181; color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2>Circuit fixed...</h2>
            <p>Moving on...</p>
        </div>
    `;
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        animation: fadeIn 0.5s;
    `;
    document.body.appendChild(msg);
    
    // Message disappears after 3 seconds, then move to next level
    setTimeout(() => {
        msg.remove();
        
        // Move to next level after message is gone
        if (currentLevelIndex < levels.length - 1) {
            loadLevel(currentLevelIndex + 1);
        } else {
            showGameComplete();
        }
    }, 3000);
}

function showFailureMessage() {
    hideMessages();
    
    const msg = document.createElement("div");
    msg.id = "failureMessage";
    msg.className = "failure-message";
    msg.innerHTML = `
        <div style="background: #a70b00; color: white; padding: 15px; border-radius: 10px; text-align: center;">
            <p>Try again, still broken,</p>
        </div>
    `;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        animation: slideIn 0.3s;
    `;
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 2000);
}

function showGameComplete() {}

function hideMessages() {
    const victoryMsg = document.getElementById("victoryMessage");
    const failureMsg = document.getElementById("failureMessage");
    if (victoryMsg) victoryMsg.remove();
    if (failureMsg) failureMsg.remove();
}

//----------------------- Initialize Level Selector ------------------------

function initializeLevelSelector() {
    if (levelSelectInitialized) return;
    
    const selector = document.getElementById("levelSelector");
    if (!selector) return;
    
    // Clear any existing buttons
    selector.innerHTML = "";
    
    // Create level buttons
    levels.forEach((level, index) => {
        const btn = document.createElement("button");
        btn.className = "level-btn";
        btn.textContent = `Level ${level.id}`;
        btn.title = level.name;
        btn.onclick = () => loadLevel(index);
        selector.appendChild(btn);
    });
    
    levelSelectInitialized = true;
    console.log("Level selector initialized");
}

//----------------------- Override Global Functions ------------------------

// Override reset
window.reset = function() {
    resetLevel();
};

// Override blockSubstitution to handle book rotation and air placement
window.blockSubstitution = function() {
    const r = +selectedBlock.dataset.row;
    const c = +selectedBlock.dataset.col;
    
    // Check if cell is locked
    if (lockedCells.has(`${r},${c}`)) {
        alert("This block is fixed and cannot be changed!");
        return;
    }
    
    const optData = selectedOption.dataset.opt;
    
    // Handle book rotation
    if (optData === 'book') {
        const currentBlock = blocksV1[r][c];
        const blockType = currentBlock.getBlockType();
        
        // Only rotate repeaters and comparators
        if (blockType === 'redstone_repeator' || blockType === 'redstone_comparator') {
            // Rotate the block using genBlock with same position
            const rotatedBlock = genBlock(blockType, r, c);
            
            // Get current direction and cycle to next
            const currentDir = currentBlock.getDirection();
            let newDir;
            
            // Direction cycling: 31 -> 42 -> 13 -> 24 -> back to 31
            if (currentDir === 31) newDir = 42;
            else if (currentDir === 42) newDir = 13;
            else if (currentDir === 13) newDir = 24;
            else if (currentDir === 24) newDir = 31;
            else newDir = 31; // Default if unknown
            
            rotatedBlock.setDirection(newDir);
            
            // Update the ports based on new direction
            if (blockType === 'redstone_repeator') {
                // Update repeater ports based on new direction
                const surBlock = [
                    (r > 0) ? blocksV1[r-1][c].getBlockType() : "air",
                    (c < gridX-1) ? blocksV1[r][c+1].getBlockType() : "air",
                    (r < gridY-1) ? blocksV1[r+1][c].getBlockType() : "air",
                    (c > 0) ? blocksV1[r][c-1].getBlockType() : "air"
                ];
                
                if (newDir === 31) { // North output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "output", true),
                        new Port(false, 0, surBlock[1], "none", false),
                        new Port(false, 0, surBlock[2], "input", true),
                        new Port(false, 0, surBlock[3], "none", false)
                    ];
                } else if (newDir === 42) { // East output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "none", false),
                        new Port(false, 0, surBlock[1], "output", true),
                        new Port(false, 0, surBlock[2], "none", false),
                        new Port(false, 0, surBlock[3], "input", true)
                    ];
                } else if (newDir === 13) { // South output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "input", true),
                        new Port(false, 0, surBlock[1], "none", false),
                        new Port(false, 0, surBlock[2], "output", true),
                        new Port(false, 0, surBlock[3], "none", false)
                    ];
                } else if (newDir === 24) { // West output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "none", false),
                        new Port(false, 0, surBlock[1], "input", true),
                        new Port(false, 0, surBlock[2], "none", false),
                        new Port(false, 0, surBlock[3], "output", true)
                    ];
                }
            } else if (blockType === 'redstone_comparator') {
                // Update comparator ports based on new direction
                const surBlock = [
                    (r > 0) ? blocksV1[r-1][c].getBlockType() : "air",
                    (c < gridX-1) ? blocksV1[r][c+1].getBlockType() : "air",
                    (r < gridY-1) ? blocksV1[r+1][c].getBlockType() : "air",
                    (c > 0) ? blocksV1[r][c-1].getBlockType() : "air"
                ];
                
                if (newDir === 31) { // North output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "output", true),
                        new Port(false, 0, surBlock[1], "input", true),
                        new Port(false, 0, surBlock[2], "input", true),
                        new Port(false, 0, surBlock[3], "input", true)
                    ];
                } else if (newDir === 42) { // East output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "input", true),
                        new Port(false, 0, surBlock[1], "output", true),
                        new Port(false, 0, surBlock[2], "input", true),
                        new Port(false, 0, surBlock[3], "input", true)
                    ];
                } else if (newDir === 13) { // South output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "input", true),
                        new Port(false, 0, surBlock[1], "input", true),
                        new Port(false, 0, surBlock[2], "output", true),
                        new Port(false, 0, surBlock[3], "input", true)
                    ];
                } else if (newDir === 24) { // West output
                    rotatedBlock.portsList = [
                        new Port(false, 0, surBlock[0], "input", true),
                        new Port(false, 0, surBlock[1], "input", true),
                        new Port(false, 0, surBlock[2], "input", true),
                        new Port(false, 0, surBlock[3], "output", true)
                    ];
                }
            }
            
            // Update the image path
            rotatedBlock.setImg();
            blocksV1[r][c] = rotatedBlock;
            update();
        } else {
            alert("Book can only be used on repeaters and comparators!");
        }
        return;
    }
    
    // Handle air placement (free, no inventory cost)
    if (optData === 'air') {
        // Get the current block type before replacing with air
        const currentBlockType = blocksV1[r][c].getBlockType();
        
        // If the current block is not air and not a locked block, return its item to inventory
        if (currentBlockType !== 'air' && !lockedCells.has(`${r},${c}`)) {
            // Check if it's a block that costs inventory (not redstone_block or lamp if they're start blocks)
            if (currentBlockType !== 'redstone_block' && currentBlockType !== 'redstone_lamp') {
                // Return the item to inventory
                if (inventory.hasOwnProperty(currentBlockType)) {
                    inventory[currentBlockType]++;
                }
            }
        }
        
        // Place air
        blocksV1[r][c] = genBlock(optData, r, c);
        
        // Update inventory display
        updateInventoryDisplay();
        update();
        return;
    }
    
    // Check inventory for other items
    if (useInventoryItem(optData)) {
        // Get the current block type before replacing
        const currentBlockType = blocksV1[r][c].getBlockType();
        
        // If the current block is not air and not a locked block, return its item to inventory
        if (currentBlockType !== 'air' && !lockedCells.has(`${r},${c}`)) {
            // Check if it's a block that costs inventory (not redstone_block or lamp if they're start blocks)
            if (currentBlockType !== 'redstone_block' && currentBlockType !== 'redstone_lamp') {
                // Return the item to inventory
                if (inventory.hasOwnProperty(currentBlockType)) {
                    inventory[currentBlockType]++;
                }
            }
        }
        
        blocksV1[r][c] = genBlock(optData, r, c);
        updateInventoryDisplay();
        update();
    } else {
        alert(`No ${formatItemName(optData)} left!`);
    }
};

// Then find your useInventoryItem function and replace it with this:
function useInventoryItem(itemType) {
    // Book and air are unlimited (always return true)
    if (itemType === 'book' || itemType === 'air') {
        return true;
    }
    
    // Check if item exists in inventory and has count > 0
    if (inventory.hasOwnProperty(itemType) && inventory[itemType] > 0) {
        inventory[itemType]--;
        updateInventoryDisplay();
        return true;
    }
    return false;
}

//----------------------- Initialize on Load ------------------------

document.addEventListener("DOMContentLoaded", function() {
    console.log("Initializing game...");
    
    // Create level selector buttons
    initializeLevelSelector();
    
    // Load first level
    if (levels.length > 0) {
        setTimeout(() => loadLevel(0), 100);
    }
});

/*
//SECTION API
-----------------------------------------------------------------------------------------
//NOTE Notes:

        1
    4   +   2
        3
---------------------
        N
    W   +   E
        S
        
        
Procedure loop:
> extract 2D list from grid
> translate all blocks to a list of objects
> analyze list of objects
    > All blocks check surrounding in version 1
    > If the block powering the current block was ON in version 1
    
> implement updates to blocks

- Note, this will make the redstone travel -1 for every update
- A block being powered cannot power the block being powered
-----------------------------------------------------------------------------------------
//NOTE Hierarchy & Typing

Variables/Parameters (ports):
*ePower - boolean
    - true - power is detected/passed
    - false - power is absent/retains

*rPower - integer 
    - (0-16)
    - 16 - reserved for power blocks
    - 0 - no (more) power

*type - string
    - "redstone_block" x
    - "redstone_dust" x
    - "redstone_repeator" 
    - "redstone_comparator"
    - "redstone_lamp" x
    - "cobblestone" x
    - "air" x

    deprecated:
    - "oak_button"
    - "lever"
    - "note_block"
    - "observer"

*io - string
    - "input" - input port
    - "output" - output port
    - "none" - regular port
    *outputs flow into inputs

*Priority(output ports) - boolean
    - true - priority connection 
    - false - no priority or empty port
//!SECTION
*/
