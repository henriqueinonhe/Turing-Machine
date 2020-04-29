class Instruction
{
    static validateInstruction(instruction)
    {
        const regex = /^(\d+),(0|1),(0|1|L|R),(\d+)$/;
        return regex.test(instruction);
    }

    constructor(string)
    {
        if(!Instruction.validateInstruction(string))
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
    static splitInstructionSet(instructionSetString)
    {
        const rawInstructionStringList = instructionSetString.split("\n");
        const instructionList = rawInstructionStringList.map(instruction => new Instruction(instruction));
        return instructionList;
    }

    static validateInstructionList(instructionSet)
    {
        for(let index1 = 0; index1 < instructionSet.length; index1++)
        {
            for(let index2 = index1 + 1; index2 < instructionSet.length; index2++)
            {
                if(InstructionSet.instructionsCollide(instructionSet[index1], instructionSet[index2]))
                {
                    throw `Collision between instructions: "${instructionSet[index1].toString()}" and "${instructionSet[index2].toString()}" !`;
                }
            }
        }
    }

    static instructionsCollide(instruction1, instruction2)
    {
        return instruction1.instructionId == instruction2.instructionId &&
               instruction1.condition == instruction2.condition;
    }

    constructor(instructionsString)
    {
        const instructionList = InstructionSet.splitInstructionSet(instructionsString);
        InstructionSet.validateInstructionList(instructionList);

        this.instructionList = instructionList;
    }

    findInstruction(id, condition)
    {
        const result = this.instructionList.find(currentInstruction =>  id === currentInstruction.instructionId &&
                                                                        condition === currentInstruction.condition);
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
    static validateTapeInput(input)
    {
        var regex = /^( |(0|1)*)$/;
        return regex.test(input);
    }

    static initializeTape(input, tape)
    {   
        if(input === "")
        {
            return;
        }

        let head = new Head(tape);
        for(let index = 0; index < input.length - 1; index++)
        {
            head.write(input.charAt(index));
            head.moveRight();
        }
        head.write(input.charAt(input.length - 1));
    }

    constructor(input)
    {
        this.cellCount = 1;
        this.root = new Cell(null, null, 0);

        if(!Tape.validateTapeInput(input, this))
        {
            throw `This input: "${input}" is not valid!`;
        }
        Tape.initializeTape(input, this);
    }

    print()
    {
        const head = new Head(this);
        head.goToLeftEnd();

        let string = "" + head.read();
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
    constructor(left, right, serialNumber)
    {
        this.symbol = "0";
        this.left = left;
        this.right = right;
        this.serialNumber = serialNumber;
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
            this.currentCell.left = new Cell(null, this.currentCell, this.tape.cellCount);
            this.tape.cellCount++;
        }

        this.currentCell = this.currentCell.left;
    }

    moveRight()
    {
        if(this.isAtRightEnd())
        {
            this.currentCell.right = new Cell(this.currentCell, null, this.tape.cellCount);
            this.tape.cellCount++;
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
    constructor(input, instructions, initialInstructionId)
    {
        this.logger = new Logger();
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
        this.logger = [];
    }

    log(machine)
    {
    	const currentTapeState = machine.tape.print();
    	const currentInstruction = machine.currentInstruction;
    	const headCurrentIndex = machine.headCurrentIndex();
    	const newLogEntry = new LogEntry(currentTapeState, currentInstruction, headCurrentIndex);
        this.logger.push(newLogEntry);
    }

    lastEntry()
    {
        return this.logger[this.logger.length - 1];
    }
}

