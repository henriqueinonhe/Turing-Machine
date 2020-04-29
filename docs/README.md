#Code Structure

The core class in this project is the **Machine** class, representing a Turing Machine.

A **Machine** is composed of 5 elements:

1. Tape
2. Head
3. InstructionSet
4. Current Instruction
5. Logger

Each of these elements is represented by a class.

As the machine runs it updates its internal state (tape, head, current instruction) and also logs it, so previous states are stored and accessible via the logger.

##Tape

The tape is implemented as a **doubly linked list** of **cells**, represented by the **Cell** class.

##Head

The head acts much like an iterator, however each Machine possesses a single head which is used to traverse throughout the tape.

It also reads and writes to the tape.

##Instruction Set

The instruction set is basically an array of instructions (not actually implemented as a set, strictly speaking) which guarantees that no two instructions within the set collide.

Instruction collision has a very precise meaning in the context of Turing Machines, where two instructions actually **can** bear the same id, as long as they deal with different cases (symbols).

##Current Instruction 

The instruction currently being executed by the Machine.

##Logger

Each time the Machine updates its state (by executing an instruction) the logger records the the current state of the machine for further inspection.