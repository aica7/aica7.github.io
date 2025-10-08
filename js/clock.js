// Clock operations performed in JS
const clocks = document.querySelectorAll('.clock');

const drawLine = function(clockElement, handLength, lineStyle) {
    console.log("in drawLine function");
    if (!clockElement || clockElement.tagName != 'svg'){return;}
    if (!clockElement.hasAttribute("width") || !clockElement.hasAttribute("height")){
        clockElement.width = window.getComputedStyle(clock).width;
        clockElement.height = window.getComputedStyle(clock).height;
    }
    var pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var innerCircle = (clocks[0]).querySelector("#inner-clock-circle");
    pathElement.setAttribute("d", `
        M${$(clockElement).attr('width')/2} ${$(clockElement).attr('height')/2 - $(innerCircle).attr('r')/2}      
        L${$(clockElement).attr('width')/2} ${handLength}
    `)
    Object.assign(pathElement.style, lineStyle);
    clockElement.getElementsByTagName("g")[0].appendChild(pathElement);
}   

// Initialise other clock visuals,
window.onload = function() {
    console.log("Initialising other clock visuals");
    console.log(clocks);
    clocks.forEach(clock => {
        const clockStyle = window.getComputedStyle(clock); // return object containing all CSS properties  
        const innerCircle = clock.querySelector("#inner-clock-circle");
        let width = clockStyle.width;
        
        // Initialise clock hands as paths relative to the top of the parent frame
        var analogClockHands = document.createElementNS("http://www.w3.org/2000/svg", "g");
        clock.appendChild(analogClockHands);
        var mainHandStyles = {
            fill: "none",
            stroke: "black",
            "stroke-width": "2px",
        }
        drawLine(
            clock, $(clock).attr('height')/2 - 40,
            {
                fill: "none",
                stroke: "red",
                "stroke-width": "1px",
            }
        )
        drawLine(
            clock, $(clock).attr('height')/2 - 40,
            mainHandStyles
        )
        drawLine( // Hour hand
            clock, $(clock).attr('height')/2 - 35,
            mainHandStyles
        )
        console.log("Done clock");
    });
}

function clientTimezoneData(){
    return new Promise((resolve) => {
        const dtformat = new Intl.DateTimeFormat();
        resolve(dtformat.resolvedOptions().timeZone);
    });
}

function serverTimezoneData(){
    return new Promise((resolve) => {
        const dtformat = new Intl.DateTimeFormat("en-GB");
        resolve(dtformat.resolvedOptions().timeZone);
    });
}

// Retrieve and format the timezone data on labels correctly
async function formatTimezoneData(){
    setTimeout(async () => {
        const serverTzData = await serverTimezoneData();
        const clientTzData = await clientTimezoneData();
        const tzones = [serverTzData, clientTzData];

        let timeSections = document.getElementById(
            "clock-section").querySelectorAll("#time-section");
        // The order of the specific contents tags is impor
        timeSections.forEach((timeSection, i) => {
            timeSection.textContent = `${
                new Intl.DateTimeFormat("en-GB", {
                    timeZone: tzones[i],
                    weekday: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }).format(now)
            }`
        })
    }, 1000);
}

// TODO: ALL BELOW ->
//
// Add in the inner circle svg and respective clock hand as path element tags
//
// Retrieve the time local time for aica
//
// Attempt to retrieve the clients timezone
//
// If not available, hide clients clock and reposition aica clock
//
// Write the numbers on each clock at fixed interval positions around frame
//
// Write the time in 24 hour format below each clock
//
// Apply initial transform values to the second hand to the location it needs to be at
//
// Await new user aica time and fetch new client time from async every second
//
// Update the 24 hour time format text at the bottom
//
// Transform the second hand by 1/60th of amount of the frame every second
//
// Transform the minute hand by 1/3600th of amount of the frame every second
//
// Transform the hour hand by 1/43200 of amount of the frame every second
