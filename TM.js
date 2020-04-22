testCount = 0;
passCount = 0;
failCount = 0;
TEST_ON = false;
cellCount = 0;

class Instruction
{
    constructor(string)
    {
        if(!validateInstruction(string))
        {
            throw `Instruction "${string}" is not valid!`;
        }
        
        const instructionData = string.split(",");

        this.instructionId = parseInt(instructionData[0]);
        this.condition = instructionData[1];
        this.command = instructionData[2];
        this.nextInstructionId = parseInt(instructionData[3]);
    }

    toString()
    {
        return `${this.instructionId},${this.condition},${this.command},${this.nextInstructionId}`;
    }
}

class InstructionSet
{
    constructor(instructionsString)
    {
        var instructionList = splitInstructionSet(instructionsString);

        try
        {
            validateInstructionSet(instructionList);
        }
        catch(collision)
        {
            throw "Collision between instructions: '" + collision[0].toString() + "' and '" + collision[1].toString() + "'!";
        }

        this.instructionList = instructionList;
    }

    findInstruction(id, condition)
    {
        for(var index = 0; index < this.instructionList.length; index++)
        {
            if(id === this.instructionList[index].instructionId &&
               condition === this.instructionList[index].condition)
            {
                return this.instructionList[index];
            }
        }

        return null;
    }

    instructionWithIdExists(id)
    {
        for(var index = 0; index < this.instructionList.length; index++)
        {
            if(id === this.instructionList[index].instructionId)
            {
                return true;
            }
        }

        return false;
    }
}

class Tape
{
    constructor(input)
    {
        this.root = new Cell(null, null);

        if(input !== undefined && input !== "")
        {
            if(!validateInput(input))
            {
                throw "This input: \"" + input + "\" is not valid!";
            }

            var head = new Head(this);

            for(var index = 0; index < input.length - 1; index++)
            {
                head.write(input.charAt(index));
                head.moveRight();
            }
            head.write(input.charAt(input.length - 1));
        }
    }

    print()
    {
        var head = new Head(this);

        head.goToLeftEnd();

        var string = "" + head.read();

        while(!head.isAtRightEnd())
        {
            head.moveRight();
            string += head.read();
        }

        return string;
    }
}

class Cell //Node
{
    constructor(left, right)
    {
        this.symbol = "0";
        this.left = left;
        this.right = right;
        this.serialNumber = cellCount;
        cellCount++;
    }
}

class Head //Iterator
{
    constructor(tape)
    {
        this.tape = tape;
        this.currentCell = tape.root;
    }

    read()
    {
        return this.currentCell.symbol;
    }

    write(symbol)
    {
        if(symbol !== "0" && symbol !== "1")
        {
            throw "Cannot write the symbol '" + symbol + "' to the tape!";
        }

        this.currentCell.symbol = symbol;
    }

    isAtLeftEnd()
    {
        return this.currentCell.left === null;
    }

    isAtRightEnd()
    {
        return this.currentCell.right === null;
    }

    moveLeft()
    {
        if(this.isAtLeftEnd())
        {
            this.currentCell.left = new Cell(null, this.currentCell);
        }

        this.currentCell = this.currentCell.left;
    }

    moveRight()
    {
        if(this.isAtRightEnd())
        {
            this.currentCell.right = new Cell(this.currentCell, null);
        }

        this.currentCell = this.currentCell.right;
    }

    goToLeftEnd()
    {
        while(!this.isAtLeftEnd())
        {
            this.moveLeft();
        }
    }

    cellSerialNumber()
    {
        return this.currentCell.serialNumber;
    }
}

class Machine
{
    constructor(input, instructions, initialInstructionId, logger)
    {
        this.logger = logger;
        this.tape = new Tape(input);
        this.head = new Head(this.tape);
        this.instructionSet = new InstructionSet(instructions);
        this.initialInstructionId = initialInstructionId;

        this.logger.log(this);

        if(!this.instructionSet.instructionWithIdExists(initialInstructionId))
        {
            throw "This initial instruction is not contained in the instruction set!";
        }

        this.currentInstruction = this.instructionSet.findInstruction(initialInstructionId, this.head.read());
        this.status = "running";
    }

