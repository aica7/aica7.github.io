// Clock operations performed in JS
const clocks = document.querySelectorAll('.clock');

const drawLine = function(clockElement, handLength, lineStyle) {
    if (!clockElement || clockElement.tagName != 'svg'){return;}
    if (!clockElement.hasAttribute("width") || !clockElement.hasAttribute("height")){
        $(clockElement).attr('width', window.getComputedStyle(clocks[0]).width);
        $(clockElement).attr('height', window.getComputedStyle(clocks[0]).height);
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

function clockTextOffset(clockObj, iterNo, edgeOffset){
    // TODO: maybe throw an error?
    if (iterNo < 0 && iterNo > 11){return;}
    // The svg group containing the clock text is the second one
    const clockTextGroup = clockObj.getElementsByTagName("g")[0];
    const clockText = $(clockTextGroup).get(iterNo);

    const angle = ((2 * Math.PI) / 12) * (iterNo+3); // Offset by 3 to put 12 on top
    if (clockObj.hasAttribute('width') && clockObj.hasAttribute('height')){
        return new Promise((resolve) => {
            resolve( // The below is a `hack` as 12 is slightly offset to the right
                [(($(clockObj).attr('width')/2 - edgeOffset)*Math.cos(angle))
                 + (iterNo == 12 ? 3 : 0),
                 (($(clockObj).attr('height')/2 - edgeOffset)*Math.sin(angle))
                 + (iterNo == 12 ? -2 : 0)]
            )
        });
    }
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
    setInterval(async () => {
        const serverTzData = await serverTimezoneData();
        const clientTzData = await clientTimezoneData();
        const tzones = [serverTzData, clientTzData];

        let tagContainer = document.getElementById("clock-section")
            .getElementsByTagName("div")[1]
        let timeSections = tagContainer.querySelectorAll(".text-section");
        console.log(timeSections);
        // The order of the specific contents tags is important
        let now = Date.now();
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

// Initialise other clock visuals,
window.onload = function() {
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
            "stroke-width": "1px",
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
        
        // Creating and positioning the clock numbers
        var clockNumberGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        clock.appendChild(clockNumberGroup);
        async function addClockNumberText(group, iterNo){
            let edgeOffset = 7;
            var textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            const offset = await clockTextOffset(clock, iterNo, edgeOffset);
            $(textElement).attr({
                'fill': '#636363',
                'font-size': '11px',
                'font-family': 'Arial',
                'x': `${($(clock).attr('width')/2 - offset[0]) - 3}`,
                'y': `${($(clock).attr('height')/2 - offset[1]) + 2}`
            }).text(`${iterNo}`);
            $(group).append(textElement);
        }
        for (let i = 1; i < 13; i++){
            addClockNumberText(clockNumberGroup, i);
        }
        
        // Formatting the timezone data (TEST for now)
        formatTimezoneData();
        console.log("Done clock");
    });
}

// TODO: ALL BELOW ->
//
// If not available, hide clients clock and reposition aica clock
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
