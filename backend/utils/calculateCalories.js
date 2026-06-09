const MET_VALUES = {
    running: 9.8,   
    cycling: 7.5,  
    walking: 3.5,  
    hiking: 6.0,   
    swimming: 8.0,   
    rowing: 7.0,       
    hiit: 10.0         
};

const calculateCalories = (type, duration, weight) => {
    const met = MET_VALUES[type.toLowerCase()] || 5;

      return Math.round(
        met * weight * (duration / 60)
    );
};


export default calculateCalories;