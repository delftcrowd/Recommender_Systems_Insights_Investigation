
const videoStripeWidth = 2720;
//Yellow
const user1ShapeStartPos = {
    day1Midnight: [23600, 3900],
    day2Midnight: [23600, -3800],
    day3Midnight: [23600, -11400],

    day1Morning: [42465, 3900],
    day2Morning: [42465, -3800],
    day3Morning: [42465, -11400],

    day1Afternoon: [61385, 3900],
    day2Afternoon: [61385, -3800],
    day3Afternoon: [61385, -11400],

    day1DinnerTime: [80365, 3900],
    day2DinnerTime: [80365, -3800],
    day3DinnerTime: [80365, -11400],

    day1LateNight: [99295, 3900],
    day2LateNight: [99295, -3800],
    day3LateNight: [99295, -11400]
};
//Gray
const user2ShapeStartPos = {
    day1Midnight: [23600, 7700],
    day2Midnight: [23600, 25],
    day3Midnight: [23600, -7625],
    day1Morning: [42465, 7700],
    day2Morning: [42465, 25],
    day3Morning: [42465, -7625],
    day1Afternoon: [61385, 7700],
    day2Afternoon: [61385, 25],
    day3Afternoon: [61385, -7625],
    day1DinnerTime: [80365, 7700],
    day2DinnerTime: [80365, 25],
    day3DinnerTime: [80365, -7625],
    day1LateNight: [99295, 7700],
    day2LateNight: [99295, 25],
    day3LateNight: [99295, -7625]
};
//Yellow 16300
const stage4User1StartPos = {
    day1Midnight: [45100, 37400],
    day1Morning: [61400, 37400],
    day1Afternoon: [78300, 37400],
    day1DinnerTime: [94600, 37400],
    day1LateNight: [112000, 37400]
};

const stage4User2StartPos = {
    day1Midnight: [45100, 28900],
    day1Morning: [61400, 28900],
    day1Afternoon: [78300, 28900],
    day1DinnerTime: [94600, 28900],
    day1LateNight: [112000, 28900],
};
//42728.79073502525, 41492.80111282495, 40256.81149062466

function text (title){
    return {
        type: 'text',
        data: {content: title},
        style: {fillColor: '#FF0000', color: '#0000FF'}
    }
   
}
//let morningText = text(timeGroups[timeGroup]['title']);

function categorizeActivities(jsonData, userGroup) {
    let shapeStartPos;
    const categories = {
        day1Midnight: [],
        day1Morning: [],
        day1Afternoon: [],
        day1DinnerTime: [],
        day1LateNight: [],
        
        day2Midnight: [],
        day2Morning: [],
        day2Afternoon: [],
        day2DinnerTime: [],
        day2LateNight: [],
        
        day3Midnight: [],
        day3Morning: [],
        day3Afternoon: [],
        day3DinnerTime: [],
        day3LateNight: [],
        
    };
    if (userGroup == 1){
        shapeStartPos = user1ShapeStartPos;
    }else{
        shapeStartPos = user2ShapeStartPos;
    }
    //const now = new Date('2024-05-20T12:00:00Z');// This date is only for test
    const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    const day1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
    const day2 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
    const day3 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));

    let day1Videos = [];
    const isSameDay = (date1, date2) => {
        return date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate();
    };
  
    const getTimeCategory = (hours, minutes) => {
        if (hours >= 0 && hours < 6) return 'Midnight';
        if (hours >= 6 && (hours < 12 || (hours === 12 && minutes < 30))) return 'Morning';
        if ((hours === 12 && minutes >= 30) || (hours > 12 && hours < 18)) return 'Afternoon';
        if (hours >= 18 && (hours < 21 || (hours === 21 && minutes < 30))) return 'DinnerTime';
        if ((hours === 21 && minutes >= 30) || (hours > 21 && hours < 24)) return 'LateNight';
        
    };
  
    jsonData.forEach(item => {
        const activityDate = new Date(item.time);
        const hours = activityDate.getUTCHours();
        const minutes = activityDate.getUTCMinutes();
        const timeCategory = getTimeCategory(hours, minutes);
        const dayCategory = isSameDay(activityDate, day1) ? 'day1' :
            isSameDay(activityDate, day2) ? 'day2' :
                isSameDay(activityDate, day3) ? 'day3' : null;
        //console.log(`Activity Date: ${activityDate}, Day Category: ${dayCategory}, Time Category: ${timeCategory}`);
        if (dayCategory) {
            const key = `${dayCategory}${timeCategory}`;
            
            // Get the starting positions for text and shape
            let [shapeX, shapeY] = shapeStartPos[key];
        
            // Decrement y-coordinate for each new video in the same period
            const decrement = categories[key].length * videoStripeWidth; // Difference between successive y-coordinates
            shapeX += decrement;
        
            let fontSize = 12;  // Replace with actual fontSize calculation logic
            const videoText = new VideoText(item.title, key, fontSize, shapeX, shapeY, hours, minutes);
            categories[key].push(videoText);
            }

    });
    return categories;
}



