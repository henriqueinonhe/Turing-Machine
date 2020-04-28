katchTestCount = 0;
katchPassCount = 0;
katchFailCount = 0;

function RUN_KATCH(testSuite)
{
    console.time("Katch - Tests Elapsed Time");
    testSuite();
    console.timeEnd("Katch - Tests Elapsed Time");
    console.log("Tests Summary: " + katchTestCount + " Pass: " + katchPassCount + " Fail: " + katchFailCount);
}

function CHECK(lhs, rhs)
{
    /* WEIRD CODE BEGIN 
     * The following piece of code is an aritificial way to 
     * overload the "CHECK" function, so it can 
     * either take two arguments and compare them
     * or take a single argument which is expected to be a
     * boolean.
     *
     * The reason it has been written this way 
     * is due to the necessity of quickly inspection of lhs and rhs values
     * when the assertion fails and it is not using boolean values.
     */
    rhs = rhs === undefined ? true : rhs;
    /* WEIRD CODE END */
    
    katchTestCount++;

    try
    {
        const testPass = eval(lhs + " === " + rhs);
        if(testPass)
        {
            katchPassCount++;
        }
        else
        {
            katchFailCount++;
            console.log(`Test number ${katchTestCount}, "CHECK(${lhs}, ${rhs}")" FAILED!
                         Failed with: "${eval(lhs)} === ${eval(rhs)}"`);
        }
    }
    catch(err)
    {
        console.log(`Test number ${katchTestCount}, "CHECK(${lhs}, ${rhs}")" has thrown an exception!
                     Thrown with: "${err}"`);
    }
}


function CHECK_NOTHROW(assertionString)
{
    katchTestCount++;

    try
    {
        eval(assertionString);
    }
    catch(err)
    {
        katchFailCount++;
        console.log(`Test number ${katchTestCount}, "CHECK_NOTHROW(${assertionString})"\n FAILED with exception: ${err}`);
        return;
    }

    katchPassCount++;
}

function CHECK_THROWS(assertionString)
{
    katchTestCount++;

    try
    {
        eval(assertionString);
    }
    catch(err)
    {
        katchPassCount++;
        return;
    }

    katchFailCount++;
    console.log(`Test number ${katchTestCount}, "CHECK_THROWS(${assertionString})" FAILED!`);
}
