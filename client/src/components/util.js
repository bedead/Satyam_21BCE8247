
export default function generateRandomUsername() {
    const adjectives = ["Swift", "Silent", "Mighty", "Brave", "Fierce"];
    const nouns = ["Tiger", "Eagle", "Shark", "Lion", "Wolf"];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;

    return `${randomAdjective}${randomNoun}${randomNumber}`;
}