function stage4CategorizeActivities(jsonData, userGroup, days) {
    let shapeStartPos;
    const categories = {
        day1Midnight: [],
        day1Morning: [],
        day1Afternoon: [],
        day1DinnerTime: [],
        day1LateNight: [],    
    };
    if (userGroup == 1){
        shapeStartPos = stage4User1StartPos;
    }else{
        shapeStartPos = stage4User2StartPos;
    }
    //const now = new Date('2024-05-20T12:00:00Z');// This date is only for test
    const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days));


    let day1Videos = [];
    const isSameDay = (date1, date2) => {
        return date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate();
    };
  
    const getTimeCategory = (hours, minutes) => {
        if (hours >= 0 && hours < 6) return 'Midnight';
        if (hours >= 6 && (hours < 12 || (hours === 12 && minutes < 30))) return 'Morning';
        if ((hours === 12 && minutes >= 30) || (hours > 12 && hours < 18)) return 'Afternoon';
        if (hours >= 18 && (hours < 21 || (hours === 21 && minutes < 30))) return 'DinnerTime';
        if ((hours === 21 && minutes >= 30) || (hours > 21 && hours < 24)) return 'LateNight';
        
    };
  
    jsonData.forEach(item => {
        const activityDate = new Date(item.time);
        const hours = activityDate.getUTCHours();
        const minutes = activityDate.getUTCMinutes();
        const timeCategory = getTimeCategory(hours, minutes);
        const dayCategory = isSameDay(activityDate, day) ? 'day1' : null;
        //console.log(`Activity Date: ${activityDate}, Day Category: ${dayCategory}, Time Category: ${timeCategory}`);
        if (dayCategory) {
            const key = `${dayCategory}${timeCategory}`;

            if (categories[key].length < 6){
                // Get the starting positions for text and shape
                let [shapeX, shapeY] = shapeStartPos[key];
            
                // Decrement y-coordinate for each new video in the same period
                const decrement = categories[key].length * videoStripeWidth; // Difference between successive y-coordinates
                shapeX += decrement;
            
                let fontSize = 12;  // Replace with actual fontSize calculation logic
                const videoText = new VideoText(item.title, key, fontSize, shapeX, shapeY, hours, minutes);
                
                categories[key].push(videoText);
            }
            
        }

    });
    return categories;
}
class VideoText{
    constructor(title, timeGroup, fontSize, shapeX, shapeY, hour, minute) {
        this.title = title;
        this.timeGroup = timeGroup;
        this.fontSize = fontSize;
        this.shapeX = shapeX;
        this.shapeY = shapeY;
        this.hour = hour;
        if (minute == 0){
            this.minute = minute + '0';
        }else{
            this.minute = minute;
        }
        
    }
}

export {categorizeActivities, text, stage4CategorizeActivities};