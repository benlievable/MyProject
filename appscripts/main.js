//  Assignment 3
// Benjamin Oh Ren Hao A0125515
// Lim Jing Wen A0115432U

/* 
Notes:
The game has background audio + click audio (and method may be different from what is taught in class 
since it was used before the tutorial class).

Background formatting and Custom Cursor in CSS

Designed/editted images were used instead of rectangle and text since we find images most efficient and we have 
more control over design/content.
 -> In addition, if we were to use raphael rect and text, we will need to addEventListener seperately as well

The game's highscore is based on highest number of click. 
 -> The level indicated before is tell users in which level they clicked that many times
*/

/* DIRECTORY

    LOADING OF IMAGES + CAT'S DOT (That the cat paws on)
    MATH FORMULAS
    DRAW GAME DOT
    TIME + HIGHSCORE DEFAULT SETTINGS
    CLICK COUNTER
    INSTRUCTIONS + SET LEVEL + CURRENT LEVEL + HIGH SCORE
    MOVE DOT FUNCTION
    GAME STATES AND BLINKING FUNCTIONS
    BUTTON EVENT LISTENERS 
    AUDIO
    MOVING CAT
*/

require(
   // Use this library to "fix" some annoying things about Raphel paper and graphical elements:
    //     a) paper.put(element) - to put an Element created by paper back on a paper after it has been removed
    //     b) call element.addEventListener(...) instead of element.node.addEventListner(...)
    ["../jslibs/raphael.lonce"],  // include a custom-built library
    function () {
            
        console.log("yo, I'm alive!");


        var paper = new Raphael(document.getElementById("mySVGCanvas"));

        var pWidth = paper.canvas.offsetWidth;
        var pHeight = paper.canvas.offsetHeight;
        console.log("pWidth is " + pWidth + ", and pHeight is " + pHeight);
        


        //==================================================================
        // LOADING OF IMAGE + CAT'S DOT (That the cat paws on)
        //==================================================================

        var bgimg = paper.image("images/gamebackground.jpg", 0, 0, pWidth, pHeight);
        
        // Has to be called before the paw so that the paw will appear on top of it
        var catdot = paper.circle(410,135,10).attr({"fill":"red", "stroke-width":"0"});
        var cat = paper.image("images/cathead.png", 20, -20, 315, 205.5);
        var catpaw = paper.image("images/catpaw.png", 400, -40, 64, 151);
        
        // Usage of image button rather than raphael rectangles for design purposes
        var startbutton = paper.image("images/play3.png", 80, 220, 205, 59.5);
        var setlevelbutton = paper.image("images/setlevel3.png", 80, 270, 205, 59.5);
        var helpbutton = paper.image("images/help3.png", 80, 320, 205, 59.5);

        // Status box in which game details can be displayed
        var statusbox = paper.image("images/statusbox.png", 385, 200, 197.5, 177);

        var gameTitle = paper.text(185, 205, "KITTY'S LASER CHASE").attr({"font-size":"25px", "font-weight": "bold", "fill":"white"});

        //==================================================================
        // MATH FORUMULAS 
        //==================================================================

        // Random Integer:
        // This is used to generate random x and y positions
        var randInt = function(m,n) {
            var range = n-m+1;
            var frand = Math.random()*range;
            return m+Math.floor(frand);
        }

        // Pythagoras Theorem:
        // This is used to calculate animation duration timing to ensure constant speed
        var pythagorasTheorem = function (xold,xnew,yold,ynew){
            var differenceinX = Math.abs(xold - xnew);
            var differenceinY = Math.abs(yold - ynew);
            var squareXY = differenceinX*differenceinX+differenceinY*differenceinY;
            var rootsquareXY = Math.sqrt(squareXY);
            return rootsquareXY;
        }


        //==================================================================
        // DRAW GAME DOT
        //==================================================================

        var dot = paper.circle(pWidth/2, pHeight/2,25);
            dot.attr({
                "fill":"red",
                "stroke-width":"0"
                });

        // Initial position of the dot
        dot.xpos = pWidth/2;
        dot.ypos = pHeight/2;

        // Dot to be hidden at start of game
        dot.hide(); 


        //==================================================================
        // TIME + HIGHSCORE DEFAULT SETTINGS
        //==================================================================

        var maxTime = 10000; // Using ms instead of seconds to be precise
        var starttime; // starting time
        var nowtime; // current time
        var passedtime; // how much time has passed
        
        // used for displaying highscore 
        var highscore = 0;

        //==================================================================
        // CLICK COUNTER
        //==================================================================
        
        var count = 0;        

        // on click = add 1  so as to keep count of clicks
        dot.addEventListener('click', function(){
            count = count + 1;
        });


        //==================================================================
        // INSTRUCTIONS + SET LEVEL + CURRENT LEVEL + HIGH SCORE
        //==================================================================
        
        var instructions = function(){
            alert("Welcome to the Kitty's Laser Chase!\n\n-How to play?-\nHelp Kitty to click the red laser dot as many times as you can within 10 seconds!\n\nTo start the game, press the “Play” button.\nTo set the difficulty, press the “Set Level” button.\nTo see the instructions again, press the “Help” button.\n\nDefault level is set at Level 1.");
        };

        // so that instructions are displayed automatically
        instructions();

        var difficultyLevel = 1;

        function levelInput() {
            var level = prompt("Here are the available levels:\n\nLevel 1: Easy\nLevel 2: Normal\nLevel 3: Hard\nLevel 4: Extreme\nLevel 5: Insane\n\nPlease input your choice of level:", "Enter only either 1, 2, 3, 4, or 5");
            
            if (level!= null) {
                difficultyLevel = Number(level);
                console.log("User has inputed difficulty level: " + difficultyLevel);
                    
                    // This checks that the converted string is 1-5, otherwise will inform user it's wrong
                    // and prompt again to enter by calling the function levelInput again
                    // Also change text of currentLevel object so that users can see the difficulty value on screen
                    if (difficultyLevel>0 && difficultyLevel<6) {
                        alert("Level set to: "+ difficultyLevel);
                        currentLevel.attr({text: "Level "+difficultyLevel});
                    }
                    else {
                        alert("You did not input a correct level. Please try again!");
                        levelInput();
                    }
            }

            // This else statement is used to avoid users pressing cancel when setting the level
            // It forces them inside the loop until they input a correct level.

            // It also avoids another situation whereby users enter a letter or other text that is not 
            // acceptable as difficulty level, and presses cancel when reprompted again by the loop. 

            // If the above situation does happen, the game would not be able to proceed
            // because it has already took in that variable (which is not a number) as difficultyLevel, 
            // and this would cause problems in the game. Thus it is necessary.
            else {
                levelInput();
            }
        }

        // To be manipulated when user change level
        var currentLevel = paper.text(485, 290, "Level "+difficultyLevel).attr({'font-size':'15px', "font-weight": "bold"});
        
        // To be manipulated when user beat last highscore at function gameEnd
        var currentHighScore = paper.text(485, 350, highscore).attr({'font-size':'15px', "font-weight": "bold"});

        //==================================================================
        // MOVE DOT FUNCTION               Usage of Date.now() + setTimeout
        //==================================================================

        var draw = function (){
 
            nowtime=Date.now();
            passedtime = (nowtime - starttime);
            console.log("The total passed time right now is: "  + passedtime);

            // Old set of xpos and ypos required for calculation in Pythagoras thorem; thus passing
            // of value to another variable before rantInt is used to calculate random position
            dot.oldxpos = dot.xpos
            dot.oldypos = dot.ypos
            dot.xpos = randInt(0,pWidth);
            dot.ypos = randInt(0,pHeight);



            // Usage of pythagoras theorem multiplied by constant number to get a 
            // time value for animation that will ensure constant speed regardless of position.
            // It is further divded by difficult level that will increase time value to make it faster/slower
            dot.timevalue = pythagorasTheorem(dot.oldxpos,dot.xpos,dot.oldypos,dot.ypos)*10/difficultyLevel
            dotanimation = Raphael.animation({cx: dot.xpos, cy: dot.ypos}, dot.timevalue);
            


            // If statements are used to determine if the function runs again to place the dot 
            // at random position or stop at 10 seconds
            // Adding passedtime and dot.timevalue lets us know total time required to ensure the dot
            // reach its final position.            
            if ((passedtime+dot.timevalue)<maxTime){
                dot.animate(dotanimation);
                setTimeout(draw,dot.timevalue); 
            }


            // In this case, if the passed time + time required to reach final position is more than max time,
            // a new variable, remainingTime, is created so that we know how long before 10 seconds is up and
            // when to cut the ongoing animation using setTimeout

            if ((passedtime+dot.timevalue)>maxTime) {
                var remainingTime = maxTime-passedtime;
                passedtime = passedtime + remainingTime;
                dot.animate(dotanimation);
                setTimeout(gameEnd, remainingTime);           
            }
        }


        //==================================================================
        // GAME STATES AND BLINKING FUNCTIONS        setTimeout + setInterval
        //==================================================================   
        
        // This function makes the dot appear and disappear with the use on setTimeout
        var blinkingdot = function(){
        setTimeout(function(){dot.show()}, 300);
        setTimeout(function(){dot.hide()}, 1300);
        };

        // Game Start Function
        var gameStart = function (){

            cat.hide();
            catpaw.hide();
            catdot.hide();
            statusbox.hide();
            currentHighScore.hide();
            startbutton.hide();
            setlevelbutton.hide();
            helpbutton.hide();
            currentLevel.hide();
            gameTitle.hide();

            catAudio.play();
            starttime = Date.now();
            dot.show();
            draw();
            console.log("Game has started!");


            // This increases the difficult of the game by making dot appear/disappear at set interval
            if (difficultyLevel>=3){
                blinkingInterval = setInterval(blinkingdot,1500);
                console.log("Dot is appearing and disappearing");
            }                
        };

        // Game End function
        var gameEnd = function (){
            dot.stop();
            catAudio.play();

            if (difficultyLevel>=3){
                clearInterval(blinkingInterval);
            } 

            console.log("The total passed time right now is: "  + passedtime);
            alert("Game has ended!\nYou have clicked... " + count + " time(s)!")

            // done so to set location back to intiial position
            dot.xpos = pWidth/2;
            dot.ypos = pHeight/2;
            dotanimation = Raphael.animation({cx: dot.xpos, cy: dot.ypos}, 1);
            dot.animate(dotanimation);
            dot.hide();

            cat.show();
            catpaw.show();
            catdot.show();
            statusbox.show();
            currentHighScore.show();
            startbutton.show();
            setlevelbutton.show();
            helpbutton.show();
            currentLevel.show();
            gameTitle.show();
            
            // if statement to calcualte if highscore is broken; and if so, will make changes to currentHighscore object
            // so that users can see on screen. Users are also alerted if they beat the highscore
            if (count>highscore){
                highscore=count;
                currentHighScore.attr({text: "Level " + difficultyLevel + ": " + highscore + " clicks"});
                alert("You have beat the last high score!")
            };

            // Reset to 0 so that game can be played again
            passedtime=0;
            count=0            
        }  


        //==================================================================
        // BUTTON EVENT LISTENERS                      
        //==================================================================

        // to start the game
        startbutton.addEventListener('click', gameStart);

        // to provide users the option to change level 
        setlevelbutton.addEventListener('click', levelInput);
        
        // added in case users may want to see the instructions/help again
        helpbutton.addEventListener('click', instructions);

        
        //==================================================================
        // AUDIO                      
        //==================================================================

        var catAudio = new Audio('sound/meowsound.mp3');
        //var bgmusic = new Audio('sound/myaudio.mp3');
        
        var bgmusic = new Audio('sound/backgroundmusic.wav')
        bgmusic.play();
        bgmusic.loop = true;

        //==================================================================
        // MOVING CAT                    
        //==================================================================
        // Used to make cat move
        var movingCat = function(){

            setTimeout(function(){catpaw.animate({y:0},500)}, 0);
            setTimeout(function(){catpaw.animate({x:390},100)}, 500);
            setTimeout(function(){catpaw.animate({x:410},100)}, 600);
            setTimeout(function(){catpaw.animate({y:-40},500)}, 700);

            setTimeout(function(){cat.animate({transform: "r" + -4}, 400)}, 0);
            setTimeout(function(){cat.animate({transform: "r" + 4}, 800)}, 400);
        }

        // So as for cat to move once it's loaded instead having to wait 3seconds
        movingCat();
        setInterval(movingCat, 3000);
    }
        
);    

