#Browser Turing Machine

A pure JS implementation of a Turing Machine, particularly the one proposed by Walter Carnielli and Richard Epstein in ["Computable Functions, Logic, and the Foundations of Mathematics" ](https://www.amazon.com.br/Computability-Computable-Functions-Foundations-Mathematics/dp/098155072X/ref=dp_ob_title_bk) created as a study tool for me and my classmates in a graduate Computability course.

## How to run
It is all contained in a **single .html file**, so just open it with any web browser and you should be fine.

## How is this version of the Turing Machine implemented?

* There are only two available symbols (alphabet): 0's and 1's.
* Tape begins filled by 0's.
* Instructions are numbered using positive integers (including 0).
* Possible actions are: move left (L), move right (R), write 0 (0), write 1 (1).
* Instructions use the following convention: <Instruction Id>,<Read Symbol>,<Action>,<Next Instruction Id>, e.g. "12,0,R,10", which translates to: _Instruction number 12: if head reads 0, then move right and go to instruction number 10_.
* There can be two **different** instructions with the **same id (this is encouraged!), if and only if** they represent an _if/else_ clause, that is,  you could have one instruction with a given id that tells the machine what to do if it reads a 0 and **another** instruction with the **same id** that tells the machine what to do if it reads a 1. E.g. "2,0,L,3"; "2,1,R,3".
* Machine halts whenever current instruction points to an undefined instruction, e.g. When current instruction is "4,0,1,20", machine will halt because _instruction 20_ is not defined.

