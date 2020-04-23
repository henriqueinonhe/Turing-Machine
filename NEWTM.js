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
        let instructionList = splitInstructionSet(instructionsString);

        try
        {
            validateInstructionSet(instructionList);
        }
        catch(collision)
        {
            throw `Collision between instructions: "${collision[0].toString()}" and "${collision[1].toString()}" !`;
        }

        this.instructionList = instructionList;
    }

    findInstruction(id, condition)
    {
        const result = this.instructionList.find(currentInstruction => id == currentInstruction.id &&
                                                                       condition == currentInstruction.condition);

        // for(let index = 0; index < this.instructionList.length; index++)
        // {
        //     if(id === this.instructionList[index].instructionId &&
        //        condition === this.instructionList[index].condition)
        //     {
        //         return this.instructionList[index];
        //     }
        // }


        return result !== undefined ? result : null;
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

function splitInstructionSet(instructionSetString)
{
    var rawInstructionsList = instructionSetString.split("\n");
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