    run()
    {
        if(this.status === "running")
        {
            this.executeCommand(this.currentInstruction);
            this.logger.log(this);

            var nextInstructionId = this.currentInstruction.nextInstructionId;
            this.currentInstruction = this.instructionSet.findInstruction(nextInstructionId, this.head.read());

            if(this.currentInstruction === null)
            {
                this.status = "halted";
            }
        }
    }

    executeCommand(instruction)
    {
        if(instruction.command === "0")
        {
            this.head.write("0");
        }
        else if(instruction.command === "1")
        {
            this.head.write("1");
        }
        else if(instruction.command === "L")
        {
            this.head.moveLeft();
        }
        else if(instruction.command === "R")
        {
            this.head.moveRight();
        }
        else
        {
            throw "This is not an acceptable command!";
        }
    }

    printTape()
    {
        return this.tape.print();
    }

    printCurrentInstruction()
    {
        return this.currentInstruction.toString();
    }

    headCurrentIndex()
    {
        var tempHead = new Head(this.tape);
        var index = 0;

        tempHead.goToLeftEnd();

        while(tempHead.cellSerialNumber() !== this.head.cellSerialNumber())
        {
            tempHead.moveRight();
            index++;
        }

        return index;
    }

}

class LogEntry
{
    constructor(tape, currentInstruction, headIndex)
    {
        this.tape = tape;
        this.currentInstruction = currentInstruction;
        this.headIndex = headIndex;
    }

    printCurrentInstruction()
    {
        if(this.currentInstruction != undefined)
        {
            return this.currentInstruction.toString();
        }
    }
}

class Logger
{
    constructor()
    {
        this.logger = new Array();
    }

    log(machine)
    {
        this.logger.push(new LogEntry(machine.tape.print(), machine.currentInstruction, machine.headCurrentIndex()));
    }

    lastEntry()
    {
        return this.logger[this.logger.length - 1];
    }
}

$(document).ready(main);

function CHECK(assertion)
{
    testCount++;
    var testPass = eval(assertion);

    if(testPass)
    {
        passCount++;
    }
    else
    {
        failCount++;
        console.log("Test number " + testCount + ", \"CHECK('" + assertion + ")\" FAILED!");
    }

}

function CHECK_NOTHROW(assertionString)
{

    testCount++;

    try
    {
        eval(assertionString);
    }
    catch(err)
    {
        failCount++;
        console.log("Test number " + testCount + ", \"CHECK_NOTHROW(" + assertionString + ")\"" + " FAILED with exception: " + err + "");
        return;
    }

    passCount++;
}

function CHECK_THROWS(assertionString)
{
    testCount++;

    try
    {
        eval(assertionString);
    }
    catch(err)
    {
        passCount++;
        return;
    }

    failCount++;
    console.log("Test number " + testCount + ", \"CHECK_THROWS(" + assertionString  + ")\"" + "FAILED!");
}

function validateInput(input)
{
    var regex = /^(0|1)*$/;
    return regex.test(input);
}

function validateInstruction(instruction)
{
    var regex = /^(\d+),(0|1),(0|1|L|R),(\d+)$/;
    return regex.test(instruction);
}

function splitInstructionSet(instructionSet)
{
    var rawInstructionsList = instructionSet.split("\n");
    var instructionSet = [];

    for(var index = 0; index < rawInstructionsList.length; index++)
    {
        instructionSet.push(new Instruction(rawInstructionsList[index]));
    }

    return instructionSet;
}

function instructionsCollide(instruction1, instruction2)
{
    return instruction1.instructionId == instruction2.instructionId &&
           instruction1.condition == instruction2.condition;
}

function validateInstructionSet(instructionSet)
{
    for(index1 = 0; index1 < instructionSet.length; index1++)
    {
        for(index2 = index1 + 1; index2 < instructionSet.length; index2++)
        {
            if(instructionsCollide(instructionSet[index1], instructionSet[index2]))
            {
                throw [instructionSet[index1], instructionSet[index2]];
            }
        }
    }
}

