// Clock operations performed in JS
const clocks = document.querySelectorAll('.clock');

const createLine = function(clockElement, handLength, lineStyle) {
    if (!clockElement || clockElement.tagName != 'svg'){return;}
    if (!clockElement.hasAttribute("width") || !clockElement.hasAttribute("height")){
        $(clockElement).attr('width', window.getComputedStyle(clocks[0]).width);
        $(clockElement).attr('height', window.getComputedStyle(clocks[0]).height);
    }
    const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const innerCircle = (clocks[0]).querySelector("#inner-clock-circle");
    pathElement.setAttribute("d", `
        M${$(clockElement).attr('width')/2} ${$(clockElement).attr('height')/2}      
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
    const serverTzData = await serverTimezoneData();
    const clientTzData = await clientTimezoneData();
    const tzones = [serverTzData, clientTzData];

    let tagContainer = document.getElementById("clock-section")
        .getElementsByTagName("div")[1]
    let timeSections = tagContainer.querySelectorAll(".text-section");
    // The order of the specific contents tags is important
    let now = Date.now();
    timeSections.forEach((timeSection, i) => {
        timeSection.textContent = `${
            new Intl.DateTimeFormat("en-GB", {
                timeZone: tzones[i],
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(now)
        }`
    })
}

// Transform the clock hands to their specified positions after receiving time data
function transformClockHands(){
    // Initial transform for all three hands
    clocks.forEach(clock => {
        // Get the initial position of each clock hand
        const analogHandGroup = clock.getElementsByTagName("g")[0];
        const analogHandPaths = analogHandGroup.getElementsByTagName("path");             
        // Set the intervals of each clock hand with their specific angles
        $(analogHandPaths[0]).css('transform-origin', '50% 100%');
        $(analogHandPaths[1]).css('transform-origin', '50% 100%');
        $(analogHandPaths[2]).css('transform-origin', '50% 100%');
        setInterval(() => {
            let date = new Date();
            const hour = date.getHours();
            const minute = date.getMinutes();
            const second = date.getSeconds();
            $(analogHandPaths[0]).css('transform', `
                rotate(${(2*Math.PI/60)*second}rad)
            `);
            $(analogHandPaths[1]).css('transform', `
                rotate(${(2*Math.PI/60)*minute + (2*Math.PI/3600)*second}rad)
            `);
            const secondsInHour = (Date.now()/1000 % (60*60*24)) % 3600;
            $(analogHandPaths[2]).css('transform', `
                rotate(${(2*Math.PI/12)*(hour) + (2*Math.PI/12/60/60)*(secondsInHour)}rad)
            `);
        }, 1000);
    });
}

// Initialise other clock visuals,
window.onload = function() {
    clocks.forEach(clock => {
        const clockStyle = window.getComputedStyle(clock); // return object containing all CSS properties  
        const innerCircle = clock.querySelector("#inner-clock-circle");
        const width = clockStyle.width;
        
        // Initialise clock hands as paths relative to the top of the parent frame
        const analogClockHands = document.createElementNS("http://www.w3.org/2000/svg", "g");
        clock.appendChild(analogClockHands);
        const mainHandStyles = {
            fill: "none",
            stroke: "black",
            "stroke-width": "1px",
        }
        createLine( // Second hand
            clock, $(clock).attr('height')/2 - 42,
            {
                fill: "none",
                stroke: "red",
                "stroke-width": "1px",
            }
        )
        createLine( // Minute hand
            clock, $(clock).attr('height')/2 - 42,
            mainHandStyles
        )
        createLine( // Hour hand
            clock, $(clock).attr('height')/2 - 37,
            mainHandStyles
        )
        
        // Creating and positioning the clock numbers
        const clockNumberGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        clock.appendChild(clockNumberGroup);
        async function addClockNumberText(group, iterNo){
            const edgeOffset = 7;
            const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
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
    });
    // Formatting the timezone data
    formatTimezoneData();
    setInterval(() => {
        formatTimezoneData();
    }, 1000)
    // Position clock hands and set rotate event
    transformClockHands();
    console.log("Done clock");
}
