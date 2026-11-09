const fs = require('fs');
import('./src/modules/onboarding/workoutMatcher.js').then(module => {
    const { generateStaticTreino } = module;
    fs.writeFileSync('local_out.json', JSON.stringify(generateStaticTreino({ objetivo: 'perda_gordura' }, 3, 'Academia'), null, 2));
    console.log("SUCCESS");
}).catch(e => {
    console.error(e);
});