function cleanPrintArea()
{
    $("#print-area").html("");
    lineCount = 0;
}

function setButtonClick()
{
    var input = $("#data-input").val();
    var instructions = $("#instructions-input").val();
    var initialInstructionId = parseInt($("#initial-input").val());
    var logger = new Logger();

    try
    {
        machine = new Machine(input, instructions, initialInstructionId, logger);
    }
    catch(err)
    {
        alert(err);
    }

    cleanPrintArea();
}

function printLine(logger)
{
    logger = machine.logger;
    //FIXME!
    var html = "";
    var tape = logger.lastEntry().tape;
    var currentInstruction = logger.lastEntry().currentInstruction;
    var headIndex = logger.lastEntry().headIndex;

    html += "<div>"
    html += "<span class='number'>" + lineCount + ".</span>";

    for(var i = 0; i < tape.length; i++)
    {
        id = "" + lineCount + "_" + (i + 1);
        html += "<span class='tape' " + "id='" + id + "'>" + tape.charAt(i) + "</span>";
    }

    html += "<span class='instruction'>" + currentInstruction + "</span>";
    html += "</div>"

    $("#print-area").append(html);    

    var id = "#" + lineCount + "_" + (headIndex + 1);
    $(id).css("background-color", "yellow");

    lineCount++;

}


//FIXME!
var machine;
var logger;
var lineCount = 1;

function main()
{
    /* Run Tests */
    TEST();
    
    //Program
    $("#set-button").click(setButtonClick);
    $("#run-button").click(function ()
    {
        try
        {
            if(machine.status === "running")
            {
                machine.run();
                printLine(logger);
            }
            else if(machine.status === "halted")
            {
                throw "Machine is halted!";
            }
        }
        catch(err)
        {
            alert(err);
        }
    });


}


function TEST()
{
    if(TEST_ON)
    
    {
        //Validate Input
        CHECK('validateInput("")');
        CHECK('validateInput("1001")');
        CHECK('validateInput("1101")');
        CHECK('validateInput("1111")');

        CHECK('!validateInput("1001a")');
        CHECK('!validateInput("100231")');
        CHECK('!validateInput("1001 ")');

        //Validate Instruction
        CHECK('validateInstruction("1,0,L,232")');
        CHECK('validateInstruction("234,1,R,232")');
        CHECK('validateInstruction("123123123,0,0,232")');
        CHECK('validateInstruction("1,1,1,34")');

        CHECK('!validateInstruction("1,,1,232")');
        CHECK('!validateInstruction("-1,0,L,232")');
        CHECK('!validateInstruction("d,0,L,232")');
        CHECK('!validateInstruction("1,R,L,232")');

        //Instruction Creation
        CHECK_NOTHROW('new Instruction("1,0,L,232")');
        CHECK_NOTHROW('new Instruction("234,1,R,232")');
        CHECK_NOTHROW('new Instruction("123123123,0,0,232")');
        CHECK_NOTHROW('new Instruction("1,1,1,34")');

        CHECK_THROWS('new Instruction("1,,1,232")');
        CHECK_THROWS('new Instruction("-1,0,L,232")');
        CHECK_THROWS('new Instruction("d,0,L,232")');
        CHECK_THROWS('new Instruction("1,R,L,232")');

        //Instruction toString
        CHECK('(new Instruction("1,0,L,232")).toString() === "1,0,L,232"');
        CHECK('(new Instruction("234,1,R,232")).toString() === "234,1,R,232"');
        CHECK('(new Instruction("123123123,0,0,232")).toString() === "123123123,0,0,232"');
        CHECK('(new Instruction("1,1,1,34")).toString() === "1,1,1,34"');

        //Instruction Set Splitting
        CHECK_NOTHROW('splitInstructionSet("1,0,L,1;1,1,R,2;2,0,0,2")');

        testInstructionList = splitInstructionSet("1,0,L,1;1,1,R,2;2,0,0,2");
        CHECK('testInstructionList.length === 3');

        testInstruction1 = testInstructionList[0];
        testInstruction2 = testInstructionList[1];
        testInstruction3 = testInstructionList[2];

        CHECK('testInstruction1.instructionId === 1');
        CHECK('testInstruction1.condition === "0"');
        CHECK('testInstruction1.command === "L"');
        CHECK('testInstruction1.nextInstructionId === 1');

        CHECK('testInstruction2.instructionId === 1');
        CHECK('testInstruction2.condition === "1"');
        CHECK('testInstruction2.command === "R"');
        CHECK('testInstruction2.nextInstructionId === 2');

        CHECK('testInstruction3.instructionId === 2');
        CHECK('testInstruction3.condition === "0"');
        CHECK('testInstruction3.command === "0"');
        CHECK('testInstruction3.nextInstructionId === 2');

        //Instruction Set
        CHECK_NOTHROW('new InstructionSet("1,0,L,1;1,1,R,2;2,0,0,2")');
        CHECK_THROWS('new InstructionSet("1,0,L,1;1,1,R,2;1,0,0,2")');

        testInstructionSet = new InstructionSet("1,0,L,1;1,1,R,2;2,0,0,2");
        testInstructionFound = testInstructionSet.findInstruction(1,"0");

        CHECK('testInstructionFound.instructionId === 1');
        CHECK('testInstructionFound.condition === "0"');
        CHECK('testInstructionFound.command === "L"');

        //Tape
        testTape = new Tape;
        CHECK('testTape.root.symbol === "0"');
        CHECK('testTape.root.left === null');
        CHECK('testTape.root.right === null');

        //Cells & Head
        testHead = new Head(testTape);

        CHECK('testHead.read() === "0"');
        CHECK('testHead.isAtLeftEnd()');
        CHECK('testHead.isAtRightEnd()');

        testHead.moveLeft();

        CHECK('testHead.read() === "0"');
        CHECK('testHead.isAtLeftEnd()');
        CHECK('!testHead.isAtRightEnd()');

        testHead.write("1");

        CHECK('testHead.read() === "1"');
        CHECK('testHead.isAtLeftEnd()');
        CHECK('!testHead.isAtRightEnd()');

        testHead.moveRight();

        CHECK('testHead.read() === "0"');
        CHECK('!testHead.isAtLeftEnd()');
        CHECK('testHead.isAtRightEnd()');

        testHead.moveRight();
        testHead.write("1");
        testHead.moveRight();
        testHead.moveRight();

        CHECK('testTape.print() === "10100"');

        //Tape 2
        testTape2 = new Tape("011011");
        CHECK('testTape2.print() === "011011"');

        //Machine
        testLogger = new Logger();
        testMachine = new Machine("1", "1,1,R,1;1,0,1,1", 1, testLogger);

        CHECK('testMachine.printTape() === "1"');
        CHECK('testMachine.headCurrentIndex() == 0');
        testMachine.run();
        CHECK('testMachine.printTape() === "10"');
        CHECK('testMachine.headCurrentIndex() == 1');
        testMachine.run();
        CHECK('testMachine.printTape() === "11"');
        CHECK('testMachine.headCurrentIndex() == 1');
        testMachine.run();
        CHECK('testMachine.printTape() === "110"');
        CHECK('testMachine.headCurrentIndex() == 2');
        testMachine.run();
        CHECK('testMachine.printTape() === "111"');
        CHECK('testMachine.headCurrentIndex() == 2');
        testMachine.run();
        CHECK('testMachine.printTape() === "1110"');
        CHECK('testMachine.headCurrentIndex() == 3');
        testMachine.run();
        CHECK('testMachine.printTape() === "1111"');
        CHECK('testMachine.headCurrentIndex() == 3');

        //Logger
        console.log(testLogger);
        for(var i = 0; i < testLogger.logger.length; i++)
        {
            console.log(testLogger.logger[i].tape, testLogger.logger[i].printCurrentInstruction(), testLogger.logger[i].headIndex);
        }

        //Test Summary
        console.log("Tests: " + testCount + " Pass: " + passCount + " Fail: " + failCount);
    }
}